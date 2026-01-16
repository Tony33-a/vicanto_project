/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tables', (table) => {
    table.increments('id').primary();
    table.string('number').notNullable().unique();
    table.string('name').nullable(); // Nome opzionale (es: "Terrazza 1")
    table.integer('capacity').defaultTo(4); // Capacità persone
    table.enum('status', ['available', 'occupied', 'reserved', 'cleaning']).defaultTo('available');
    table.integer('waiter_id').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable();
    table.integer('display_order').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('tables');
};