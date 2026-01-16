/**
 * Migration: Create menu_categories table
 * Categorie menu configurabili (Coppetta, Cono, Crêpes, Frappè)
 */

exports.up = function(knex) {
  return knex.schema.createTable('menu_categories', (table) => {
    table.increments('id').primary();
    table.string('code', 50).notNullable().unique();
    table.string('name', 100).notNullable();
    table.string('icon', 10);
    table.decimal('base_price', 10, 2).notNullable();
    table.boolean('is_active').defaultTo(true);
    table.integer('display_order').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('code', 'idx_menu_categories_code');
    table.index(['is_active', 'display_order'], 'idx_menu_categories_active');

    // Constraints
    table.check('base_price >= 0');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('menu_categories');
};
