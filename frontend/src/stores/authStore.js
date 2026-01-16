import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (username, pin) => {
        try {
          const response = await axios.post(`${API_URL}/api/auth/login`, {
            username,
            pin,
          })

          const { user, token } = response.data

          // Imposta token per tutte le richieste future
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

          set({
            user,
            token,
            isAuthenticated: true,
          })

          return { success: true, user }
        } catch (error) {
          console.error('Login failed:', error)
          return {
            success: false,
            error: error.response?.data?.error || 'Login fallito',
          }
        }
      },

      logout: () => {
        delete axios.defaults.headers.common['Authorization']

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      // Ripristina token al caricamento
      initAuth: () => {
        const { token } = get()
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
      },
    }),
    {
      name: 'vicanto-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Inizializza auth al caricamento
useAuthStore.getState().initAuth()
