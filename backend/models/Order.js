const db = require('../services/database');

/**
 * Model: Order
 * Gestisce gli ordini della gelateria
 * Stati: pending, sent, completed, cancelled
 */
class Order {
  static tableName = 'orders';

  /**
   * Trova tutti gli ordini con filtri
   * @param {Object} filters - { status, table_id, user_id }
   * @returns {Promise<Array>}
   */
  static async findAll(filters = {}) {
    let query = db(this.tableName)
      .select(
        'orders.*',
        'tables.number as table_number',
        'users.username as waiter_username'
      )
      .leftJoin('tables', 'orders.table_id', 'tables.id')
      .leftJoin('users', 'orders.user_id', 'users.id');

    if (filters.status) {
      query = query.where('orders.status', filters.status);
    }

    if (filters.table_id) {
      query = query.where('orders.table_id', filters.table_id);
    }

    if (filters.user_id) {
      query = query.where('orders.user_id', filters.user_id);
    }

    return query.orderBy('orders.created_at', 'desc');
  }

  /**
   * Trova ordine per ID con items (OTTIMIZZATO - Single Query con LEFT JOIN)
   * Riduce N+1 queries a 1 singola query
   * @param {number} id
   * @param {Object} trx - Transazione Knex (opzionale)
   * @returns {Promise<Object|null>}
   */
  static async findById(id, trx = null) {
    const dbContext = trx || db;

    // Single query con LEFT JOIN per evitare N+1
    const rows = await dbContext(this.tableName)
      .select(
        'orders.*',
        'tables.number as table_number',
        'users.username as waiter_username',
        'order_items.id as item_id',
        'order_items.category as item_category',
        'order_items.flavors as item_flavors',
        'order_items.quantity as item_quantity',
        'order_items.course as item_course',
        'order_items.custom_note as item_custom_note',
        'order_items.unit_price as item_unit_price',
        'order_items.total_price as item_total_price',
        'order_items.created_at as item_created_at'
      )
      .leftJoin('tables', 'orders.table_id', 'tables.id')
      .leftJoin('users', 'orders.user_id', 'users.id')
      .leftJoin('order_items', 'orders.id', 'order_items.order_id')
      .where('orders.id', id)
      .orderBy('order_items.course', 'asc')
      .orderBy('order_items.created_at', 'asc');

    if (rows.length === 0) return null;

    // Costruisci oggetto order dalla prima row
    const firstRow = rows[0];
    const order = {
      id: firstRow.id,
      table_id: firstRow.table_id,
      table_number: firstRow.table_number,
      user_id: firstRow.user_id,
      waiter_username: firstRow.waiter_username,
      status: firstRow.status,
      covers: firstRow.covers,
      subtotal: firstRow.subtotal,
      cover_charge: firstRow.cover_charge,
      total: firstRow.total,
      notes: firstRow.notes,
      created_at: firstRow.created_at,
      sent_at: firstRow.sent_at,
      completed_at: firstRow.completed_at,
      cancelled_at: firstRow.cancelled_at,
      items: []
    };

    // Raggruppa items dalle rows
    rows.forEach(row => {
      if (row.item_id) {
        order.items.push({
          id: row.item_id,
          category: row.item_category,
          flavors: row.item_flavors,
          quantity: row.item_quantity,
          course: row.item_course,
          custom_note: row.item_custom_note,
          unit_price: row.item_unit_price,
          total_price: row.item_total_price,
          created_at: row.item_created_at
        });
      }
    });

    return order;
  }

  /**
   * Trova ordini attivi (pending o sent)
   * @returns {Promise<Array>}
   */
  static async findActive() {
    return db(this.tableName)
      .select(
        'orders.*',
        'tables.number as table_number',
        'users.username as waiter_username'
      )
      .leftJoin('tables', 'orders.table_id', 'tables.id')
      .leftJoin('users', 'orders.user_id', 'users.id')
      .whereIn('orders.status', ['pending', 'sent'])
      .orderBy('orders.created_at', 'asc');
  }

  /**
   * Crea nuovo ordine
   * @param {Object} orderData - { table_id, user_id, covers, items, notes }
   * @param {Object} trx - Transazione Knex (opzionale)
   * @returns {Promise<Object>}
   */
  static async create(orderData, trx = null) {
    const dbContext = trx || db;
    const { items, ...orderFields } = orderData;

    // Calcola subtotal dai items
    let subtotal = 0;
    if (items && items.length > 0) {
      subtotal = items.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price);
      }, 0);
    }

    // Calcola coperto (€1 per coperto)
    const cover_charge = orderFields.covers * 1.00;

    // Totale
    const total = subtotal + cover_charge;

    // Crea ordine
    const [order] = await dbContext(this.tableName)
      .insert({
        table_id: orderFields.table_id,
        user_id: orderFields.user_id,
        status: 'pending',
        covers: orderFields.covers,
        subtotal,
        cover_charge,
        total,
        notes: orderFields.notes || null,
        created_at: dbContext.fn.now()
      })
      .returning('*');

    // Inserisci items se presenti
    if (items && items.length > 0) {
      const orderItems = items.map(item => ({
        order_id: order.id,
        category: item.category,
        flavors: JSON.stringify(item.flavors), // Converte array a JSON
        quantity: item.quantity,
        course: item.course || 1,
        custom_note: item.custom_note || null,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        created_at: dbContext.fn.now()
      }));

      await dbContext('order_items').insert(orderItems);
    }

    return order;
  }

  /**
   * Invia ordine (cambia stato a 'sent')
   * @param {number} id
   * @param {Object} trx - Transazione Knex (opzionale)
   * @returns {Promise<Object>}
   */
  static async send(id, trx = null) {
    const dbContext = trx || db;

    const [order] = await dbContext(this.tableName)
      .where({ id })
      .update({
        status: 'sent',
        sent_at: dbContext.fn.now()
      })
      .returning('*');

    return order;
  }

  /**
   * Completa ordine
   * @param {number} id
   * @param {Object} trx - Transazione Knex (opzionale)
   * @returns {Promise<Object>}
   */
  static async complete(id, trx = null) {
    const dbContext = trx || db;

    const [order] = await dbContext(this.tableName)
      .where({ id })
      .update({
        status: 'completed',
        completed_at: dbContext.fn.now()
      })
      .returning('*');

    return order;
  }

  /**
   * Cancella ordine
   * @param {number} id
   * @param {Object} trx - Transazione Knex (opzionale)
   * @returns {Promise<Object>}
   */
  static async cancel(id, trx = null) {
    const dbContext = trx || db;

    const [order] = await dbContext(this.tableName)
      .where({ id })
      .update({
        status: 'cancelled',
        cancelled_at: dbContext.fn.now()
      })
      .returning('*');

    return order;
  }

  /**
   * Aggiorna ordine
   * @param {number} id
   * @param {Object} orderData
   * @returns {Promise<Object>}
   */
  static async update(id, orderData) {
    const [order] = await db(this.tableName)
      .where({ id })
      .update(orderData)
      .returning('*');

    return order;
  }

  /**
   * Elimina ordine (hard delete)
   * @param {number} id
   * @returns {Promise<number>}
   */
  static async delete(id) {
    return db(this.tableName).where({ id }).delete();
  }
}

module.exports = Order;
