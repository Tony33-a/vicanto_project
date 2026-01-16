# Configurazione Database PostgreSQL

## ✅ File .env Creato

Il file `backend/.env` è stato creato con la configurazione base. **IMPORTANTE**: Devi aggiornare `DB_PASSWORD` con la tua password PostgreSQL.

## 🔧 Passaggi per Configurare il Database

### Opzione 1: Usando pgAdmin (Consigliato)

1. **Apri pgAdmin** (interfaccia grafica PostgreSQL)

2. **Connettiti al server PostgreSQL** con le tue credenziali

3. **Crea il database**:
   - Click destro su "Databases" → "Create" → "Database"
   - Nome database: `vicanto_db`
   - Owner: `postgres` (o il tuo utente)
   - Click "Save"

4. **Aggiorna il file `.env`**:
   - Apri `backend/.env`
   - Inserisci la tua password in `DB_PASSWORD=tua_password_qui`
   - Salva il file

### Opzione 2: Usando SQL Shell (psql)

1. **Apri SQL Shell (psql)** dal menu Start

2. **Connettiti al server**:
   - Server [localhost]: premi Invio
   - Database [postgres]: premi Invio
   - Port [5432]: premi Invio
   - Username [postgres]: premi Invio o inserisci il tuo username
   - Password: inserisci la tua password

3. **Crea il database**:
   ```sql
   CREATE DATABASE vicanto_db;
   ```

4. **Esci da psql**:
   ```sql
   \q
   ```

5. **Aggiorna il file `.env`**:
   - Apri `backend/.env`
   - Inserisci la tua password in `DB_PASSWORD=tua_password_qui`
   - Salva il file

### Opzione 3: Usando PowerShell Script (se psql è nel PATH)

Esegui lo script automatico:

```powershell
.\scripts\setup_database.ps1
```

Questo script ti chiederà le credenziali e creerà automaticamente il database.

### Opzione 4: Script SQL Manuale

Puoi eseguire il file `scripts/setup_database.sql` usando pgAdmin o psql.

## 📝 Verifica Configurazione

Dopo aver creato il database, verifica il file `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vicanto_db
DB_USER=postgres
DB_PASSWORD=tua_password_qui  ← IMPORTANTE: inserisci la tua password
```

## 🚀 Eseguire le Migrazioni

Dopo aver configurato il database, esegui le migrazioni per creare le tabelle:

```bash
cd backend
npm run migrate
```

Questo creerà tutte le tabelle necessarie:
- users
- categories
- products
- tables
- orders
- order_items

## ✅ Testare la Connessione

Riavvia il server e verifica che la connessione funzioni:

```bash
cd backend
npm start
```

Dovresti vedere nel log:
```
✅ Database connection established successfully
```

Se vedi errori, verifica:
1. PostgreSQL è in esecuzione
2. Le credenziali in `.env` sono corrette
3. Il database `vicanto_db` esiste
4. L'utente PostgreSQL ha i permessi necessari

## 🐛 Troubleshooting

### Errore: "client password must be a string"
- **Causa**: `DB_PASSWORD` è vuoto o non configurato nel file `.env`
- **Soluzione**: Aggiungi la password in `backend/.env`

### Errore: "database does not exist"
- **Causa**: Il database `vicanto_db` non è stato creato
- **Soluzione**: Crea il database seguendo una delle opzioni sopra

### Errore: "password authentication failed"
- **Causa**: Password errata nel file `.env`
- **Soluzione**: Verifica la password in `backend/.env`

### Errore: "connection refused"
- **Causa**: PostgreSQL non è in esecuzione
- **Soluzione**: Avvia il servizio PostgreSQL da Services (Windows)

## 📚 Risorse

- [Documentazione PostgreSQL](https://www.postgresql.org/docs/)
- [Download PostgreSQL](https://www.postgresql.org/download/windows/)
- [pgAdmin Download](https://www.pgadmin.org/download/)

---

**Prossimo passo**: Dopo aver configurato il database, esegui `npm run migrate` nella cartella `backend/` per creare le tabelle.