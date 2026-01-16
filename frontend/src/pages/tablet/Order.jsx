import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import tablesService from '../../services/tablesService'
import ordersService from '../../services/ordersService'
import menuService from '../../services/menuService'
import Counter from '../../components/common/Counter'
import Modal from '../../components/common/Modal'
import ProductModal from '../../components/tablet/ProductModal'
import './Order.css'

function TabletOrder() {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const isAsporto = tableId === 'asporto'

  // State locale ordine
  const [covers, setCovers] = useState(1)
  const [orderItems, setOrderItems] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [existingOrderId, setExistingOrderId] = useState(null)

  // Fetch tavolo
  const { data: table, isLoading: tableLoading } = useQuery({
    queryKey: ['table', tableId],
    queryFn: () => tablesService.getById(tableId),
    enabled: !isAsporto && !!tableId,
  })

  // Fetch menu completo
  const { data: menu, isLoading: menuLoading } = useQuery({
    queryKey: ['menu'],
    queryFn: menuService.getFullMenu,
  })

  // Carica ordine esistente se tavolo ha gia ordine pending
  useEffect(() => {
    if (table?.current_order) {
      const order = table.current_order
      setExistingOrderId(order.id)
      setCovers(order.covers || 1)
      if (order.items && order.items.length > 0) {
        setOrderItems(order.items.map(item => ({
          id: item.id,
          categoryCode: item.category_code || item.category,
          categoryName: item.category,
          flavors: item.flavors || [],
          quantity: item.quantity,
          course: item.course,
          note: item.custom_note || '',
          supplements: item.supplements || [],
          unitPrice: parseFloat(item.unit_price),
          supplementsTotal: parseFloat(item.supplements_total || 0),
        })))
      }
    }
  }, [table])

  // Calcola totali
  const totals = useMemo(() => {
    const itemsSubtotal = orderItems.reduce((sum, item) => {
      const itemTotal = (item.unitPrice + item.supplementsTotal) * item.quantity
      return sum + itemTotal
    }, 0)
    const coverCharge = covers * 1.00 // €1 per coperto
    return {
      itemsSubtotal,
      coverCharge: isAsporto ? 0 : coverCharge,
      total: itemsSubtotal + (isAsporto ? 0 : coverCharge)
    }
  }, [orderItems, covers, isAsporto])

  // Mutation crea ordine
  const createOrderMutation = useMutation({
    mutationFn: (orderData) => ordersService.create(orderData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      setConfirmModalOpen(false)
      navigate('/tablet/home')
    },
    onError: (error) => {
      alert('Errore nella creazione ordine: ' + (error.response?.data?.error || error.message))
    }
  })

  // Mutation invia ordine
  const sendOrderMutation = useMutation({
    mutationFn: (orderId) => ordersService.send(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      setConfirmModalOpen(false)
      navigate('/tablet/home')
    },
    onError: (error) => {
      alert('Errore invio ordine: ' + (error.response?.data?.error || error.message))
    }
  })

  // Mutation libera tavolo
  const freeTableMutation = useMutation({
    mutationFn: () => tablesService.free(tableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      navigate('/tablet/home')
    }
  })

  // Handler selezione categoria
  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
  }

  // Handler selezione gusto -> apre modal prodotto
  const handleFlavorSelect = (flavor) => {
    setSelectedProduct({
      category: selectedCategory,
      flavor: flavor,
    })
    setProductModalOpen(true)
  }

  // Handler aggiungi prodotto da modal
  const handleAddProduct = (productData) => {
    const newItem = {
      id: Date.now(), // ID temporaneo
      categoryCode: selectedCategory.code,
      categoryName: selectedCategory.name,
      flavors: [productData.flavor.name],
      quantity: productData.quantity,
      course: productData.course,
      note: productData.note,
      supplements: productData.supplements,
      unitPrice: parseFloat(selectedCategory.base_price),
      supplementsTotal: productData.supplements.reduce((sum, s) => sum + parseFloat(s.price), 0),
    }
    setOrderItems([...orderItems, newItem])
    setProductModalOpen(false)
    setSelectedProduct(null)
  }

  // Handler rimuovi item
  const handleRemoveItem = (itemId) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId))
  }

  // Handler conferma ordine
  const handleConfirmOrder = () => {
    if (orderItems.length === 0) {
      alert('Aggiungi almeno un prodotto')
      return
    }
    setConfirmModalOpen(true)
  }

  // Handler invio ordine
  const handleSendOrder = async () => {
    const orderData = {
      table_id: isAsporto ? null : parseInt(tableId),
      covers: isAsporto ? 0 : covers,
      is_asporto: isAsporto,
      items: orderItems.map(item => ({
        category: item.categoryName,
        category_code: item.categoryCode,
        flavors: item.flavors,
        quantity: item.quantity,
        course: item.course,
        custom_note: item.note,
        supplements: item.supplements,
        unit_price: item.unitPrice,
        supplements_total: item.supplementsTotal,
        total_price: (item.unitPrice + item.supplementsTotal) * item.quantity,
      }))
    }

    if (existingOrderId) {
      // Aggiorna e invia ordine esistente
      try {
        await ordersService.update(existingOrderId, orderData)
        sendOrderMutation.mutate(existingOrderId)
      } catch (err) {
        alert('Errore aggiornamento: ' + (err.response?.data?.error || err.message))
      }
    } else {
      // Crea nuovo ordine e invia
      createOrderMutation.mutate(orderData)
    }
  }

  // Handler torna indietro (salva come pending)
  const handleGoBack = () => {
    // TODO: Salvare come pending se ci sono items
    navigate('/tablet/home')
  }

  const isLoading = tableLoading || menuLoading
  const isSending = createOrderMutation.isPending || sendOrderMutation.isPending

  if (isLoading) {
    return (
      <div className="tablet-order">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Caricamento...</p>
        </div>
      </div>
    )
  }

  const categories = menu?.categories || []
  const supplements = menu?.supplements || []
  const currentCategoryFlavors = selectedCategory?.flavors || []

  return (
    <div className="tablet-order">
      {/* Header */}
      <div className="order-header">
        <button className="back-btn" onClick={handleGoBack}>
          &larr;
        </button>
        <div className="order-header-info">
          <h1>{isAsporto ? 'Asporto' : `Tavolo ${table?.number}`}</h1>
          {!isAsporto && (
            <div className="covers-selector">
              <span>Coperti:</span>
              <Counter
                value={covers}
                onChange={setCovers}
                min={1}
                max={20}
                size="small"
              />
            </div>
          )}
        </div>
        {table?.status === 'occupied' && (
          <button
            className="free-table-btn"
            onClick={() => freeTableMutation.mutate()}
            disabled={freeTableMutation.isPending}
          >
            Libera Tavolo
          </button>
        )}
      </div>

      <div className="order-content">
        {/* Colonna sinistra: Categorie e Gusti */}
        <div className="order-menu">
          {/* Categorie */}
          <div className="categories-section">
            <h3>Categorie</h3>
            <div className="categories-grid">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-btn ${selectedCategory?.id === cat.id ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  <span className="category-icon">{cat.icon || '🍨'}</span>
                  <span className="category-name">{cat.name}</span>
                  <span className="category-price">€{parseFloat(cat.base_price).toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Gusti (se categoria selezionata) */}
          {selectedCategory && (
            <div className="flavors-section">
              <h3>Gusti - {selectedCategory.name}</h3>
              <div className="flavors-grid">
                {currentCategoryFlavors.map((flavor) => (
                  <button
                    key={flavor.id}
                    className="flavor-btn"
                    onClick={() => handleFlavorSelect(flavor)}
                  >
                    {flavor.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonna destra: Riepilogo Ordine */}
        <div className="order-summary">
          <h3>Riepilogo Ordine</h3>

          {orderItems.length === 0 ? (
            <p className="empty-order">Nessun prodotto aggiunto</p>
          ) : (
            <div className="order-items-list">
              {orderItems.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="order-item-info">
                    <div className="order-item-header">
                      <span className="order-item-qty">{item.quantity}x</span>
                      <span className="order-item-name">{item.categoryName}</span>
                      <button
                        className="remove-item-btn"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        &times;
                      </button>
                    </div>
                    <div className="order-item-details">
                      <span className="order-item-flavors">{item.flavors.join(', ')}</span>
                      {item.supplements.length > 0 && (
                        <span className="order-item-supplements">
                          + {item.supplements.map(s => s.name).join(', ')}
                        </span>
                      )}
                      {item.note && (
                        <span className="order-item-note">Note: {item.note}</span>
                      )}
                      <span className="order-item-course">Portata: {item.course}ª</span>
                    </div>
                  </div>
                  <span className="order-item-price">
                    €{((item.unitPrice + item.supplementsTotal) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Totali */}
          <div className="order-totals">
            {!isAsporto && (
              <div className="total-row">
                <span>Coperto ({covers}x €1.00)</span>
                <span>€{totals.coverCharge.toFixed(2)}</span>
              </div>
            )}
            <div className="total-row total-final">
              <span>TOTALE</span>
              <span>€{totals.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Pulsanti azione */}
          <div className="order-actions">
            <button
              className="btn-secondary"
              onClick={handleGoBack}
            >
              Annulla
            </button>
            <button
              className="btn-primary"
              onClick={handleConfirmOrder}
              disabled={orderItems.length === 0}
            >
              Invia Comanda
            </button>
          </div>
        </div>
      </div>

      {/* Modal Prodotto */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
        supplements={supplements}
        onAdd={handleAddProduct}
      />

      {/* Modal Conferma */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Conferma Comanda"
        size="medium"
        footer={
          <>
            <button
              className="btn-secondary"
              onClick={() => setConfirmModalOpen(false)}
              disabled={isSending}
            >
              Annulla
            </button>
            <button
              className="btn-primary"
              onClick={handleSendOrder}
              disabled={isSending}
            >
              {isSending ? 'Invio...' : 'Conferma e Invia'}
            </button>
          </>
        }
      >
        <div className="confirm-order-content">
          <p className="confirm-table">
            {isAsporto ? 'Ordine Asporto' : `Tavolo ${table?.number}`}
          </p>
          {!isAsporto && <p className="confirm-covers">Coperti: {covers}</p>}

          <div className="confirm-items">
            {orderItems.map((item, idx) => (
              <div key={idx} className="confirm-item">
                <span>{item.quantity}x {item.categoryName} - {item.flavors.join(', ')}</span>
                <span>€{((item.unitPrice + item.supplementsTotal) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="confirm-total">
            <span>TOTALE</span>
            <span>€{totals.total.toFixed(2)}</span>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TabletOrder
