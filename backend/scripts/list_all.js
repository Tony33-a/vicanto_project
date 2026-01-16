/**
 * Script: Mostra tutto il menu
 * Esegui: node backend/scripts/list_all.js
 */

const MenuCategory = require('../models/MenuCategory');
const Flavor = require('../models/Flavor');
const db = require('../services/database');

async function listAll() {
  try {
    console.log('\n📋 MENU COMPLETO VICANTO\n');
    console.log('='.repeat(60));

    const categories = await MenuCategory.findAll();

    for (const category of categories) {
      console.log(`\n${category.icon} ${category.name.toUpperCase()} - €${category.base_price}`);
      console.log('-'.repeat(40));

      const flavors = await Flavor.findByCategory(category.code);
      flavors.forEach((f, i) => {
        const status = f.is_available ? '✅' : '❌';
        console.log(`  ${i+1}. ${status} ${f.name}`);
      });
    }

    console.log('\n' + '='.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ Errore:', error.message);
  } finally {
    await db.destroy();
  }
}

listAll();
