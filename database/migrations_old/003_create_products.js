/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('products', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('description').nullable();
    table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('SET NULL');
    table.decimal('price', 10, 2).notNullable();
    table.decimal('cost', 10, 2).nullable(); // Costo per analisi
    table.string('barcode').nullable();
    table.string('sku').nullable();
    table.string('image_url').nullable();
    table.boolean('is_available').defaultTo(true);
    table.boolean('requires_preparation').defaultTo(false); // Per cucina
    table.integer('preparation_time').nullable(); // Minuti
    table.integer('display_order').defaultTo(0);
    table.json('options').nullable(); // Opzioni extra (tipo pizza, ingredienti, etc.)
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('category_id');
    table.index('barcode');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('products');
};