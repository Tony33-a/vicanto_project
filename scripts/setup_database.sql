-- Script SQL per creare il database Vicanto
-- Esegui questo script come superuser PostgreSQL (postgres)

-- Crea il database
CREATE DATABASE vicanto_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Italian_Italy.1252'
    LC_CTYPE = 'Italian_Italy.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Commento sul database
COMMENT ON DATABASE vicanto_db IS 'Database per il sistema POS Vicanto';

-- Connettiti al database per verificare
\c vicanto_db

-- Verifica connessione
SELECT current_database(), current_user;