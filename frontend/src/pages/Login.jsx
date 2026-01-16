import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import '../styles/Login.css'

function Login() {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validazione PIN
    if (!/^\d{4}$/.test(pin)) {
      setError('Il PIN deve essere di 4 cifre')
      return
    }

    setLoading(true)

    const result = await login(username, pin)

    if (!result.success) {
      setError(result.error)
      setLoading(false)
    }
    // Se success, App.jsx gestira il redirect automaticamente
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>ViCanto</h1>
          <p>Sistema di Gestione Gelateria</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Inserisci username"
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="pin">PIN</label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="4 cifre"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        <div className="login-footer">
          <p>Sviluppato per ViCanto Gelateria</p>
        </div>
      </div>
    </div>
  )
}

export default Login
