# Socket.IO Real-time API Documentation

## Panoramica

Il sistema ViCanto utilizza Socket.IO per sincronizzazione real-time tra:
- **Monitor Touch** (postazione fissa - sala)
- **Tablet Camerieri** (dispositivi mobili)
- **Kitchen Display** (display cucina)

Tutti i client ricevono aggiornamenti istantanei su ordini e tavoli senza bisogno di polling o refresh della pagina.

---

## Connessione

### Endpoint
```
ws://localhost:3000
```

### Autenticazione

**Tutti i client devono autenticarsi con JWT token** ottenuto via API `/api/auth/login`.

```javascript
import io from 'socket.io-client';

// 1. Ottieni token da API login
const loginRes = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'mario', pin: '1234' })
});
const { token } = await loginRes.json();

// 2. Connetti con token
const socket = io('http://localhost:3000', {
  auth: { token }
});

// 3. Gestisci connessione
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

### Errori di Connessione

| Errore | Causa | Soluzione |
|--------|-------|-----------|
| `Authentication token required` | Token mancante | Fornire `auth.token` nella connessione |
| `Invalid or expired token` | Token non valido/scaduto | Ottenere nuovo token tramite login |

---

## Rooms (Stanze)

I client si uniscono a **rooms** diverse in base al tipo di dispositivo.

### Room Disponibili

| Room | Dispositivi | Eventi Ricevuti |
|------|-------------|-----------------|
| `monitor` | Monitor touch postazione fissa | Tutti gli eventi (tavoli, ordini, stampa) |
| `tablets` | Tablet camerieri | Ordini, tavoli, stampa |
| `kitchen` | Kitchen display | Ordini in arrivo, completati, cancellati |

### Join Room

```javascript
// Unisciti a una room
socket.emit('join:room', 'monitor');  // o 'tablets', 'kitchen'

// Conferma iscrizione
socket.on('room:joined', (data) => {
  console.log(`Joined room: ${data.room}`);
  console.log(`User: ${data.user}`);
});

