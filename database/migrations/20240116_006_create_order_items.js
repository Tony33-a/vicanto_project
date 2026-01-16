/**
 * Migration: Create order_items table
 * Singoli item dentro un ordine (con gusti in JSONB)
 */

exports.up = function(knex) {
  return knex.schema.createTable('order_items', (table) => {
    table.increments('id').primary();
    table.integer('order_id')
      .notNullable()
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE');
    table.string('category', 50).notNullable();
    table.jsonb('flavors').notNullable();
    table.integer('quantity').notNullable();
    table.integer('course').notNullable().defaultTo(1);
    table.text('custom_note');
    table.decimal('unit_price', 10, 2).notNullable();
    table.decimal('total_price', 10, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('order_id', 'idx_order_items_order');
    table.index('category', 'idx_order_items_category');

    // Constraints
    table.check('quantity > 0');
    table.check('course >= 1 AND course <= 5');
    table.check('unit_price >= 0');
    table.check('total_price >= 0');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('order_items');
};
