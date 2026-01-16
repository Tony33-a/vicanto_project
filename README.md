# Vicanto POS System

Sistema POS (Point of Sale) completo per la gestione di ristoranti, bar e locali. Il progetto include backend API, frontend, servizio di stampa e display cucina.

## 📋 Indice

- [Prerequisiti](#prerequisiti)
- [Struttura del Progetto](#struttura-del-progetto)
- [Installazione](#installazione)
- [Configurazione](#configurazione)
  - [Database PostgreSQL](#database-postgresql)
  - [Variabili d'Ambiente](#variabili-dambiente)
- [Utilizzo](#utilizzo)
  - [Avvio Backend](#avvio-backend)
  - [Migrazioni Database](#migrazioni-database)
- [API Endpoints](#api-endpoints)
- [Struttura Database](#struttura-database)
- [Tecnologie Utilizzate](#tecnologie-utilizzate)

## Prerequisiti

Prima di iniziare, assicurati di avere installato:

- **Node.js** (v18 o superiore) - [Download](https://nodejs.org/)
- **npm** (v9 o superiore) - Incluso con Node.js
- **PostgreSQL** (v12 o superiore) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

### Verifica Installazione

```bash
node --version
npm --version
git --version
psql --version  # Opzionale, verifica PostgreSQL
```

## Struttura del Progetto

```
vicanto/
├── backend/              # Backend API (Node.js/Express)
│   ├── config/          # File di configurazione
│   ├── controllers/     # Controller delle route
│   ├── models/          # Modelli database
│   ├── routes/          # Definizione route API
│   ├── middleware/      # Middleware Express
│   ├── services/        # Servizi (database, etc.)
│   ├── utils/           # Funzioni utility
│   ├── tests/           # Test
│   └── server.js        # Entry point server
├── frontend/            # Frontend React/Vue (da implementare)
├── print-service/       # Servizio stampa (da implementare)
├── kitchen-display/     # Display cucina (da implementare)
├── database/            # Migrazioni e script database
│   ├── migrations/      # Migrazioni Knex
│   └── scripts/         # Script SQL
├── scripts/             # Script di utilità
├── docs/                # Documentazione
└── logs/                # File di log
```

## Installazione

1. **Clona il repository** (se applicabile):
   ```bash
   git clone <repository-url>
   cd vicanto
   ```

2. **Installa le dipendenze del backend**:
   ```bash
   cd backend
   npm install
   ```

## Configurazione

### Database PostgreSQL

1. **Installa PostgreSQL** (se non già installato)

2. **Crea il database**:
   ```sql
   -- Accedi a PostgreSQL come superuser
   psql -U postgres
   
   -- Crea il database
   CREATE DATABASE vicanto_db;
   
   -- Esci da psql
   \q
   ```

   **Alternativa su Windows** (usando pgAdmin o SQL Shell):
   - Apri pgAdmin o SQL Shell (psql)
   - Esegui: `CREATE DATABASE vicanto_db;`

3. **Verifica la connessione**:
   ```bash
   psql -U postgres -d vicanto_db
   ```

### Variabili d'Ambiente

1. **Crea il file `.env` nella cartella `backend/`**:
   ```bash
   cd backend
   # Crea il file .env (PowerShell)
   New-Item -ItemType File -Path .env
   ```

2. **Configura le variabili d'ambiente** copiando da `.env.example` o usando questo template:

   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=vicanto_db
   DB_USER=postgres
   DB_PASSWORD=tua_password_postgres

   # JWT Configuration (per autenticazione futura)
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   JWT_EXPIRES_IN=24h

   # API Keys (se necessario)
   API_KEY=your_api_key_here

   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173

   # Print Service Configuration
   PRINT_SERVICE_URL=http://localhost:4000

   # Kitchen Display Configuration
   KITCHEN_DISPLAY_URL=http://localhost:5000
   ```

   **⚠️ IMPORTANTE**: 
   - Modifica `DB_PASSWORD` con la tua password PostgreSQL
   - Modifica `DB_USER` se usi un utente diverso da `postgres`
   - In produzione, cambia `JWT_SECRET` con una chiave sicura

## Utilizzo

### Avvio Backend

1. **Dalla cartella backend**:
   ```bash
   cd backend
   npm start
   ```

   Il server sarà disponibile su: `http://localhost:3000`

2. **Verifica che il server sia attivo**:
   ```bash
   # PowerShell
   Invoke-WebRequest -Uri http://localhost:3000/health
   
   # Oppure apri nel browser:
   # http://localhost:3000/health
   ```

   Risposta attesa:
   ```json
   {
     "status": "OK",
     "message": "Backend is running"
   }
   ```

### Migrazioni Database

Prima di utilizzare l'applicazione, esegui le migrazioni per creare le tabelle nel database:

1. **Assicurati che PostgreSQL sia in esecuzione**

2. **Verifica la configurazione** in `backend/.env` (vedi sezione [Variabili d'Ambiente](#variabili-dambiente))

3. **Esegui le migrazioni**:
   ```bash
   cd backend
   npm run migrate
   ```

   Questo creerà tutte le tabelle necessarie:
   - `users` - Utenti/staff
   - `categories` - Categorie prodotti
   - `products` - Prodotti del menu
   - `tables` - Tavoli del ristorante
   - `orders` - Ordini
   - `order_items` - Voci ordine

4. **Rollback migrazione** (se necessario):
   ```bash
   npm run migrate:rollback
   ```

5. **Crea una nuova migrazione**:
   ```bash
   npm run migrate:make nome_migrazione
   ```

## API Endpoints

### Health Check

- **GET** `/health`
  - Verifica stato server
  - Risposta: `{ "status": "OK", "message": "Backend is running" }`

- **GET** `/api/health`
  - Verifica stato API
  - Risposta: `{ "status": "OK", "message": "API is running" }`

### Products API

Tutti gli endpoint per i prodotti sono disponibili su `/api/products`:

#### GET `/api/products`
Lista tutti i prodotti
- **Query Parameters** (opzionali):
  - `category_id` - Filtra per categoria (integer)
  - `is_available` - Filtra per disponibilità (`true`/`false`)
- **Risposta**: `{ "success": true, "count": 10, "data": [...] }`

#### GET `/api/products/:id`
Ottiene un prodotto specifico per ID
- **Parameters**: `id` (integer)
- **Risposta**: `{ "success": true, "data": {...} }`
- **Errori**: 404 se prodotto non trovato

#### GET `/api/products/barcode/:barcode`
Ottiene un prodotto per barcode
- **Parameters**: `barcode` (string)
- **Risposta**: `{ "success": true, "data": {...} }`
- **Errori**: 404 se prodotto non trovato

#### POST `/api/products`
Crea un nuovo prodotto
- **Body** (JSON):
  ```json
  {
    "name": "Pizza Margherita",
    "description": "Pizza classica con pomodoro e mozzarella",
    "category_id": 1,
    "price": 8.50,
    "cost": 3.00,
    "barcode": "1234567890",
    "sku": "PIZ-MARG-001",
    "image_url": "https://example.com/pizza.jpg",
    "is_available": true,
    "requires_preparation": true,
    "preparation_time": 15,
    "display_order": 1,
    "options": {"size": ["small", "medium", "large"]}
  }
  ```
- **Campi obbligatori**: `name`, `price`
- **Risposta**: `{ "success": true, "message": "Product created successfully", "data": {...} }`
- **Errori**: 400 per errori di validazione

#### PUT `/api/products/:id`
Aggiorna un prodotto esistente
- **Parameters**: `id` (integer)
- **Body** (JSON): Tutti i campi sono opzionali, solo quelli forniti vengono aggiornati
- **Risposta**: `{ "success": true, "message": "Product updated successfully", "data": {...} }`
- **Errori**: 400 per errori di validazione, 404 se prodotto non trovato

#### DELETE `/api/products/:id`
Elimina un prodotto (soft delete - imposta `is_available` a `false`)
- **Parameters**: `id` (integer)
- **Risposta**: `{ "success": true, "message": "Product deleted successfully" }`
- **Errori**: 404 se prodotto non trovato

### Altri Endpoints

Gli endpoint per:
- Gestione ordini (`/api/orders`)
- Gestione tavoli (`/api/tables`)
- Gestione categorie (`/api/categories`)
- Autenticazione (`/api/auth`)

Saranno implementati nei prossimi step.

## Struttura Database

### Tabelle Principali

1. **users** - Utenti e staff del sistema
   - Ruoli: `admin`, `manager`, `waiter`, `cashier`, `kitchen`

2. **categories** - Categorie prodotti
   - Esempio: Antipasti, Primi, Secondi, Bevande, Dolci

3. **products** - Prodotti del menu
   - Prezzo, costo, barcode, immagine
   - Flag `requires_preparation` per gestione cucina

4. **tables** - Tavoli del ristorante
   - Status: `available`, `occupied`, `reserved`, `cleaning`

5. **orders** - Ordini
   - Status: `pending`, `confirmed`, `preparing`, `ready`, `served`, `paid`, `cancelled`
   - Tipo: `dine_in`, `takeaway`, `delivery`

6. **order_items** - Voci ordine
   - Quantità, prezzo unitario, totale
   - Status: `pending`, `preparing`, `ready`, `served`, `cancelled`

## Modelli Disponibili

I modelli si trovano in `backend/models/`:

- **User.js** - Gestione utenti
- **Category.js** - Gestione categorie
- **Product.js** - Gestione prodotti
- **Table.js** - Gestione tavoli
- **Order.js** - Gestione ordini (con generazione numero ordine automatico)
- **OrderItem.js** - Gestione voci ordine (con calcolo totale automatico)

### Utilizzo Esempio

```javascript
const User = require('./models/User');

// Trova tutti gli utenti attivi
const users = await User.findAll();

// Trova utente per username
const user = await User.findByUsername('waiter1');

// Crea nuovo utente
const newUser = await User.create({
  username: 'waiter1',
  password_hash: 'hashed_password',
  first_name: 'Mario',
  last_name: 'Rossi',
  role: 'waiter'
});
```

## Tecnologie Utilizzate

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Knex.js** - Query builder e migrazioni
- **PostgreSQL** - Database relazionale
- **dotenv** - Gestione variabili d'ambiente
- **cors** - Cross-Origin Resource Sharing

### Struttura
- Pattern MVC (Model-View-Controller)
- Migrazioni database con Knex
- Middleware per gestione errori
- Configurazione centralizzata

## Troubleshooting

### Errore connessione database

```
Database connection error: ...
```

**Soluzioni**:
1. Verifica che PostgreSQL sia in esecuzione
2. Controlla le credenziali in `backend/.env`
3. Verifica che il database `vicanto_db` esista
4. Controlla che l'utente PostgreSQL abbia i permessi necessari

### Errore porta già in uso

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Soluzioni**:
1. Cambia `PORT` in `backend/.env`
2. Oppure termina il processo che usa la porta 3000

### Migrazioni non funzionano

**Verifica**:
1. Il database esiste e le credenziali sono corrette
2. L'utente PostgreSQL ha permessi per creare tabelle
3. Il file `knexfile.js` punta alla directory corretta delle migrazioni

## Prossimi Step

- [ ] Implementazione endpoint API per prodotti
- [ ] Implementazione endpoint API per ordini
- [ ] Sistema di autenticazione JWT
- [ ] Frontend React/Vue
- [ ] Servizio di stampa
- [ ] Display cucina

## Licenza

[Inserisci licenza qui]

## Supporto

Per problemi o domande, consulta la documentazione in `docs/` o apri una issue.

## Esempi di Utilizzo API

### Esempio: Creare un prodotto

```bash
# PowerShell
$body = @{
    name = "Pizza Margherita"
    description = "Pizza classica con pomodoro e mozzarella"
    category_id = 1
    price = 8.50
    cost = 3.00
    is_available = $true
    requires_preparation = $true
    preparation_time = 15
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/products `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### Esempio: Ottenere tutti i prodotti

```bash
# PowerShell
Invoke-WebRequest -Uri http://localhost:3000/api/products -Method GET

# Con filtri
Invoke-WebRequest -Uri "http://localhost:3000/api/products?category_id=1&is_available=true" -Method GET
```

### Esempio: Aggiornare un prodotto

```bash
# PowerShell
$body = @{
    price = 9.50
    description = "Pizza Margherita - prezzo aggiornato"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/products/1 `
  -Method PUT `
  -ContentType "application/json" `
  -Body $body
```

---

**Ultimo aggiornamento**: Database configurato e testato - Sistema completamente operativo! ✅

**Status Setup**:
- ✅ Backend server funzionante
- ✅ Database PostgreSQL configurato e connesso
- ✅ Migrazioni eseguite (6 tabelle create)
- ✅ Products API testata e funzionante
- ✅ CRUD completo operativo

Vedi `SETUP_COMPLETATO.md` per dettagli completi del setup.