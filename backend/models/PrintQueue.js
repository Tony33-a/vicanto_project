const db = require('../services/database');

/**
 * Model: PrintQueue
 * Gestisce la coda di stampa con retry logic
 * Stati: pending, printing, printed, failed
 */
class PrintQueue {
  static tableName = 'print_queue';

  /**
   * Trova tutti i job in coda
   * @returns {Promise<Array>}
   */
  static async findAll() {
    return db(this.tableName)
      .select('*')
      .orderBy('created_at', 'asc');
  }

  /**
   * Trova job per ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    return db(this.tableName)
      .where({ id })
      .first();
  }

  /**
   * Trova prossimo job pending da stampare
   * @returns {Promise<Object|null>}
   */
  static async findNextPending() {
    return db(this.tableName)
      .where({ status: 'pending' })
      .orderBy('created_at', 'asc')
      .first();
  }

  /**
   * Trova tutti i job pending
   * @returns {Promise<Array>}
   */
  static async findPending() {
    return db(this.tableName)
      .where({ status: 'pending' })
      .orderBy('created_at', 'asc');
  }

  /**
   * Trova job per order_id
   * @param {number} orderId
   * @returns {Promise<Object|null>}
   */
  static async findByOrderId(orderId) {
    return db(this.tableName)
      .where({ order_id: orderId })
      .orderBy('created_at', 'desc')
      .first();
  }

  /**
   * Crea nuovo job di stampa
   * @param {number} orderId
   * @param {string} printerName (opzionale)
   * @param {Object} trx - Transazione Knex (opzionale)
   * @returns {Promise<Object>}
   */
  static async create(orderId, printerName = null, trx = null) {
    const dbContext = trx || db;

    const [job] = await dbContext(this.tableName)
      .insert({
        order_id: orderId,
        status: 'pending',
        printer_name: printerName,
        attempts: 0,
        max_attempts: 3,
        created_at: dbContext.fn.now()
      })
      .returning('*');

    return job;
  }

  /**
   * Imposta job come "printing" con OPTIMISTIC LOCKING
   * Aggiorna SOLO se status è ancora 'pending'
   * Previene race conditions con multiple istanze QueueWatcher
   * @param {number} id
   * @returns {Promise<Object|null>} - null se job già in processing
   */
  static async setPrinting(id) {
    const [job] = await db(this.tableName)
      .where({ id, status: 'pending' })  // WHERE critica per locking!
      .update({
        status: 'printing',
        started_at: db.fn.now()
      })
      .returning('*');

    return job || null;  // null se già preso da altra istanza
  }

  /**
   * Imposta job come "printed" (successo)
   * @param {number} id
   * @returns {Promise<Object>}
   */
  static async setPrinted(id) {
    const [job] = await db(this.tableName)
      .where({ id })
      .update({
        status: 'printed',
        printed_at: db.fn.now()
      })
      .returning('*');

    return job;
  }

  /**
   * Marca job come stampato (alias di setPrinted per compatibilità)
   * @param {number} id
   * @returns {Promise<Object>}
   */
  static async markPrinted(id) {
    return this.setPrinted(id);
  }

  /**
   * Incrementa tentativi e imposta errore
   * Se raggiunge max_attempts, imposta status = 'failed'
   * @param {number} id
   * @param {string} errorMessage
   * @param {string} errorStack (opzionale)
   * @returns {Promise<Object>}
   */
  static async incrementAttempts(id, errorMessage, errorStack = null) {
    const job = await this.findById(id);
    if (!job) throw new Error('Print job not found');

    const newAttempts = job.attempts + 1;
    const isFailed = newAttempts >= job.max_attempts;

    const [updatedJob] = await db(this.tableName)
      .where({ id })
      .update({
        attempts: newAttempts,
        status: isFailed ? 'failed' : 'pending',
        error_message: errorMessage,
        error_stack: errorStack,
        failed_at: isFailed ? db.fn.now() : null
      })
      .returning('*');

    return updatedJob;
  }

  /**
   * Resetta job failed per riprova manuale
   * @param {number} id
   * @returns {Promise<Object>}
   */
  static async retry(id) {
    const [job] = await db(this.tableName)
      .where({ id })
      .update({
        status: 'pending',
        attempts: 0,
        error_message: null,
        error_stack: null,
        failed_at: null
      })
      .returning('*');

    return job;
  }

  /**
   * Trova job falliti
   * @returns {Promise<Array>}
   */
  static async findFailed() {
    return db(this.tableName)
      .where({ status: 'failed' })
      .orderBy('created_at', 'desc');
  }

  /**
   * Elimina job
   * @param {number} id
   * @returns {Promise<number>}
   */
  static async delete(id) {
    return db(this.tableName).where({ id }).delete();
  }
}

module.exports = PrintQueue;