// Esempio errore
socket.on('error', (error) => {
  console.error('Room error:', error.message);
});
```

### Leave Room

```javascript
socket.emit('leave:room', 'monitor');
```

---

## Eventi Real-time

### 1. Table Events

#### `table:updated`

Emesso quando lo stato di un tavolo cambia (free → pending → occupied → free).

**Ricevuto da:** `monitor`, `tablets`

**Payload:**
```json
{
  "id": 7,
  "number": 7,
  "status": "occupied",
  "covers": 2,
  "total": "10.50",
  "updated_at": "2024-01-16T10:30:00.000Z"
}
```

**Listener:**
```javascript
socket.on('table:updated', (table) => {
  console.log(`Table #${table.number} → ${table.status}`);

  // Aggiorna UI
  updateTableUI(table);
});
```

**Quando viene emesso:**
- Ordine creato → tavolo diventa `pending`
- Ordine inviato → tavolo diventa `occupied`
- Ordine completato → tavolo diventa `free`
- Tavolo liberato manualmente → `free`
- Tavolo aggiornato via API → stato cambiato

---

### 2. Order Events

#### `order:new`

Emesso quando viene creato un nuovo ordine.

**Ricevuto da:** `monitor`, `tablets`, `kitchen`

**Payload:**
```json
{
  "id": 42,
  "table_id": 7,
  "table_number": 7,
  "user_id": 2,
  "status": "pending",
  "covers": 2,
  "subtotal": "9.00",
  "cover_charge": "2.00",
  "total": "11.00",
  "notes": "Senza lattosio",
  "created_at": "2024-01-16T10:30:00.000Z",
  "items": [
    {
      "id": 101,
      "order_id": 42,
      "category": "Coppetta",
      "flavors": ["Pistacchio", "Nocciola"],
      "quantity": 2,
      "course": 1,
      "unit_price": "4.50",
      "total_price": "9.00"
    }
  ]
}
```

**Listener:**
```javascript
socket.on('order:new', (order) => {
  console.log(`New order #${order.id} for table ${order.table_number}`);

  // Monitor/Tablet: aggiungi alla lista ordini attivi
  addOrderToActiveList(order);

  // Kitchen: mostra nuovo ordine in cucina
  displayNewOrderInKitchen(order);

  // Notifica sonora
  playNotificationSound();
});
```

---

#### `order:sent`

Emesso quando un ordine viene inviato alla cucina (status: pending → sent).

**Ricevuto da:** `monitor`, `tablets`, `kitchen`

**Payload:** (stesso formato di `order:new`, ma `status: "sent"` e campo `sent_at`)

```json
{
  "id": 42,
  "status": "sent",
  "sent_at": "2024-01-16T10:32:00.000Z",
  ...
}
```

**Listener:**
```javascript
socket.on('order:sent', (order) => {
  console.log(`Order #${order.id} sent to kitchen`);

  // Kitchen: evidenzia nuovo ordine in arrivo
  highlightNewKitchenOrder(order);

  // Monitor/Tablet: aggiorna stato ordine
  updateOrderStatus(order.id, 'sent');
});
```

---

#### `order:updated`

Emesso quando un ordine viene aggiornato genericamente.

**Ricevuto da:** `monitor`, `tablets`, `kitchen`

**Payload:** (stesso formato di `order:new`)

**Listener:**
```javascript
socket.on('order:updated', (order) => {
  console.log(`Order #${order.id} updated: ${order.status}`);
  updateOrderInUI(order);
});
```

---

#### `order:completed`

Emesso quando un ordine viene completato (status: sent → completed).

**Ricevuto da:** `monitor`, `tablets`, `kitchen`

**Payload:** (stesso formato di `order:new`, ma `status: "completed"` e campo `completed_at`)

```json
{
  "id": 42,
  "status": "completed",
  "completed_at": "2024-01-16T10:45:00.000Z",
  ...
}
```

**Listener:**
```javascript
socket.on('order:completed', (order) => {
  console.log(`Order #${order.id} completed`);

  // Rimuovi da lista ordini attivi
  removeOrderFromActiveList(order.id);

  // Kitchen: nascondi ordine completato
  hideCompletedOrderInKitchen(order.id);
});
```

---

#### `order:cancelled`

Emesso quando un ordine viene cancellato.

**Ricevuto da:** `monitor`, `tablets`, `kitchen`

**Payload:** (stesso formato di `order:new`, ma `status: "cancelled"`)

**Listener:**
```javascript
socket.on('order:cancelled', (order) => {
  console.log(`Order #${order.id} cancelled`);

  // Rimuovi da liste
  removeOrderFromActiveList(order.id);

  // Kitchen: rimuovi ordine cancellato
  removeOrderFromKitchen(order.id);

  // Mostra notifica
  showCancellationNotice(order);
});
```

---

### 3. Print Events

#### `print:success`

Emesso quando un ordine viene stampato con successo.

**Ricevuto da:** `monitor`, `tablets`

**Payload:**
```json
{
  "id": 15,
  "order_id": 42,
  "status": "printed",
  "attempts": 1,
  "max_attempts": 3,
  "created_at": "2024-01-16T10:32:00.000Z",
  "printed_at": "2024-01-16T10:32:05.000Z"
}
```

**Listener:**
```javascript
socket.on('print:success', (printJob) => {
  console.log(`Order #${printJob.order_id} printed successfully`);

  // Mostra feedback visivo
  showPrintSuccessIndicator(printJob.order_id);
});
```

---

#### `print:failed`

Emesso quando la stampa di un ordine fallisce dopo tutti i tentativi.

**Ricevuto da:** `monitor`, `tablets`

**Payload:**
```json
{
  "id": 16,
  "order_id": 43,
  "status": "failed",
  "attempts": 3,
  "max_attempts": 3,
  "error_message": "Printer offline",
  "created_at": "2024-01-16T10:35:00.000Z",
  "failed_at": "2024-01-16T10:35:15.000Z"
}
```

**Listener:**
```javascript
socket.on('print:failed', (printJob) => {
  console.error(`Print failed for order #${printJob.order_id}`);
  console.error(`Error: ${printJob.error_message}`);

  // Alert all'utente
  showPrintErrorAlert(printJob);

  // Opzione retry manuale
  offerManualPrintRetry(printJob.order_id);
});
```

---

### 4. Menu Events

#### `menu:updated`

Emesso quando categorie o gusti menu vengono modificati.

**Ricevuto da:** `monitor`, `tablets`

**Payload:**
```json
{
  "type": "category_added",  // o "flavor_added", "price_updated"
  "data": {
    "code": "brioche",
    "name": "Brioche",
    "base_price": "3.50"
  },
  "timestamp": "2024-01-16T11:00:00.000Z"
}
```

**Listener:**
```javascript
socket.on('menu:updated', (menuData) => {
  console.log(`Menu updated: ${menuData.type}`);

  // Ricarica menu dal server
  refreshMenuData();
});
```

---

## Heartbeat / Keep-Alive

Per mantenere la connessione attiva, i client possono inviare ping periodici.

```javascript
// Invia ping ogni 30 secondi
setInterval(() => {
  socket.emit('ping');
}, 30000);

