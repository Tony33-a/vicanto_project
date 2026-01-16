/**
 * Seed: Dati iniziali per gelateria ViCanto
 * - 14 tavoli
 * - 4 categorie menu (Coppetta, Cono, Crêpes, Frappè)
 * - Gusti per ogni categoria
 * - 2 utenti test (admin + cameriere)
 */

const bcrypt = require('../../backend/node_modules/bcrypt');

exports.seed = async function(knex) {
  // === 1. PULISCI TABELLE (in ordine per foreign keys) ===
  await knex('print_queue').del();
  await knex('order_items').del();
  await knex('orders').del();
  await knex('flavors').del();
  await knex('menu_categories').del();
  await knex('users').del();
  await knex('tables').del();

  // === 2. CREA 14 TAVOLI (tutti free) ===
  const tables = [];
  for (let i = 1; i <= 14; i++) {
    tables.push({
      number: i,
      status: 'free',
      covers: 0,
      total: 0.00,
      updated_at: new Date()
    });
  }
  await knex('tables').insert(tables);

  // === 3. CREA UTENTI TEST ===
  const adminPinHash = await bcrypt.hash('0000', 10); // PIN: 0000
  const waiterPinHash = await bcrypt.hash('1234', 10); // PIN: 1234

  await knex('users').insert([
    {
      username: 'admin',
      pin_hash: adminPinHash,
      role: 'admin',
      is_active: true,
      created_at: new Date()
    },
    {
      username: 'mario',
      pin_hash: waiterPinHash,
      role: 'waiter',
      is_active: true,
      created_at: new Date()
    }
  ]);

  // === 4. CREA CATEGORIE MENU ===
  await knex('menu_categories').insert([
    {
      code: 'coppetta',
      name: 'Coppetta',
      icon: '🥄',
      base_price: 4.50,
      is_active: true,
      display_order: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      code: 'cono',
      name: 'Cono',
      icon: '🍦',
      base_price: 3.50,
      is_active: true,
      display_order: 2,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      code: 'crepes',
      name: 'Crêpes',
      icon: '🥞',
      base_price: 5.00,
      is_active: true,
      display_order: 3,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      code: 'frappe',
      name: 'Frappè',
      icon: '🥤',
      base_price: 4.00,
      is_active: true,
      display_order: 4,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  // === 5. CREA GUSTI PER OGNI CATEGORIA ===

  // Gusti per Coppetta e Cono (gelati)
  const gelatoFlavors = [
    'Fragola', 'Cioccolato', 'Vaniglia', 'Pistacchio',
    'Nocciola', 'Limone', 'Stracciatella', 'Caffè',
    'Cocco', 'Menta', 'Fior di Latte', 'Nutella'
  ];

  const coppettaFlavors = gelatoFlavors.map((name, index) => ({
    name,
    category_code: 'coppetta',
    is_available: true,
    display_order: index + 1,
    created_at: new Date(),
    updated_at: new Date()
  }));

  const conoFlavors = gelatoFlavors.map((name, index) => ({
    name,
    category_code: 'cono',
    is_available: true,
    display_order: index + 1,
    created_at: new Date(),
    updated_at: new Date()
  }));

  // Gusti per Crêpes
  const crepesFlavors = [
    'Nutella', 'Marmellata', 'Nutella e Banana',
    'Zucchero', 'Miele', 'Cioccolato Bianco',
    'Nutella e Fragole'
  ].map((name, index) => ({
    name,
    category_code: 'crepes',
    is_available: true,
    display_order: index + 1,
    created_at: new Date(),
    updated_at: new Date()
  }));

  // Gusti per Frappè
  const frappeFlavors = [
    'Fragola', 'Cioccolato', 'Vaniglia',
    'Banana', 'Caffè', 'Nocciola', 'Oreo'
  ].map((name, index) => ({
    name,
    category_code: 'frappe',
    is_available: true,
    display_order: index + 1,
    created_at: new Date(),
    updated_at: new Date()
  }));

  await knex('flavors').insert([
    ...coppettaFlavors,
    ...conoFlavors,
    ...crepesFlavors,
    ...frappeFlavors
  ]);

  console.log('✅ Seed completato con successo!');
  console.log('📊 Dati inseriti:');
  console.log('   - 14 tavoli (tutti free)');
  console.log('   - 2 utenti (admin: PIN 0000, mario: PIN 1234)');
  console.log('   - 4 categorie menu');
  console.log('   - Gusti configurati per ogni categoria');
};
