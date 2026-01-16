const db = require('../services/database');
const bcrypt = require('bcrypt');

/**
 * Model: User
 * Gestisce utenti (camerieri, admin) con autenticazione PIN
 */
class User {
  static tableName = 'users';

  /**
   * Trova tutti gli utenti attivi
   * @returns {Promise<Array>}
   */
  static async findAll() {
    return db(this.tableName)
      .select('id', 'username', 'role', 'is_active', 'created_at', 'last_login')
      .where({ is_active: true })
      .orderBy('username', 'asc');
  }

  /**
   * Trova utente per ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    return db(this.tableName)
      .select('id', 'username', 'role', 'is_active', 'created_at', 'last_login')
      .where({ id })
      .first();
  }

  /**
   * Trova utente per username (include pin_hash per autenticazione)
   * @param {string} username
   * @returns {Promise<Object|null>}
   */
  static async findByUsername(username) {
    return db(this.tableName)
      .where({ username })
      .first();
  }

  /**
   * Crea nuovo utente con PIN hash
   * @param {Object} userData - { username, pin, role }
   * @returns {Promise<Object>}
   */
  static async create(userData) {
    // Hash del PIN (4 cifre)
    const pin_hash = await bcrypt.hash(userData.pin, 10);

    const [user] = await db(this.tableName)
      .insert({
        username: userData.username,
        pin_hash,
        role: userData.role || 'waiter',
        is_active: true,
        created_at: db.fn.now()
      })
      .returning(['id', 'username', 'role', 'is_active', 'created_at']);

    return user;
  }

  /**
   * Verifica PIN utente
   * @param {string} username
   * @param {string} pin - PIN in chiaro (4 cifre)
   * @returns {Promise<Object|null>} - User object se PIN corretto, null altrimenti
   */
  static async verifyPin(username, pin) {
    const user = await this.findByUsername(username);

    if (!user || !user.is_active) {
      return null;
    }

    const isValid = await bcrypt.compare(pin, user.pin_hash);

    if (!isValid) {
      return null;
    }

    // Aggiorna last_login
    await db(this.tableName)
      .where({ id: user.id })
      .update({ last_login: db.fn.now() });

    // Ritorna user senza pin_hash
    const { pin_hash, ...userWithoutHash } = user;
    return userWithoutHash;
  }

  /**
   * Aggiorna utente
   * @param {number} id
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  static async update(id, userData) {
    const updateData = { ...userData };

    // Se viene fornito un nuovo PIN, hashalo
    if (updateData.pin) {
      updateData.pin_hash = await bcrypt.hash(updateData.pin, 10);
      delete updateData.pin;
    }

    const [user] = await db(this.tableName)
      .where({ id })
      .update(updateData)
      .returning(['id', 'username', 'role', 'is_active', 'created_at', 'last_login']);

    return user;
  }

  /**
   * Disattiva utente (soft delete)
   * @param {number} id
   * @returns {Promise<Object>}
   */
  static async deactivate(id) {
    return this.update(id, { is_active: false });
  }
}

module.exports = User;
