const db = require('../services/database');

/**
 * Model: Supplement
 * Gestisce i supplementi aggiuntivi (Panna, Smarties, Granella, etc.)
 */
class Supplement {
  static tableName = 'supplements';

  /**
   * Trova tutti i supplementi disponibili
   * @returns {Promise<Array>}
   */
  static async findAll() {
    return db(this.tableName)
      .select('*')
      .where({ is_available: true })
      .orderBy('display_order', 'asc');
  }

  /**
   * Trova supplemento per ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    return db(this.tableName)
      .where({ id })
      .first();
  }

  /**
   * Trova supplemento per code
   * @param {string} code
   * @returns {Promise<Object|null>}
   */
  static async findByCode(code) {
    return db(this.tableName)
      .where({ code })
      .first();
  }

  /**
   * Trova supplementi per lista di IDs
   * @param {Array<number>} ids
   * @returns {Promise<Array>}
   */
  static async findByIds(ids) {
    if (!ids || ids.length === 0) return [];
    return db(this.tableName)
      .whereIn('id', ids)
      .where({ is_available: true })
      .orderBy('display_order', 'asc');
  }

  /**
   * Crea nuovo supplemento
   * @param {Object} supplementData
   * @returns {Promise<Object>}
   */
  static async create(supplementData) {
    const [supplement] = await db(this.tableName)
      .insert({
        ...supplementData,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');

    return supplement;
  }

  /**
   * Aggiorna supplemento
   * @param {number} id
   * @param {Object} supplementData
   * @returns {Promise<Object>}
   */
  static async update(id, supplementData) {
    const [supplement] = await db(this.tableName)
      .where({ id })
      .update({
        ...supplementData,
        updated_at: db.fn.now()
      })
      .returning('*');

    return supplement;
  }

  /**
   * Disattiva supplemento
   * @param {number} id
   * @returns {Promise<Object>}
   */
  static async setUnavailable(id) {
    return this.update(id, { is_available: false });
  }

  /**
   * Calcola totale supplementi da array di IDs
   * @param {Array<number>} ids
   * @returns {Promise<number>}
   */
  static async calculateTotal(ids) {
    if (!ids || ids.length === 0) return 0;

    const result = await db(this.tableName)
      .whereIn('id', ids)
      .where({ is_available: true })
      .sum('price as total')
      .first();

    return parseFloat(result?.total || 0);
  }
}

module.exports = Supplement;
