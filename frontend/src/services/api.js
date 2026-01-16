import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Crea istanza axios configurata
const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor per aggiungere token a ogni richiesta
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor per gestire errori di risposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se 401 (non autorizzato), logout automatico
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export default api
