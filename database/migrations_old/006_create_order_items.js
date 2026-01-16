/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('order_items', (table) => {
    table.increments('id').primary();
    table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE').notNullable();
    table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE').notNullable();
    table.integer('quantity').notNullable().defaultTo(1);
    table.decimal('unit_price', 10, 2).notNullable(); // Prezzo al momento dell'ordine
    table.decimal('total_price', 10, 2).notNullable(); // quantity * unit_price
    table.enum('status', ['pending', 'preparing', 'ready', 'served', 'cancelled']).defaultTo('pending');
    table.string('notes').nullable(); // Note specifiche per questo item (es: "senza cipolla")
    table.json('modifications').nullable(); // Modifiche/modificatori applicati
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('order_id');
    table.index('product_id');
    table.index('status');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('order_items');
};