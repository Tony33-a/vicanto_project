/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('orders', (table) => {
    table.increments('id').primary();
    table.string('order_number').notNullable().unique(); // Numero ordine univoco
    table.integer('table_id').unsigned().references('id').inTable('tables').onDelete('SET NULL').nullable();
    table.integer('waiter_id').unsigned().references('id').inTable('users').onDelete('SET NULL').notNullable();
    table.enum('status', ['pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled']).defaultTo('pending');
    table.enum('type', ['dine_in', 'takeaway', 'delivery']).defaultTo('dine_in');
    table.decimal('subtotal', 10, 2).defaultTo(0);
    table.decimal('tax', 10, 2).defaultTo(0);
    table.decimal('discount', 10, 2).defaultTo(0);
    table.decimal('total', 10, 2).defaultTo(0);
    table.string('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('paid_at').nullable();
    
    table.index('table_id');
    table.index('waiter_id');
    table.index('status');
    table.index('order_number');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('orders');
};