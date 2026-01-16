-- ============================================
-- VICANTO - Inizializzazione Supplements
-- ============================================

-- Crea tabella supplements se non esiste
CREATE TABLE IF NOT EXISTS supplements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.50,
  icon VARCHAR(10),
  display_order INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crea indici
CREATE INDEX IF NOT EXISTS idx_supplements_available ON supplements(is_available);
CREATE INDEX IF NOT EXISTS idx_supplements_order ON supplements(display_order);

-- Aggiungi colonne a order_items se non esistono
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'supplements'
  ) THEN
    ALTER TABLE order_items ADD COLUMN supplements JSONB DEFAULT '[]';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'supplements_total'
  ) THEN
    ALTER TABLE order_items ADD COLUMN supplements_total DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

-- Pulisci e inserisci supplements
TRUNCATE TABLE supplements RESTART IDENTITY CASCADE;

INSERT INTO supplements (name, code, price, icon, display_order, is_available) VALUES
  ('Panna', 'panna', 0.50, NULL, 1, TRUE),
  ('Smarties', 'smarties', 0.50, NULL, 2, TRUE),
  ('Granella di Nocciola', 'granella_nocciola', 0.70, NULL, 3, TRUE),
  ('Granella di Pistacchio', 'granella_pistacchio', 0.80, NULL, 4, TRUE),
  ('Cioccolato Fuso', 'cioccolato_fuso', 0.60, NULL, 5, TRUE),
  ('Nutella', 'nutella', 0.70, NULL, 6, TRUE),
  ('Caramello', 'caramello', 0.50, NULL, 7, TRUE),
  ('Frutti di Bosco', 'frutti_bosco', 0.80, NULL, 8, TRUE),
  ('Cialda', 'cialda', 0.30, NULL, 9, TRUE),
  ('Amarena', 'amarena', 0.60, NULL, 10, TRUE);

-- Verifica
SELECT 'Supplements inseriti:' AS info, COUNT(*) AS count FROM supplements;
