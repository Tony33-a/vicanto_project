# 📚 VICANTO POS - API Documentation

Sistema POS per gelateria con gestione ordini, tavoli e menu.

## 🔗 Base URL

```
http://localhost:3000/api
```

## 🔐 Autenticazione

Tutte le API (eccetto `/auth/login`) richiedono autenticazione JWT.

**Header richiesto:**
```
Authorization: Bearer <token>
```

---

## 📋 Indice API

1. [Auth API](#auth-api) - Autenticazione con PIN
2. [Tables API](#tables-api) - Gestione tavoli
3. [Menu API](#menu-api) - Categorie e gusti
4. [Orders API](#orders-api) - Gestione ordini

---

## 🔐 Auth API

### POST /api/auth/login

Login con username e PIN (4 cifre).

**Request:**
```json
POST /api/auth/login
Content-Type: application/json

{
  "username": "mario",
  "pin": "1234"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "mario",
    "role": "waiter"
  }
}
```

**Errors:**
- `400` - Username o PIN mancanti / PIN non valido (deve essere 4 cifre)
- `401` - Credenziali non valide

**Utenti di test:**
- `admin` / PIN: `0000` (role: admin)
- `mario` / PIN: `1234` (role: waiter)

---

### GET /api/auth/me

Ottieni info utente corrente dal token.

**Request:**
```
GET /api/auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 2,
    "username": "mario",
    "role": "waiter",
    "last_login": "2024-01-16T10:30:00Z"
  }
}
```

**Errors:**
- `401` - Token non fornito / non valido / scaduto
- `404` - Utente non trovato

---

### POST /api/auth/logout

Logout (JWT è stateless, il client deve rimuovere il token).

**Request:**
```
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout effettuato. Rimuovi il token dal client."
}
```

---

## 🪑 Tables API

### GET /api/tables

Ottieni tutti i tavoli.

**Request:**
```
GET /api/tables
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 14,
  "data": [
    {
      "id": 1,
      "number": 1,
      "status": "free",
      "covers": 0,
      "total": "0.00",
      "updated_at": "2024-01-16T10:00:00Z"
    },
    {
      "id": 5,
      "number": 5,
      "status": "occupied",
      "covers": 2,
      "total": "10.50",
      "updated_at": "2024-01-16T10:30:00Z"
    }
  ]
}
```

**Stati tavolo:**
- `free` - Libero
- `pending` - Ordine in lavorazione (non ancora inviato)
- `occupied` - Ordine inviato in cucina

---

### GET /api/tables/:id

Ottieni tavolo per ID con ordine corrente (se esiste).

**Request:**
```
GET /api/tables/5
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "number": 5,
    "status": "pending",
    "covers": 2,
    "total": "10.50",
    "updated_at": "2024-01-16T10:30:00Z",
    "current_order": {
      "id": 3,
      "status": "pending",
      "covers": 2,
      "total": "10.50",
      "items": [
        {
          "id": 5,
          "category": "Coppetta",
          "flavors": ["Cioccolato", "Pistacchio"],
          "quantity": 1,
          "unit_price": "4.50",
          "total_price": "4.50"
        }
      ]
    }
  }
}
```

**Errors:**
- `404` - Tavolo non trovato

---

### PUT /api/tables/:id

Aggiorna stato tavolo.

**Request:**
```json
PUT /api/tables/5
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "occupied",
  "covers": 2,
  "total": 10.50
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Tavolo aggiornato",
  "data": {
    "id": 5,
    "number": 5,
    "status": "occupied",
    "covers": 2,
    "total": "10.50"
  }
}
```

---

### PUT /api/tables/:id/free

Libera tavolo (reset a free).

**Request:**
```
PUT /api/tables/5/free
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Tavolo liberato",
  "data": {
    "id": 5,
    "number": 5,
    "status": "free",
    "covers": 0,
    "total": "0.00"
  }
}
```

---

## 🍦 Menu API

### GET /api/menu/categories

Ottieni tutte le categorie menu.

**Request:**
```
GET /api/menu/categories
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": 1,
      "code": "coppetta",
      "name": "Coppetta",
      "icon": "🥄",
      "base_price": "4.50",
      "is_active": true,
      "display_order": 1
    },
    {
      "id": 2,
      "code": "cono",
      "name": "Cono",
      "icon": "🍦",
      "base_price": "3.50",
      "is_active": true,
      "display_order": 2
    }
  ]
}
```

---

### GET /api/menu/categories/:code

Ottieni categoria per codice con tutti i gusti.

**Request:**
```
GET /api/menu/categories/coppetta
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "coppetta",
    "name": "Coppetta",
    "icon": "🥄",
    "base_price": "4.50",
    "is_active": true,
    "flavors": [
      {
        "id": 1,
        "name": "Fragola",
        "is_available": true,
        "display_order": 1
      },
      {
        "id": 2,
        "name": "Cioccolato",
        "is_available": true,
        "display_order": 2
      }
    ]
  }
}
```

**Errors:**
- `404` - Categoria non trovata

---

### GET /api/menu/flavors

Ottieni tutti i gusti.

**Request:**
```
GET /api/menu/flavors
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 38,
  "data": [
    {
      "id": 1,
      "name": "Fragola",
      "category_code": "coppetta",
      "is_available": true,
      "display_order": 1
    }
  ]
}
```

---

### GET /api/menu/flavors/:categoryCode

Ottieni gusti per categoria.

**Request:**
```
GET /api/menu/flavors/coppetta
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "id": 1,
      "name": "Fragola",
      "category_code": "coppetta",
      "is_available": true,
      "display_order": 1
    }
  ]
}
```

---

## 📦 Orders API

### GET /api/orders

Ottieni tutti gli ordini (con filtri opzionali).

**Request:**
```
GET /api/orders
GET /api/orders?status=sent
GET /api/orders?table_id=5
GET /api/orders?user_id=2
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 3,
      "table_id": 5,
      "table_number": 5,
      "user_id": 2,
      "waiter_username": "mario",
      "status": "sent",
      "covers": 2,
      "subtotal": "8.50",
      "cover_charge": "2.00",
      "total": "10.50",
      "created_at": "2024-01-16T10:30:00Z",
      "sent_at": "2024-01-16T10:32:00Z"
    }
  ]
}
```

**Stati ordine:**
- `pending` - Creato ma non ancora inviato
- `sent` - Inviato in cucina
- `completed` - Completato e pagato
- `cancelled` - Cancellato

---

### GET /api/orders/active

Ottieni ordini attivi (pending o sent).

**Request:**
```
GET /api/orders/active
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [...]
}
```

---

### GET /api/orders/:id

Ottieni ordine per ID con tutti gli items.

**Request:**
```
GET /api/orders/3
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "table_id": 5,
    "table_number": 5,
    "user_id": 2,
    "waiter_username": "mario",
    "status": "sent",
    "covers": 2,
    "subtotal": "8.50",
    "cover_charge": "2.00",
    "total": "10.50",
    "notes": "Senza panna",
    "created_at": "2024-01-16T10:30:00Z",
    "sent_at": "2024-01-16T10:32:00Z",
    "items": [
      {
        "id": 5,
        "order_id": 3,
        "category": "Coppetta",
        "flavors": ["Cioccolato", "Pistacchio"],
        "quantity": 1,
        "course": 1,
        "custom_note": null,
        "unit_price": "4.50",
        "total_price": "4.50",
        "created_at": "2024-01-16T10:30:00Z"
      },
      {
        "id": 6,
        "order_id": 3,
        "category": "Frappè",
        "flavors": ["Fragola"],
        "quantity": 1,
        "course": 1,
        "custom_note": "Senza panna",
        "unit_price": "4.00",
        "total_price": "4.00",
        "created_at": "2024-01-16T10:30:00Z"
      }
    ]
  }
}
```

**Errors:**
- `404` - Ordine non trovato

---

### POST /api/orders

Crea nuovo ordine.

**Request:**
```json
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "table_id": 5,
  "covers": 2,
  "notes": "Tavolo esterno",
  "items": [
    {
      "category": "Coppetta",
      "flavors": ["Cioccolato", "Pistacchio"],
      "quantity": 1,
      "course": 1,
      "custom_note": null,
      "unit_price": 4.50
    },
    {
      "category": "Frappè",
      "flavors": ["Fragola"],
      "quantity": 1,
      "course": 1,
      "custom_note": "Senza panna",
      "unit_price": 4.00
    }
  ]
}
```

**Campi obbligatori:**
- `table_id` - ID tavolo
- `covers` - Numero coperti (min: 1)
- `items` - Array di items (min: 1 item)

**Campi item:**
- `category` - Nome categoria (es: "Coppetta", "Cono")
- `flavors` - Array di gusti (es: ["Cioccolato", "Pistacchio"])
- `quantity` - Quantità (min: 1)
- `course` - Numero portata (default: 1, range: 1-5)
- `custom_note` - Note personalizzate (opzionale)
- `unit_price` - Prezzo unitario

**Response (201):**
```json
{
  "success": true,
  "message": "Ordine creato",
  "data": {
    "id": 3,
    "table_id": 5,
    "status": "pending",
    "covers": 2,
    "subtotal": "8.50",
    "cover_charge": "2.00",
    "total": "10.50",
    "items": [...]
  }
}
```

**Calcoli automatici:**
- `subtotal` = somma di tutti i `total_price` degli items
- `cover_charge` = `covers * 1.00` (€1 per coperto)
- `total` = `subtotal + cover_charge`
- `item.total_price` = `quantity * unit_price`

**Effetti collaterali:**
- Tavolo diventa `pending`
- `table.covers` e `table.total` vengono aggiornati

**Errors:**
- `400` - Campi obbligatori mancanti / items vuoto
- `404` - Tavolo non trovato

---

### PUT /api/orders/:id/send

Invia ordine in cucina (cambia stato a `sent` + inserisce in coda stampa).

**Request:**
```
PUT /api/orders/3/send
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Ordine inviato e inserito in coda stampa",
  "data": {
    "id": 3,
    "status": "sent",
    "sent_at": "2024-01-16T10:32:00Z"
  }
}
```

**Effetti collaterali:**
- Ordine passa da `pending` a `sent`
- Tavolo diventa `occupied`
- Record inserito in `print_queue` (status: `pending`)

**Errors:**
- `400` - Ordine non è in stato `pending`
- `404` - Ordine non trovato

---

### PUT /api/orders/:id/complete

Completa ordine (libera tavolo).

**Request:**
```
PUT /api/orders/3/complete
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Ordine completato e tavolo liberato",
  "data": {
    "id": 3,
    "status": "completed",
    "completed_at": "2024-01-16T11:00:00Z"
  }
}
```

**Effetti collaterali:**
- Ordine passa a `completed`
- Tavolo torna `free` (covers: 0, total: 0)

**Errors:**
- `404` - Ordine non trovato

---

### PUT /api/orders/:id/cancel

Cancella ordine.

**Request:**
```
PUT /api/orders/3/cancel
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Ordine cancellato",
  "data": {
    "id": 3,
    "status": "cancelled",
    "cancelled_at": "2024-01-16T10:35:00Z"
  }
}
```

**Effetti collaterali:**
- Ordine passa a `cancelled`
- Se l'ordine era `pending`, il tavolo viene liberato

**Errors:**
- `404` - Ordine non trovato

---

### DELETE /api/orders/:id

Elimina ordine (hard delete).

**Request:**
```
DELETE /api/orders/3
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Ordine eliminato"
}
```

**⚠️ ATTENZIONE:** Questo è un hard delete. L'ordine viene rimosso dal database.

**Errors:**
- `404` - Ordine non trovato

---

## 🔧 Codici di Errore

| Codice | Significato |
|--------|-------------|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request (validazione fallita) |
| `401` | Unauthorized (token mancante/invalido) |
| `403` | Forbidden (permessi insufficienti) |
| `404` | Not Found |
| `500` | Internal Server Error |

**Formato errore:**
```json
{
  "success": false,
  "error": "Messaggio di errore"
}
```

---

## 📊 Esempi Flussi Completi

### Flusso 1: Crea e Invia Ordine

```javascript
// 1. Login
const login = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'mario', pin: '1234' })
});
const { token } = await login.json();

// 2. Ottieni menu
const menu = await fetch('/api/menu/categories', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const categories = await menu.json();

// 3. Crea ordine
const order = await fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    table_id: 5,
    covers: 2,
    items: [
      {
        category: 'Coppetta',
        flavors: ['Cioccolato', 'Pistacchio'],
        quantity: 1,
        course: 1,
        unit_price: 4.50
      }
    ]
  })
});
const { data: newOrder } = await order.json();

// 4. Invia ordine
await fetch(`/api/orders/${newOrder.id}/send`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` }
});

// 5. Completa ordine
await fetch(`/api/orders/${newOrder.id}/complete`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 🚀 Testing

Script di test disponibili in `backend/`:

```bash
# Test Auth API
node test_auth_api.js

# Test completo (tutte le API)
node test_all_api.js

# Test Models
node test_models.js
```

---

## 💾 Database

**Connection:**
- Host: `localhost`
- Port: `5432`
- Database: `vicanto_db`
- User: `postgres`

**Tabelle principali:**
- `tables` - 14 tavoli
- `users` - Utenti (admin, mario)
- `menu_categories` - 4 categorie
- `flavors` - 38 gusti
- `orders` - Ordini
- `order_items` - Items ordini
- `print_queue` - Coda stampa

---

## 📝 Note

- Tutte le API (tranne login) richiedono autenticazione JWT
- I token JWT scadono dopo 12 ore
- Il coperto è fisso a €1.00 per persona
- Le `flavors` sono salvate come array JSONB in PostgreSQL
- Il campo `course` (portata) va da 1 a 5
- Gli ordini hanno soft delete tramite status `cancelled`
- Gli ordini eliminati con DELETE sono hard delete

---

**Versione:** 1.0.0
**Data:** 16/01/2024
**Backend:** Node.js 20 + Express + PostgreSQL
