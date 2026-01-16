/**
 * Migration: Create print_queue table
 * Coda di stampa con retry logic (max 3 tentativi)
 */

exports.up = function(knex) {
  return knex.schema.createTable('print_queue', (table) => {
    table.increments('id').primary();
    table.integer('order_id')
      .notNullable()
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE');
    table.enum('status', ['pending', 'printing', 'printed', 'failed'])
      .notNullable()
      .defaultTo('pending');
    table.string('printer_name', 100);
    table.integer('attempts').defaultTo(0);
    table.integer('max_attempts').defaultTo(3);
    table.text('error_message');
    table.text('error_stack');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('started_at');
    table.timestamp('printed_at');
    table.timestamp('failed_at');

    // Indexes
    table.index('status', 'idx_print_queue_status');
    table.index('created_at', 'idx_print_queue_created');
    table.index('order_id', 'idx_print_queue_order');

    // Constraints
    table.check('attempts >= 0');
    table.check('max_attempts > 0');
    table.check('attempts <= max_attempts');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('print_queue');
};
