import './TableCard.css'

/**
 * Card tavolo per griglia
 * @param {Object} table - Dati tavolo
 * @param {function} onClick - Callback click
 */
function TableCard({ table, onClick }) {
  const { number, status, covers, total } = table

  const getStatusLabel = () => {
    switch (status) {
      case 'pending':
        return 'IN ATTESA'
      case 'occupied':
        return 'OCCUPATO'
      default:
        return 'LIBERO'
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price || 0)
  }

  return (
    <button
      className={`table-card table-card-${status}`}
      onClick={() => onClick(table)}
    >
      <span className="table-number">{number}</span>

      {status === 'free' ? (
        <span className="table-status-label">{getStatusLabel()}</span>
      ) : (
        <>
          <span className="table-status-label">{getStatusLabel()}</span>
          <span className="table-covers">{covers} Coperti</span>
          <span className="table-total">{formatPrice(total)}</span>
        </>
      )}
    </button>
  )
}

export default TableCard
