/**
 * Migration: Create supplements table
 * Supplementi aggiuntivi per i prodotti (Panna, Smarties, Granella, etc.)
 */

exports.up = function(knex) {
  return knex.schema.createTable('supplements', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('code', 50).notNullable().unique();
    table.decimal('price', 10, 2).notNullable().defaultTo(0.50);
    table.string('icon', 10).nullable(); // Emoji icon
    table.integer('display_order').defaultTo(0);
    table.boolean('is_available').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('is_available');
    table.index('display_order');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('supplements');
};
