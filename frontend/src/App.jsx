import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Login from './pages/Login'
import MonitorLayout from './layouts/MonitorLayout'
import TabletLayout from './layouts/TabletLayout'
import './styles/App.css'

function App() {
  const { user, isAuthenticated } = useAuthStore()

  // Redirect to login se non autenticato
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Determina quale interfaccia mostrare in base al ruolo
  const isAdmin = user?.role === 'admin'

  return (
    <Routes>
      {isAdmin ? (
        <>
          {/* Interfaccia Monitor Touch - Solo Admin */}
          <Route path="/monitor/*" element={<MonitorLayout />} />
          <Route path="*" element={<Navigate to="/monitor" replace />} />
        </>
      ) : (
        <>
          {/* Interfaccia Tablet Camerieri - Waiter */}
          <Route path="/tablet/*" element={<TabletLayout />} />
          <Route path="*" element={<Navigate to="/tablet" replace />} />
        </>
      )}
    </Routes>
  )
}

export default App
