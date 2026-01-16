import { useEffect } from 'react'
import './Modal.css'

/**
 * Modal riutilizzabile
 * @param {boolean} isOpen - Mostra/nasconde modal
 * @param {function} onClose - Callback chiusura
 * @param {string} title - Titolo modal
 * @param {ReactNode} children - Contenuto
 * @param {string} size - 'small' | 'medium' | 'large' | 'fullscreen'
 * @param {boolean} showClose - Mostra pulsante X
 */
function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showClose = true,
  footer
}) {
  // Blocca scroll body quando modal aperta
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Chiudi con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-container modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            {showClose && (
              <button className="modal-close" onClick={onClose}>
                &times;
              </button>
            )}
          </div>
        )}

        <div className="modal-body">
          {children}
        </div>

        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
