const db = require('../services/database');

/**
 * Model: MenuCategory
 * Gestisce le categorie menu (Coppetta, Cono, Crêpes, Frappè)
 */
class MenuCategory {
  static tableName = 'menu_categories';

  /**
   * Trova tutte le categorie attive
   * @returns {Promise<Array>}
   */
  static async findAll() {
    return db(this.tableName)
      .select('*')
      .where({ is_active: true })
      .orderBy('display_order', 'asc');
  }

  /**
   * Trova categoria per ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    return db(this.tableName)
      .where({ id })
      .first();
  }

  /**
   * Trova categoria per code
   * @param {string} code - es: 'coppetta', 'cono'
   * @returns {Promise<Object|null>}
   */
  static async findByCode(code) {
    return db(this.tableName)
      .where({ code })
      .first();
  }

  /**
   * Trova categoria con i suoi gusti
   * @param {string} code
   * @returns {Promise<Object|null>}
   */
  static async findByCodeWithFlavors(code) {
    const category = await this.findByCode(code);
    if (!category) return null;

    const flavors = await db('flavors')
      .where({ category_code: code, is_available: true })
      .orderBy('display_order', 'asc');

    return {
      ...category,
      flavors
    };
  }

  /**
   * Crea nuova categoria
   * @param {Object} categoryData
   * @returns {Promise<Object>}
   */
  static async create(categoryData) {
    const [category] = await db(this.tableName)
      .insert({
        ...categoryData,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');

    return category;
  }

  /**
   * Aggiorna categoria
   * @param {number} id
   * @param {Object} categoryData
   * @returns {Promise<Object>}
   */
  static async update(id, categoryData) {
    const [category] = await db(this.tableName)
      .where({ id })
      .update({
        ...categoryData,
        updated_at: db.fn.now()
      })
      .returning('*');

    return category;
  }

  /**
   * Disattiva categoria
   * @param {number} id
   * @returns {Promise<Object>}
   */
  static async deactivate(id) {
    return this.update(id, { is_active: false });
  }
}

module.exports = MenuCategory;
