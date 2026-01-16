const db = require('../services/database');

/**
 * Model: Flavor
 * Gestisce i gusti disponibili per ogni categoria
 */
class Flavor {
  static tableName = 'flavors';

  /**
   * Trova tutti i gusti disponibili
   * @returns {Promise<Array>}
   */
  static async findAll() {
    return db(this.tableName)
      .select('*')
      .where({ is_available: true })
      .orderBy('category_code', 'asc')
      .orderBy('display_order', 'asc');
  }

  /**
   * Trova gusti per categoria
   * @param {string} categoryCode
   * @returns {Promise<Array>}
   */
  static async findByCategory(categoryCode) {
    return db(this.tableName)
      .where({ category_code: categoryCode, is_available: true })
      .orderBy('display_order', 'asc');
  }

  /**
   * Trova gusto per ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    return db(this.tableName)
      .where({ id })
      .first();
  }

  /**
   * Crea nuovo gusto
   * @param {Object} flavorData
   * @returns {Promise<Object>}
   */
  static async create(flavorData) {
    const [flavor] = await db(this.tableName)
      .insert({
        ...flavorData,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');

    return flavor;
  }

  /**
   * Aggiorna gusto
   * @param {number} id
   * @param {Object} flavorData
   * @returns {Promise<Object>}
   */
  static async update(id, flavorData) {
    const [flavor] = await db(this.tableName)
      .where({ id })
      .update({
        ...flavorData,
        updated_at: db.fn.now()
      })
      .returning('*');

    return flavor;
  }

  /**
   * Disattiva gusto
   * @param {number} id
   * @returns {Promise<Object>}
   */
  static async setUnavailable(id) {
    return this.update(id, { is_available: false });
  }
}

module.exports = Flavor;
