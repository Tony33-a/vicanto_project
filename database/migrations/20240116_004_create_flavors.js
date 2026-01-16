/**
 * Migration: Create flavors table
 * Gusti disponibili per ogni categoria menu
 */

exports.up = function(knex) {
  return knex.schema.createTable('flavors', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('category_code', 50)
      .references('code')
      .inTable('menu_categories')
      .onDelete('CASCADE');
    table.boolean('is_available').defaultTo(true);
    table.integer('display_order').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Index
    table.index('category_code', 'idx_flavors_category');
    table.index(['is_available', 'display_order'], 'idx_flavors_active');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('flavors');
};
