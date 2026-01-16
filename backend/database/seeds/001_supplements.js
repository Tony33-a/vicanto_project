/**
 * Seed: Supplementi iniziali per gelateria
 */

exports.seed = async function(knex) {
  // Pulisci tabella
  await knex('supplements').del();

  // Inserisci supplementi
  await knex('supplements').insert([
    {
      name: 'Panna',
      code: 'panna',
      price: 0.50,
      icon: null,
      display_order: 1,
      is_available: true
    },
    {
      name: 'Smarties',
      code: 'smarties',
      price: 0.50,
      icon: null,
      display_order: 2,
      is_available: true
    },
    {
      name: 'Granella di Nocciola',
      code: 'granella_nocciola',
      price: 0.70,
      icon: null,
      display_order: 3,
      is_available: true
    },
    {
      name: 'Granella di Pistacchio',
      code: 'granella_pistacchio',
      price: 0.80,
      icon: null,
      display_order: 4,
      is_available: true
    },
    {
      name: 'Cioccolato Fuso',
      code: 'cioccolato_fuso',
      price: 0.60,
      icon: null,
      display_order: 5,
      is_available: true
    },
    {
      name: 'Nutella',
      code: 'nutella',
      price: 0.70,
      icon: null,
      display_order: 6,
      is_available: true
    },
    {
      name: 'Caramello',
      code: 'caramello',
      price: 0.50,
      icon: null,
      display_order: 7,
      is_available: true
    },
    {
      name: 'Frutti di Bosco',
      code: 'frutti_bosco',
      price: 0.80,
      icon: null,
      display_order: 8,
      is_available: true
    },
    {
      name: 'Cialda',
      code: 'cialda',
      price: 0.30,
      icon: null,
      display_order: 9,
      is_available: true
    },
    {
      name: 'Amarena',
      code: 'amarena',
      price: 0.60,
      icon: null,
      display_order: 10,
      is_available: true
    }
  ]);
};
