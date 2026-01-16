/**
 * Script: Aggiungi nuova categoria
 * Modifica i valori e esegui: node backend/scripts/add_category.js
 */

const MenuCategory = require('../models/MenuCategory');
const db = require('../services/database');

async function addCategory() {
  try {
    // 👇 MODIFICA QUI
    const newCategory = await MenuCategory.create({
      code: 'bibite',           // Nome tecnico (lowercase, no spazi)
      name: 'Bibite',           // Nome visualizzato
      icon: '🥤',               // Emoji
      base_price: 2.50,         // Prezzo base
      is_active: true,
      display_order: 5          // Ordine visualizzazione
    });

    console.log('✅ Categoria creata:', newCategory);
  } catch (error) {
    console.error('❌ Errore:', error.message);
  } finally {
    await db.destroy();
  }
}

addCategory();
