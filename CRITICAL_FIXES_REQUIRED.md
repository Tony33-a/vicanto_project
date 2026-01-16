# CORREZIONI CRITICHE NECESSARIE - ViCanto Backend

## ⚠️ STATO: NON PRONTO PER PRODUZIONE

L'analisi approfondita ha identificato **20 problemi** di cui **6 CRITICI** che DEVONO essere risolti prima del deploy in produzione.

---

## PRIORITY 1 - CRITICI (Fix entro 48h)

### 1. ✅ PARZIALMENTE CORRETTO: Transazioni Database

**Problema**: Order + Table + PrintQueue non sono atomici - se uno fallisce, gli altri rimangono committed.

**Impatto**: Ordini "sent" senza job in print_queue = non stampano mai.

**Correzione APPLICATA**:
- ✅ `orderController.js` createOrder ora usa transazione
- ✅ `orderController.js` sendOrder ora usa transazione
- ⚠️  **DA FARE**: Aggiungere parametro `trx` a tutti i metodi Model:
  - Order.create(data, trx)
  - Order.send(id, trx)
  - Order.findById(id, trx)
  - Table.setPending(id, covers, total, trx)
  - Table.setOccupied(id, covers, total, trx)
  - PrintQueue.create(orderId, printerName, trx)

**Codice da aggiungere in ogni Model method**:
```javascript
// Esempio in Order.create:
static async create(orderData, trx = null) {
  const dbContext = trx || db;  // Usa transazione se fornita, altrimenti db normale

  const [order] = await dbContext(this.tableName)
    .insert({...})
    .returning('*');

  // Resto del codice usa dbContext invece di db
}
```

**File da modificare**:
- `backend/models/Order.js` - Tutti i metodi (create, send, complete, cancel, findById)
- `backend/models/Table.js` - setPending, setOccupied, free
- `backend/models/PrintQueue.js` - create

---

### 2. ❌ DA IMPLEMENTARE: Print Job Locking

**Problema**: Due istanze QueueWatcher possono stampare lo stesso ordine simultaneamente.

**Scenario**:
```
T1: Instance-1 fetch Job#5 (status=pending)
T2: Instance-2 fetch Job#5 (STESSO job, still pending)
T3: Instance-1 prints → markPrinted
T4: Instance-2 also prints → DUPLICATO!
```

**Correzione**: Aggiungere `setPrinting()` PRIMA di processare job.

**File**: `backend/services/QueueWatcher.js` linea 135

**Codice da modificare**:
```javascript
// PRIMA (SBAGLIATO):
async processJob(job) {
  const order = await Order.findById(job.order_id);
  await this.printService.printOrder(order);  // Altre istanze possono fare lo stesso
  await PrintQueue.markPrinted(job.id);
}

// DOPO (CORRETTO):
async processJob(job) {
  try {
    // ATOMIC LOCK: Set status to 'printing' BEFORE fetching order
    const lockedJob = await PrintQueue.setPrinting(job.id);
    if (!lockedJob) {
      // Job già preso da altra istanza o fallito
      return;
    }

    const order = await Order.findById(job.order_id);
    await this.printService.printOrder(order);
    await PrintQueue.markPrinted(job.id);
  } catch (error) {
    // Error handling...
  }
}
```

**PrintQueue.setPrinting() da implementare**:
```javascript
// backend/models/PrintQueue.js
static async setPrinting(id) {
  // Update ONLY if status is still 'pending' (ottimistic locking)
  const [job] = await db(this.tableName)
    .where({ id, status: 'pending' })  // WHERE clause critica!
    .update({
      status: 'printing',
      started_at: db.fn.now()
    })
    .returning('*');

  return job;  // null se già processing da altra istanza
}
```

---

### 3. ✅ PARZIALMENTE CORRETTO: Socket.IO Error Handling

**Problema**: Eventi Socket.IO possono fallire silenziosamente.

**Correzione APPLICATA**:
- ✅ `orderController.js` ora ha try-catch su emitOrderNew/emitTableUpdate
- ✅ Log di warning se Socket.IO non disponibile

**DA FARE**: Aggiungere try-catch in `socket/events.js`

**File**: `backend/socket/events.js`

