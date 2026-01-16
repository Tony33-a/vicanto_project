/**
 * Migration: Create orders table
 * Ordini completi della gelateria
 */

exports.up = function(knex) {
  return knex.schema.createTable('orders', (table) => {
    table.increments('id').primary();
    table.integer('table_id')
      .notNullable()
      .references('id')
      .inTable('tables')
      .onDelete('CASCADE');
    table.integer('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');
    table.enum('status', ['pending', 'sent', 'completed', 'cancelled'])
      .notNullable()
      .defaultTo('pending');
    table.integer('covers').notNullable();
    table.decimal('subtotal', 10, 2).notNullable();
    table.decimal('cover_charge', 10, 2).notNullable();
    table.decimal('total', 10, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('sent_at');
    table.timestamp('completed_at');
    table.timestamp('cancelled_at');
    table.text('notes');

    // Indexes per performance
    table.index('table_id', 'idx_orders_table');
    table.index('status', 'idx_orders_status');
    table.index('created_at', 'idx_orders_created');

    // Constraints
    table.check('covers > 0');
    table.check('subtotal >= 0');
    table.check('cover_charge >= 0');
    table.check('total >= 0');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('orders');
};
