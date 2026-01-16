import api from './api'

/**
 * Service per gestione menu (categorie, gusti, supplementi)
 */
const menuService = {
  /**
   * Ottieni menu completo (categorie con gusti + supplementi)
   * @returns {Promise<Object>} - { categories, supplements }
   */
  async getFullMenu() {
    const response = await api.get('/menu/full')
    return response.data.data
  },

  /**
   * Ottieni tutte le categorie
   * @returns {Promise<Array>}
   */
  async getCategories() {
    const response = await api.get('/menu/categories')
    return response.data.data
  },

  /**
   * Ottieni categoria con gusti
   * @param {string} code - es: 'coppetta', 'cono'
   * @returns {Promise<Object>}
   */
  async getCategoryByCode(code) {
    const response = await api.get(`/menu/categories/${code}`)
    return response.data.data
  },

  /**
   * Ottieni gusti per categoria
   * @param {string} categoryCode
   * @returns {Promise<Array>}
   */
  async getFlavorsByCategory(categoryCode) {
    const response = await api.get(`/menu/flavors/${categoryCode}`)
    return response.data.data
  },

  /**
   * Ottieni tutti i supplementi
   * @returns {Promise<Array>}
   */
  async getSupplements() {
    const response = await api.get('/menu/supplements')
    return response.data.data
  }
}

export default menuService