**Codice da modificare** (applica a TUTTE le 9 funzioni):
```javascript
// PRIMA:
const emitTableUpdate = (io, table) => {
  io.to('monitor').emit('table:updated', table);
  io.to('tablets').emit('table:updated', table);
  console.log(`📤 Event emitted: table:updated`);
};

// DOPO:
const emitTableUpdate = (io, table) => {
  try {
    if (!io) {
      console.warn('⚠️  Socket.IO not available - cannot emit table:updated');
      return false;
    }

    io.to('monitor').emit('table:updated', table);
    io.to('tablets').emit('table:updated', table);
    console.log(`📤 Event emitted: table:updated (Table #${table.number})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to emit table:updated:`, error.message);
    // TODO: Send to monitoring system (Sentry, etc.)
    return false;
  }
};
```

---

### 4. ❌ DA IMPLEMENTARE: QueueWatcher Reconnection Logic

**Problema**: Se backend server riavvia, QueueWatcher perde connessione Socket.IO e eventi `print:success/failed` non arrivano ai client.

**File**: `backend/services/QueueWatcher.js`

**Codice da aggiungere** (linea 66, nel metodo `connectSocket`):
```javascript
async connectSocket() {
  try {
    this.socket = io(this.config.socketURL, {
      auth: { token: this.config.authToken },
      reconnection: true,           // AGGIUNGI
      reconnectionDelay: 1000,      // AGGIUNGI
      reconnectionAttempts: Infinity // AGGIUNGI
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connesso per emit eventi stampa');
      this.isSocketConnected = true;  // AGGIUNGI flag
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('⚠️  Socket.IO disconnesso:', reason);
      this.isSocketConnected = false;  // AGGIUNGI flag

      // Riconnessione automatica se server ha chiuso
      if (reason === 'io server disconnect') {
        console.log('🔄 Riconnessione manuale...');
        this.socket.connect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Socket.IO riconnesso dopo ${attemptNumber} tentativi`);
      this.isSocketConnected = true;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Errore riconnessione Socket.IO:', error.message);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Errore connessione Socket.IO:', error.message);
      this.isSocketConnected = false;
    });

  } catch (error) {
    console.error('❌ Errore setup Socket.IO:', error.message);
    this.isSocketConnected = false;
  }
}
```

**E modificare emit events** (linee 154-160):
```javascript
// PRIMA:
if (this.socket && this.socket.connected) {
  const updatedJob = await PrintQueue.findById(job.id);
  this.socket.emit('print:success', updatedJob);
}

// DOPO:
if (this.socket && this.socket.connected && this.isSocketConnected) {
  try {
    const updatedJob = await PrintQueue.findById(job.id);
    this.socket.emit('print:success', updatedJob);
    console.log(`📤 Emitted print:success for Order #${job.order_id}`);
  } catch (emitError) {
    console.error(`❌ Failed to emit print:success:`, emitError.message);
    // Non bloccare il processo - job è stampato correttamente
  }
} else {
  console.warn(`⚠️  Cannot emit print:success - Socket disconnected (Order #${job.order_id})`);
  // TODO: Salvare evento in queue per retry quando riconnette
}
```

---

### 5. ❌ DA IMPLEMENTARE: Printer State Monitoring

**Problema**: Stampante può andare offline durante operazione (WiFi drop, carta finita, etc.) ma QueueWatcher non lo rileva.

**File**: `backend/services/QueueWatcher.js`

**Codice da aggiungere** (nel metodo `start`, dopo linea 114):
```javascript
async start() {
  // ... codice esistente ...

  this.isRunning = true;
  this.poll();

  // AGGIUNGI: Monitoring periodico stampante
  this.startPrinterMonitoring();

  console.log(`✅ QueueWatcher avviato`);
}

// NUOVO METODO:
startPrinterMonitoring() {
  // Controlla stato stampante ogni 30 secondi
  this.printerMonitorInterval = setInterval(async () => {
    if (this.config.mockMode) return;  // Skip in mock mode

    try {
      const isOnline = await this.printService.initialize();

      if (!isOnline && this.lastPrinterState !== false) {
        // Stampante appena andata offline
        console.error('🚨 ALERT: Stampante OFFLINE!');

        // Emit evento ai client
        if (this.socket && this.socket.connected) {
          this.socket.emit('printer:offline', {
            timestamp: new Date().toISOString(),
            message: 'Stampante non raggiungibile'
          });
        }

        this.lastPrinterState = false;
      } else if (isOnline && this.lastPrinterState === false) {
        // Stampante tornata online
        console.log('✅ Stampante tornata ONLINE');

        if (this.socket && this.socket.connected) {
          this.socket.emit('printer:online', {
            timestamp: new Date().toISOString()
          });
        }

        this.lastPrinterState = true;
      }

    } catch (error) {
      console.error('❌ Errore monitoring stampante:', error.message);
    }
  }, 30000); // 30 secondi
}
```

**E nel metodo `stop()`**:
```javascript
async stop() {
  // ... codice esistente ...

  // Ferma monitoring stampante
  if (this.printerMonitorInterval) {
    clearInterval(this.printerMonitorInterval);
    this.printerMonitorInterval = null;
  }

  // ... resto codice ...
}
```

---

### 6. ❌ DA IMPLEMENTARE: DB Connection Blocking Validation

**Problema**: Server parte PRIMA che DB sia pronto → prime richieste falliscono.

**File**: `backend/services/database.js`

**Codice da modificare** (linea 15):
```javascript
// PRIMA (NON BLOCCANTE):
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Database connection established');
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message);
    // Server continua comunque! ❌
  });