// Ricevi pong
socket.on('pong', (data) => {
  console.log('Pong received:', data.timestamp);
});
```

---

## Disconnessione

```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);

  if (reason === 'io server disconnect') {
    // Server ha disconnesso il client, riconnetti manualmente
    socket.connect();
  }
  // Se 'io client disconnect', il client ha disconnesso volontariamente
});

// Disconnetti manualmente
socket.disconnect();
```

---

## Esempio Completo: Monitor Touch Client

```javascript
import io from 'socket.io-client';

class ViCantoMonitor {
  constructor(token) {
    this.socket = io('http://localhost:3000', {
      auth: { token }
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Connessione
    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
      this.socket.emit('join:room', 'monitor');
    });

    this.socket.on('room:joined', (data) => {
      console.log(`📱 Joined room: ${data.room}`);
    });

    // Table events
    this.socket.on('table:updated', (table) => {
      this.updateTableDisplay(table);
    });

    // Order events
    this.socket.on('order:new', (order) => {
      this.addNewOrder(order);
      this.playNotificationSound();
    });

    this.socket.on('order:sent', (order) => {
      this.updateOrderStatus(order, 'sent');
    });

    this.socket.on('order:completed', (order) => {
      this.removeOrder(order.id);
      this.freeTable(order.table_id);
    });

    this.socket.on('order:cancelled', (order) => {
      this.removeOrder(order.id);
    });

    // Print events
    this.socket.on('print:success', (printJob) => {
      this.showPrintSuccess(printJob.order_id);
    });

    this.socket.on('print:failed', (printJob) => {
      this.showPrintError(printJob);
    });

    // Disconnessione
    this.socket.on('disconnect', (reason) => {
      console.warn('⚠️ Disconnected:', reason);
      this.showConnectionWarning();
    });
  }

  updateTableDisplay(table) {
    const tableEl = document.querySelector(`[data-table="${table.number}"]`);
    if (tableEl) {
      tableEl.className = `table table-${table.status}`;
      tableEl.querySelector('.covers').textContent = table.covers;
      tableEl.querySelector('.total').textContent = `€${table.total}`;
    }
  }

  addNewOrder(order) {
    // Aggiungi ordine alla UI
    const orderEl = document.createElement('div');
    orderEl.className = 'order';
    orderEl.dataset.orderId = order.id;
    orderEl.innerHTML = `
      <div class="order-header">
        <span>Tavolo ${order.table_number}</span>
        <span>€${order.total}</span>
      </div>
      <div class="order-items">
        ${order.items.map(item => `
          <div>${item.quantity}x ${item.category} - ${item.flavors.join(', ')}</div>
        `).join('')}
      </div>
    `;
    document.querySelector('.orders-list').prepend(orderEl);
  }

  playNotificationSound() {
    new Audio('/sounds/new-order.mp3').play();
  }

  disconnect() {
    this.socket.disconnect();
  }
}

// Uso
const token = localStorage.getItem('authToken');
const monitor = new ViCantoMonitor(token);
```

---

## Esempio Completo: Kitchen Display Client

```javascript
import io from 'socket.io-client';

