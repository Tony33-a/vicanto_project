/**
 * Script: Aggiungi nuovo gusto
 * Modifica i valori e esegui: node backend/scripts/add_flavor.js
 */

const Flavor = require('../models/Flavor');
const db = require('../services/database');

async function addFlavor() {
  try {
    // 👇 MODIFICA QUI
    const newFlavor = await Flavor.create({
      name: 'Tiramisu',              // Nome gusto
      category_code: 'coppetta',     // coppetta, cono, crepes, frappe
      is_available: true,
      display_order: 13              // Ordine visualizzazione
    });

    console.log('✅ Gusto aggiunto:', newFlavor);
  } catch (error) {
    console.error('❌ Errore:', error.message);
  } finally {
    await db.destroy();
  }
}

addFlavor();
