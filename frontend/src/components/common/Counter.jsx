import './Counter.css'

/**
 * Counter +/- per quantita e portate
 * @param {number} value - Valore corrente
 * @param {function} onChange - Callback cambio valore
 * @param {number} min - Valore minimo (default 1)
 * @param {number} max - Valore massimo (default 99)
 * @param {string} label - Label opzionale
 * @param {string} size - 'small' | 'medium' | 'large'
 */
function Counter({
  value,
  onChange,
  min = 1,
  max = 99,
  label,
  size = 'medium'
}) {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  return (
    <div className={`counter counter-${size}`}>
      {label && <span className="counter-label">{label}</span>}
      <div className="counter-controls">
        <button
          type="button"
          className="counter-btn counter-decrease"
          onClick={handleDecrease}
          disabled={value <= min}
        >
          -
        </button>
        <span className="counter-value">{value}</span>
        <button
          type="button"
          className="counter-btn counter-increase"
          onClick={handleIncrease}
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  )
}

export default Counter