// DOPO (BLOCCANTE):
async function validateDatabaseConnection() {
  const maxRetries = 5;
  const retryDelay = 3000; // 3 secondi

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await db.raw('SELECT 1');
      console.log('✅ Database connection established successfully');
      return true;
    } catch (error) {
      console.error(`❌ Database connection attempt ${attempt}/${maxRetries} failed:`, error.message);

      if (attempt === maxRetries) {
        console.error('🚨 FATAL: Could not connect to database after max retries');
        process.exit(1);  // BLOCCA avvio server
      }

      console.log(`⏳ Retrying in ${retryDelay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

// Export per uso in server.js
module.exports.validateConnection = validateDatabaseConnection;
```

**File**: `backend/server.js`

**Codice da aggiungere** (PRIMA di `server.listen`):
```javascript
// Prima di startare il server, valida DB
const { validateConnection } = require('./services/database');

(async () => {
  // Validazione BLOCCANTE database
  await validateConnection();

  // Solo dopo DB OK, start server
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔌 Socket.IO ready for real-time connections`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})();
```

---

## PRIORITY 2 - HIGH (Fix entro 1 settimana)

### 7. Validazione Order Items

**File**: `backend/controllers/orderController.js`

Aggiungere middleware:
```javascript
const validateOrderItems = (req, res, next) => {
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      error: 'items deve essere un array'
    });
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (!item.category || typeof item.category !== 'string') {
      return res.status(400).json({
        success: false,
        error: `Item ${i}: category mancante o non valida`
      });
    }

    if (!Array.isArray(item.flavors) || item.flavors.length === 0) {
      return res.status(400).json({
        success: false,
        error: `Item ${i}: flavors deve essere array non vuoto`
      });
    }

    if (typeof item.unit_price !== 'number' || item.unit_price <= 0) {
      return res.status(400).json({
        success: false,
        error: `Item ${i}: unit_price deve essere numero > 0`
      });
    }

    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return res.status(400).json({
        success: false,
        error: `Item ${i}: quantity deve essere intero >= 1`
      });
    }

    if (item.course && (!Number.isInteger(item.course) || item.course < 1 || item.course > 5)) {
      return res.status(400).json({
        success: false,
        error: `Item ${i}: course deve essere tra 1 e 5`
      });
    }
  }

  next();
};

// Applicare a route:
router.post('/', authenticate, validateOrderItems, orderController.createOrder);
```

### 8. Rate Limiting

```bash
npm install express-rate-limit
```

**File**: `backend/routes/orders.js`
```javascript
const rateLimit = require('express-rate-limit');

const orderLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 50, // max 50 richieste per IP
  message: {
    success: false,
    error: 'Troppe richieste, riprova tra 1 minuto'
  }
});

router.post('/', orderLimiter, authenticate, orderController.createOrder);
```

### 9. Health Check Endpoints

**File**: `backend/routes/index.js`
```javascript
// Health checks
router.get('/health/db', async (req, res) => {
  try {
    const db = require('../services/database');
    await db.raw('SELECT 1');
    res.json({ status: 'OK', service: 'database' });
  } catch (error) {
    res.status(503).json({ status: 'FAIL', service: 'database', error: error.message });
  }
});

