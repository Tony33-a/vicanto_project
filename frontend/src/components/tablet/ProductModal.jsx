import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Counter from '../common/Counter'
import './ProductModal.css'

/**
 * Modal per configurare prodotto prima di aggiungerlo all'ordine
 * - Numero portata
 * - Quantita
 * - Note
 * - Supplementi (checkbox)
 */
function ProductModal({
  isOpen,
  onClose,
  product,
  supplements = [],
  onAdd
}) {
  const [quantity, setQuantity] = useState(1)
  const [course, setCourse] = useState(1)
  const [note, setNote] = useState('')
  const [selectedSupplements, setSelectedSupplements] = useState([])

  // Reset state quando si apre modal
  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setCourse(1)
      setNote('')
      setSelectedSupplements([])
    }
  }, [isOpen])

  if (!product) return null

  const { category, flavor } = product

  // Toggle supplemento
  const handleSupplementToggle = (supplement) => {
    setSelectedSupplements(prev => {
      const exists = prev.find(s => s.id === supplement.id)
      if (exists) {
        return prev.filter(s => s.id !== supplement.id)
      } else {
        return [...prev, supplement]
      }
    })
  }

  // Calcola totale preview
  const basePrice = parseFloat(category?.base_price || 0)
  const supplementsTotal = selectedSupplements.reduce((sum, s) => sum + parseFloat(s.price), 0)
  const totalPrice = (basePrice + supplementsTotal) * quantity

  // Handler conferma
  const handleConfirm = () => {
    onAdd({
      category,
      flavor,
      quantity,
      course,
      note,
      supplements: selectedSupplements,
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${category?.name} - ${flavor?.name}`}
      size="medium"
      footer={
        <>
          <button className="modal-btn-cancel" onClick={onClose}>
            Annulla
          </button>
          <button className="modal-btn-confirm" onClick={handleConfirm}>
            Aggiungi all'ordine
          </button>
        </>
      }
    >
      <div className="product-modal-content">
        {/* Numero Portata */}
        <div className="product-option">
          <Counter
            label="Numero Portata"
            value={course}
            onChange={setCourse}
            min={1}
            max={5}
          />
        </div>

        {/* Quantita */}
        <div className="product-option">
          <Counter
            label="Quantita"
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={20}
          />
        </div>

        {/* Note */}
        <div className="product-option product-note">
          <label htmlFor="product-note">Note</label>
          <input
            id="product-note"
            type="text"
            placeholder="Es: senza panna, extra cioccolato..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Supplementi */}
        {supplements.length > 0 && (
          <div className="product-supplements">
            <h4>Supplementi</h4>
            <div className="supplements-list">
              {supplements.map((supplement) => {
                const isSelected = selectedSupplements.find(s => s.id === supplement.id)
                return (
                  <label
                    key={supplement.id}
                    className={`supplement-item ${isSelected ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={!!isSelected}
                      onChange={() => handleSupplementToggle(supplement)}
                    />
                    <span className="supplement-name">{supplement.name}</span>
                    <span className="supplement-price">+€{parseFloat(supplement.price).toFixed(2)}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* Preview Totale */}
        <div className="product-total-preview">
          <span>Totale:</span>
          <span className="total-value">€{totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </Modal>
  )
}

export default ProductModal
