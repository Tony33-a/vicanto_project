# Database Setup

Questo progetto utilizza PostgreSQL come database e Knex.js come query builder e gestore di migrazioni.

## Prerequisiti

- PostgreSQL installato e in esecuzione
- Database creato (vedi configurazione sotto)

## Configurazione

1. Crea un file `.env` nella cartella `backend/` basandoti su `.env.example`
2. Configura le variabili d'ambiente del database:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=vicanto_db
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   ```

3. Crea il database PostgreSQL:
   ```sql
   CREATE DATABASE vicanto_db;
   ```

## Migrazioni

Le migrazioni si trovano in `database/migrations/` e creano la struttura del database.

### Eseguire le migrazioni

Dalla cartella `backend/`:
```bash
npm run migrate
```

### Rollback migrazioni

Per annullare l'ultima migrazione:
```bash
npm run migrate:rollback
```

### Creare una nuova migrazione

```bash
npm run migrate:make nome_migrazione
```

## Struttura Database

Le migrazioni creano le seguenti tabelle:

1. **users** - Utenti/staff del sistema
2. **categories** - Categorie prodotti
3. **products** - Prodotti del menu
4. **tables** - Tavoli del ristorante
5. **orders** - Ordini
6. **order_items** - Voci degli ordini

## Modelli

I modelli si trovano in `backend/models/` e utilizzano Knex per interagire con il database.

- `User.js` - Gestione utenti
- `Category.js` - Gestione categorie
- `Product.js` - Gestione prodotti
- `Table.js` - Gestione tavoli
- `Order.js` - Gestione ordini
- `OrderItem.js` - Gestione voci ordine