router.get('/health/socketio', (req, res) => {
  const io = req.app.get('io');
  if (io && io.engine && io.engine.clientsCount !== undefined) {
    res.json({
      status: 'OK',
      service: 'socketio',
      clients: io.engine.clientsCount
    });
  } else {
    res.status(503).json({ status: 'FAIL', service: 'socketio' });
  }
});
```

---

## PRIORITY 3 - MEDIUM (Fix entro 2 settimane)

### 10. Ottimizzazione N+1 Query

**File**: `backend/models/Order.js`

```javascript
// Usare LEFT JOIN invece di 2 query separate
static async findById(id, trx = null) {
  const dbContext = trx || db;

  // Singola query con join
  const rows = await dbContext(this.tableName)
    .select(
      'orders.*',
      'tables.number as table_number',
      'users.username',
      'order_items.id as item_id',
      'order_items.category',
      'order_items.flavors',
      'order_items.quantity',
      'order_items.course',
      'order_items.custom_note',
      'order_items.unit_price',
      'order_items.total_price'
    )
    .leftJoin('tables', 'orders.table_id', 'tables.id')
    .leftJoin('users', 'orders.user_id', 'users.id')
    .leftJoin('order_items', 'orders.id', 'order_items.order_id')
    .where('orders.id', id);

  if (rows.length === 0) return null;

  // Raggruppa items
  const order = {
    id: rows[0].id,
    table_id: rows[0].table_id,
    table_number: rows[0].table_number,
    // ...
    items: []
  };

  rows.forEach(row => {
    if (row.item_id) {
      order.items.push({
        id: row.item_id,
        category: row.category,
        flavors: row.flavors,
        // ...
      });
    }
  });

  return order;
}
```

---

## TESTING DELLE CORREZIONI

Dopo aver applicato le correzioni Priority 1:

### Test 1: Transazioni
```bash
# Test rollback se PrintQueue.create fallisce
# Disconnetti stampante WiFi, poi:
curl -X PUT http://localhost:3000/api/orders/1/send \
  -H "Authorization: Bearer <token>"

# Verifica che Order.status sia ancora 'pending' (rollback OK)
# Verifica che Table.status sia ancora 'pending' (rollback OK)
```

### Test 2: Print Job Locking
```bash
# Avvia 2 istanze QueueWatcher simultaneamente
npm run print-server:mock &
npm run print-server:mock &

# Crea ordine e invia
# Verifica nei log che solo UNA istanza stampa (no duplicati)
```

### Test 3: Socket.IO Resilience
```bash
# Durante operazioni, riavvia backend server
# Verifica che QueueWatcher riconnette automaticamente
# Verifica che eventi print:success arrivano dopo riconnessione
```

---

## DEPLOYMENT CHECKLIST

Prima di andare in produzione:

- [ ] Tutte le correzioni Priority 1 applicate
- [ ] Test transazioni passati
- [ ] Test print job locking passati
- [ ] QueueWatcher riconnessione testata
- [ ] Printer monitoring attivo
- [ ] DB validation bloccante configurata
- [ ] Health checks funzionanti
- [ ] Rate limiting attivo
- [ ] NODE_ENV=production
- [ ] PM2 configurato per auto-restart
- [ ] Monitoring/alerting setup (Sentry, etc.)
- [ ] Backup database automatico
- [ ] WiFi printer IP configurato correttamente

---

## STIMA TEMPO IMPLEMENTAZIONE

- **Priority 1 (Critici)**: 6-8 ore sviluppo + 2 ore testing = **1 giorno lavorativo**
- **Priority 2 (High)**: 4 ore sviluppo + 1 ora testing = **mezza giornata**
- **Priority 3 (Medium)**: 3 ore sviluppo = **mezza giornata**

**TOTALE**: 2 giorni lavorativi per sistema production-ready.

---

## SUPPORTO IMPLEMENTAZIONE

Tutte le correzioni sono documentate con codice esatto da copiare/incollare.

**Ordine di implementazione consigliato**:
1. DB Connection Blocking (#6) - 15 min
2. Transazioni Database (#1) - 2 ore
3. Print Job Locking (#2) - 1 ora
4. Socket.IO Error Handling (#3) - 30 min
5. QueueWatcher Reconnection (#4) - 1 ora
6. Printer Monitoring (#5) - 1 ora

**Dopo ogni correzione**: testare con gli script forniti.
