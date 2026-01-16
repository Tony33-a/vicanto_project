/**
 * Script: Aggiorna prezzo categoria
 * Modifica i valori e esegui: node backend/scripts/update_price.js
 */

const MenuCategory = require('../models/MenuCategory');
const db = require('../services/database');

async function updatePrice() {
  try {
    // 👇 MODIFICA QUI
    const categoryCode = 'coppetta';  // coppetta, cono, crepes, frappe
    const newPrice = 5.00;            // Nuovo prezzo

    const category = await MenuCategory.findByCode(categoryCode);
    if (!category) {
      console.error(`❌ Categoria '${categoryCode}' non trovata`);
      return;
    }

    const updated = await MenuCategory.update(category.id, {
      base_price: newPrice
    });

    console.log(`✅ Prezzo aggiornato: ${updated.name} ora costa €${updated.base_price}`);
  } catch (error) {
    console.error('❌ Errore:', error.message);
  } finally {
    await db.destroy();
  }
}

updatePrice();
