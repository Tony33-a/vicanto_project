function MonitorDashboard() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Panoramica generale del sistema</p>
      </div>

      <div className="grid grid-4">
        <div className="card">
          <h3>Ordini Attivi</h3>
          <p className="stat-value">12</p>
        </div>

        <div className="card">
          <h3>Tavoli Occupati</h3>
          <p className="stat-value">8/20</p>
        </div>

        <div className="card">
          <h3>Incasso Oggi</h3>
          <p className="stat-value">€425.50</p>
        </div>

        <div className="card">
          <h3>Camerieri Attivi</h3>
          <p className="stat-value">3</p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 'var(--spacing-xl)' }}>
        <div className="card">
          <div className="card-header">
            <h3>Ultimi Ordini</h3>
          </div>
          <p>Lista ordini recenti...</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Stato Tavoli</h3>
          </div>
          <p>Mappa tavoli...</p>
        </div>
      </div>
    </div>
  )
}

export default MonitorDashboard
