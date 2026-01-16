import api from './api'

/**
 * Service per gestione tavoli
 */
const tablesService = {
  /**
   * Ottieni tutti i tavoli
   * @returns {Promise<Array>}
   */
  async getAll() {
    const response = await api.get('/tables')
    return response.data.data
  },

  /**
   * Ottieni tavolo per ID con ordine corrente
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async getById(id) {
    const response = await api.get(`/tables/${id}`)
    return response.data.data
  },

  /**
   * Aggiorna stato tavolo
   * @param {number} id
   * @param {Object} data - { status, covers, total }
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    const response = await api.put(`/tables/${id}`, data)
    return response.data.data
  },

  /**
   * Libera tavolo (reset)
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async free(id) {
    const response = await api.put(`/tables/${id}/free`)
    return response.data.data
  }
}

export default tablesService
