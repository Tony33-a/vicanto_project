/**
 * Migration: Create tables table
 * Gestisce stato tavoli della gelateria (14 tavoli)
 */

exports.up = function(knex) {
  return knex.schema.createTable('tables', (table) => {
    table.increments('id').primary();
    table.integer('number').notNullable().unique();
    table.enum('status', ['free', 'pending', 'occupied'])
      .notNullable()
      .defaultTo('free');
    table.integer('covers').defaultTo(0);
    table.decimal('total', 10, 2).defaultTo(0.00);
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes per performance
    table.index('status', 'idx_tables_status');
    table.index('number', 'idx_tables_number');

    // Constraints
    table.check('number > 0 AND number <= 50');
    table.check('covers >= 0');
    table.check('total >= 0');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('tables');
};
