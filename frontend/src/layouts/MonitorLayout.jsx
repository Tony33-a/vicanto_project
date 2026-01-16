import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { socketService } from '../services/socket'
import { useEffect } from 'react'
import MonitorDashboard from '../pages/monitor/Dashboard'
import MonitorOrders from '../pages/monitor/Orders'
import MonitorTables from '../pages/monitor/Tables'
import MonitorWaiters from '../pages/monitor/Waiters'
import MonitorSettings from '../pages/monitor/Settings'
import '../styles/MonitorLayout.css'

function MonitorLayout() {
  const { user, token, logout } = useAuthStore()

  useEffect(() => {
    // Connetti Socket.IO per monitor
    socketService.connect(token)
    socketService.joinRoom('monitor')

    return () => {
      socketService.leaveRoom('monitor')
      socketService.disconnect()
    }
  }, [token])

  const handleLogout = () => {
    socketService.disconnect()
    logout()
  }

  return (
    <div className="monitor-layout">
      {/* Sidebar Navigation */}
      <aside className="monitor-sidebar">
        <div className="sidebar-header">
          <h2>ViCanto</h2>
          <p className="user-info">{user?.username}</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/monitor/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/monitor/orders" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">📝</span>
            <span>Ordini</span>
          </NavLink>

          <NavLink to="/monitor/tables" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">🪑</span>
            <span>Tavoli</span>
          </NavLink>

          <NavLink to="/monitor/waiters" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">👥</span>
            <span>Camerieri</span>
          </NavLink>

          <NavLink to="/monitor/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">⚙️</span>
            <span>Impostazioni</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <span className="nav-icon">🚪</span>
            <span>Esci</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="monitor-main">
        <Routes>
          <Route path="/" element={<Navigate to="/monitor/dashboard" replace />} />
          <Route path="/dashboard" element={<MonitorDashboard />} />
          <Route path="/orders" element={<MonitorOrders />} />
          <Route path="/tables" element={<MonitorTables />} />
          <Route path="/waiters" element={<MonitorWaiters />} />
          <Route path="/settings" element={<MonitorSettings />} />
        </Routes>
      </main>
    </div>
  )
}

export default MonitorLayout
