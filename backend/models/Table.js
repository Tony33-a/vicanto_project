const db = require('../services/database');

/**
 * Model: Table
 * Gestisce i tavoli della gelateria
 * Stati: free, pending, occupied
 */
class Table {
  static tableName = 'tables';

  /**
   * Trova tutti i tavoli
   * @returns {Promise<Array>}
   */
  static async findAll() {
    return db(this.tableName)
      .select('*')
      .orderBy('number', 'asc');
  }

  /**
   * Trova tavolo per ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    return db(this.tableName)
      .where({ id })
      .first();
  }

  /**
   * Trova tavolo per numero
   * @param {number} number
   * @returns {Promise<Object|null>}
   */
  static async findByNumber(number) {
    return db(this.tableName)
      .where({ number })
      .first();
  }

  /**
   * Trova tavolo con ordine corrente (se esiste)
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findByIdWithOrder(id) {
    const table = await this.findById(id);
    if (!table) return null;

    // Se tavolo è pending o occupied, carica l'ordine attivo
    if (table.status === 'pending' || table.status === 'occupied') {
      const order = await db('orders')
        .where({ table_id: id })
        .whereIn('status', ['pending', 'sent'])
        .orderBy('created_at', 'desc')
        .first();

      if (order) {
        // Carica anche gli items dell'ordine
        const items = await db('order_items')
          .where({ order_id: order.id })
          .orderBy('course', 'asc')
          .orderBy('created_at', 'asc');

        table.current_order = {
          ...order,
          items
        };
      }
    }

    return table;
  }

  /**
   * Aggiorna stato tavolo
   * @param {number} id
   * @param {Object} data - { status, covers, total }
   * @param {Object} trx - Transazione Knex (opzionale)
   * @returns {Promise<Object>}
   */
  static async update(id, data, trx = null) {
    const dbContext = trx || db;

    const [table] = await dbContext(this.tableName)
      .where({ id })
      .update({
        ...data,
        updated_at: dbContext.fn.now()
      })
      .returning('*');

    return table;
  }

  /**
   * Libera tavolo (reset a free)
   * @param {number} id
   * @param {Object} trx - Transazione Knex (opzionale)
   * @returns {Promise<Object>}
   */
  static async free(id, trx = null) {
    return this.update(id, {
      status: 'free',
      covers: 0,
      total: 0.00
    }, trx);
  }

  /**
   * Imposta tavolo come pending
   * @param {number} id
   * @param {number} covers
   * @param {number} total
   * @param {Object} trx - Transazione Knex (opzionale)
   * @returns {Promise<Object>}
   */
  static async setPending(id, covers, total, trx = null) {
    return this.update(id, {
      status: 'pending',
      covers,
      total
    }, trx);
  }

  /**
   * Imposta tavolo come occupied
   * @param {number} id
   * @param {number} covers
   * @param {number} total
   * @param {Object} trx - Transazione Knex (opzionale)
   * @returns {Promise<Object>}
   */
  static async setOccupied(id, covers, total, trx = null) {
    return this.update(id, {
      status: 'occupied',
      covers,
      total
    }, trx);
  }

  /**
   * Trova tutti i tavoli liberi
   * @returns {Promise<Array>}
   */
  static async findFree() {
    return db(this.tableName)
      .where({ status: 'free' })
      .orderBy('number', 'asc');
  }

  /**
   * Trova tutti i tavoli occupati
   * @returns {Promise<Array>}
   */
  static async findOccupied() {
    return db(this.tableName)
      .where({ status: 'occupied' })
      .orderBy('number', 'asc');
  }
}

module.exports = Table;
