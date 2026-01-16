/**
 * Migration: Create users table
 * Utenti sistema (camerieri, admin) con PIN 4 cifre
 */

exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username', 50).notNullable().unique();
    table.string('pin_hash', 255).notNullable(); // bcrypt hash del PIN (4 cifre)
    table.enum('role', ['waiter', 'admin'])
      .notNullable()
      .defaultTo('waiter');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('last_login');

    // Index
    table.index('username', 'idx_users_username');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};
