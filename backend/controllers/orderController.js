const Order = require('../models/Order');
const Table = require('../models/Table');
const PrintQueue = require('../models/PrintQueue');
const {
  emitTableUpdate,
  emitOrderNew,
  emitOrderUpdate,
  emitOrderSent,
  emitOrderCompleted,
  emitOrderCancelled
} = require('../socket/events');

/**
 * Get all orders (with filters)
 * GET /api/orders
 */
const getAllOrders = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      table_id: req.query.table_id ? parseInt(req.query.table_id) : undefined,
      user_id: req.query.user_id ? parseInt(req.query.user_id) : undefined
    };

    const orders = await Order.findAll(filters);

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active orders (pending or sent)
 * GET /api/orders/active
 */
const getActiveOrders = async (req, res, next) => {
  try {
    const orders = await Order.findActive();

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get order by ID (with items)
 * GET /api/orders/:id
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Ordine non trovato'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new order
 * POST /api/orders
 */
const createOrder = async (req, res, next) => {
  try {
    const { table_id, covers, items, notes } = req.body;

    // Validazione
    if (!table_id || !covers || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'table_id, covers e items sono obbligatori'
      });
    }

    // Verifica che il tavolo esista
    const table = await Table.findById(table_id);
    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Tavolo non trovato'
      });
    }

    // TRANSAZIONE ATOMICA: Order + Table update insieme
    const db = require('../services/database');
    let completeOrder, updatedTable;

    await db.transaction(async (trx) => {
      // Crea ordine (con items) dentro transazione
      const order = await Order.create({
        table_id,
        user_id: req.user.userId,
        covers,
        items,
        notes
      }, trx);

      // Aggiorna stato tavolo a pending dentro stessa transazione
      updatedTable = await Table.setPending(table_id, covers, order.total, trx);

      // Ritorna ordine completo con items
      completeOrder = await Order.findById(order.id, trx);
    });
    // Se qualsiasi step fallisce, tutto viene rollback automaticamente

    // Emit real-time events (DOPO commit transazione)
    const io = req.app.get('io');
    if (io) {
      try {
        emitOrderNew(io, completeOrder);
        emitTableUpdate(io, updatedTable);
      } catch (emitError) {
        console.error('⚠️  Failed to emit Socket.IO events:', emitError.message);
        // Non bloccare la risposta - dati sono salvati correttamente
      }
    } else {
      console.warn('⚠️  Socket.IO not available - events not emitted');
    }

    res.status(201).json({
      success: true,
      message: 'Ordine creato',
      data: completeOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send order (change status to sent + add to print queue)
 * PUT /api/orders/:id/send
 */
const sendOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verifica che l'ordine esista
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Ordine non trovato'
      });
    }

    // Verifica che sia pending
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Solo ordini pending possono essere inviati'
      });
    }

    // TRANSAZIONE ATOMICA: Order + Table + PrintQueue insieme
    const db = require('../services/database');
    let updatedOrder, updatedTable;

    await db.transaction(async (trx) => {
      // Invia ordine
      await Order.send(id, trx);

      // Aggiorna tavolo a occupied
      updatedTable = await Table.setOccupied(order.table_id, order.covers, order.total, trx);

      // Aggiungi a coda stampa (CRITICO: deve essere nello stesso transaction)
      await PrintQueue.create(id, null, trx);

      // Ritorna ordine aggiornato
      updatedOrder = await Order.findById(id, trx);
    });
    // Se PrintQueue.create fallisce, Order.send e Table.setOccupied vengono rollback

    // Emit real-time events (DOPO commit transazione)
    const io = req.app.get('io');
    if (io) {
      try {
        emitOrderSent(io, updatedOrder);
        emitTableUpdate(io, updatedTable);
      } catch (emitError) {
        console.error('⚠️  Failed to emit Socket.IO events:', emitError.message);
      }
    } else {
      console.warn('⚠️  Socket.IO not available - events not emitted');
    }

    res.json({
      success: true,
      message: 'Ordine inviato e inserito in coda stampa',
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete order
 * PUT /api/orders/:id/complete
 */
const completeOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Ordine non trovato'
      });
    }

    // Completa ordine
    await Order.complete(id);

    // Libera tavolo
    const freedTable = await Table.free(order.table_id);

    const updatedOrder = await Order.findById(id);

    // Emit real-time events
    const io = req.app.get('io');
    if (io) {
      emitOrderCompleted(io, updatedOrder);
      emitTableUpdate(io, freedTable);
    }

    res.json({
      success: true,
      message: 'Ordine completato e tavolo liberato',
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel order
 * PUT /api/orders/:id/cancel
 */
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Ordine non trovato'
      });
    }

    // Cancella ordine
    await Order.cancel(id);

    // Se l'ordine era pending, libera il tavolo
    let freedTable = null;
    if (order.status === 'pending') {
      freedTable = await Table.free(order.table_id);
    }

    const updatedOrder = await Order.findById(id);

    // Emit real-time events
    const io = req.app.get('io');
    if (io) {
      emitOrderCancelled(io, updatedOrder);
      if (freedTable) {
        emitTableUpdate(io, freedTable);
      }
    }

    res.json({
      success: true,
      message: 'Ordine cancellato',
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete order (hard delete)
 * DELETE /api/orders/:id
 */
const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Ordine non trovato'
      });
    }

    await Order.delete(id);

    res.json({
      success: true,
      message: 'Ordine eliminato'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
  getActiveOrders,
  getOrderById,
  createOrder,
  sendOrder,
  completeOrder,
  cancelOrder,
  deleteOrder
};