class KitchenDisplay {
  constructor(token) {
    this.socket = io('http://localhost:3000', {
      auth: { token }
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('🍽️ Kitchen connected');
      this.socket.emit('join:room', 'kitchen');
    });

    // Solo eventi rilevanti per cucina
    this.socket.on('order:new', (order) => {
      // Ordine appena creato (non ancora inviato)
      this.addPendingOrder(order);
    });

    this.socket.on('order:sent', (order) => {
      // Ordine inviato alla cucina - PRIORITÀ ALTA
      this.highlightOrderForKitchen(order);
      this.playKitchenAlert();
    });

    this.socket.on('order:completed', (order) => {
      this.removeOrderFromDisplay(order.id);
    });

    this.socket.on('order:cancelled', (order) => {
      this.removeOrderFromDisplay(order.id);
    });
  }

  highlightOrderForKitchen(order) {
    const orderEl = this.createOrderCard(order);
    orderEl.classList.add('priority-high', 'blink');
    document.querySelector('.kitchen-orders').prepend(orderEl);

    // Timer per monitorare età ordine
    this.startOrderTimer(order.id);
  }

  startOrderTimer(orderId) {
    setInterval(() => {
      const orderEl = document.querySelector(`[data-order="${orderId}"]`);
      if (orderEl) {
        const createdAt = new Date(orderEl.dataset.createdAt);
        const minutes = Math.floor((Date.now() - createdAt) / 60000);
        orderEl.querySelector('.timer').textContent = `${minutes}m`;

        // Cambia colore se troppo vecchio
        if (minutes > 10) {
          orderEl.classList.add('order-urgent');
        }
      }
    }, 60000); // Aggiorna ogni minuto
  }

  playKitchenAlert() {
    new Audio('/sounds/kitchen-alert.mp3').play();
  }
}

const token = localStorage.getItem('authToken');
const kitchen = new KitchenDisplay(token);
```

---

## Test Socket.IO

Per testare il sistema real-time:

```bash
cd backend
node test_socket.js
```

Il test simula:
1. Login e ottenimento token JWT
2. Connessione di 3 client (monitor, tablet, kitchen)
3. Join nelle rispettive rooms
4. Creazione ordine → eventi `order:new`, `table:updated`
5. Invio ordine → eventi `order:sent`, `table:updated`
6. Completamento → eventi `order:completed`, `table:updated`

**Output atteso:**
```
✅ Monitor ricevuti: 6 eventi
✅ Tablet ricevuti: 4 eventi
✅ Kitchen ricevuti: 3 eventi
```

---

## Riepilogo Eventi per Client

### Monitor Touch
- ✅ `table:updated` - Sincronizza grid tavoli
- ✅ `order:new` - Nuovo ordine creato
- ✅ `order:sent` - Ordine inviato
- ✅ `order:completed` - Ordine completato
- ✅ `order:cancelled` - Ordine cancellato
- ✅ `print:success` - Stampa riuscita
- ✅ `print:failed` - Stampa fallita
- ✅ `menu:updated` - Menu modificato

### Tablet Camerieri
- ✅ `table:updated` - Stato tavoli
- ✅ `order:new` - Nuovo ordine
- ✅ `order:sent` - Ordine inviato (non gestito da loro)
- ✅ `print:success` - Feedback stampa
- ✅ `print:failed` - Alert stampa
- ✅ `menu:updated` - Aggiorna menu

### Kitchen Display
- ✅ `order:new` - Ordine creato (in attesa invio)
- ✅ `order:sent` - **PRIORITÀ: ordine in arrivo**
- ✅ `order:completed` - Rimuovi da display
- ✅ `order:cancelled` - Rimuovi da display

---

## Troubleshooting

### Client non si connette
- ✅ Verificare che il server sia avviato: `npm start`
- ✅ Controllare che il token JWT sia valido
- ✅ Verificare URL corretto (`http://localhost:3000`)

### Eventi non ricevuti
- ✅ Verificare di aver fatto `join:room` correttamente
- ✅ Controllare i listener siano configurati prima di fare azioni
- ✅ Verificare che il token non sia scaduto (12h expiration)

### Disconnessioni frequenti
- ✅ Implementare heartbeat/ping (ogni 30s)
- ✅ Gestire riconnessione automatica su `disconnect`
- ✅ Verificare stabilità rete WiFi

---

## Next Steps

Il sistema Socket.IO è pronto per l'integrazione con:
1. **Frontend React** (Monitor Touch + Tablet)
2. **Kitchen Display React**
3. **Print Service** (emetterà eventi `print:success`/`print:failed`)

Tutti i client potranno ricevere aggiornamenti real-time senza polling!
