/**
 * Migration: Add supplements column to order_items
 * Aggiunge colonna per memorizzare supplementi selezionati
 */

exports.up = function(knex) {
  return knex.schema.alterTable('order_items', (table) => {
    // JSONB array per supplementi: [{ id: 1, name: 'Panna', price: 0.50 }, ...]
    table.jsonb('supplements').defaultTo('[]');
    // Prezzo totale supplementi per questo item
    table.decimal('supplements_total', 10, 2).defaultTo(0);
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('order_items', (table) => {
    table.dropColumn('supplements');
    table.dropColumn('supplements_total');
  });
};
