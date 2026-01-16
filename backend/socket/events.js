/**
 * Socket.IO Event Emitters
 * Funzioni helper per emettere eventi ai client connessi
 * Con error handling robusto per prevenire fallimenti silenziosi
 */

/**
 * Emit table update event
 * @param {Object} io - Socket.IO instance
 * @param {Object} table - Updated table data
 * @returns {boolean} - True se emit riuscito, false altrimenti
 */
const emitTableUpdate = (io, table) => {
  try {
    if (!io) {
      console.warn('⚠️  Socket.IO not available - cannot emit table:updated');
      return false;
    }

    io.to('monitor').emit('table:updated', table);
    io.to('tablets').emit('table:updated', table);
    console.log(`📤 Event emitted: table:updated (Table #${table.number})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to emit table:updated (Table #${table.number}):`, error.message);
    // TODO: Send to monitoring system (Sentry, etc.)
    return false;
  }
};

/**
 * Emit new order event
 * @param {Object} io - Socket.IO instance
 * @param {Object} order - New order data
 * @returns {boolean} - True se emit riuscito, false altrimenti
 */
const emitOrderNew = (io, order) => {
  try {
    if (!io) {
      console.warn('⚠️  Socket.IO not available - cannot emit order:new');
      return false;
    }

    io.to('monitor').emit('order:new', order);
    io.to('tablets').emit('order:new', order);
    console.log(`📤 Event emitted: order:new (Order #${order.id})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to emit order:new (Order #${order.id}):`, error.message);
    return false;
  }
};

/**
 * Emit order status update event
 * @param {Object} io - Socket.IO instance
 * @param {Object} order - Updated order data
 * @returns {boolean} - True se emit riuscito, false altrimenti
 */
const emitOrderUpdate = (io, order) => {
  try {
    if (!io) {
      console.warn('⚠️  Socket.IO not available - cannot emit order:updated');
      return false;
    }

    io.to('monitor').emit('order:updated', order);
    io.to('tablets').emit('order:updated', order);
    console.log(`📤 Event emitted: order:updated (Order #${order.id}, Status: ${order.status})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to emit order:updated (Order #${order.id}):`, error.message);
    return false;
  }
};

/**
 * Emit order sent event
 * @param {Object} io - Socket.IO instance
 * @param {Object} order - Order sent
 * @returns {boolean} - True se emit riuscito, false altrimenti
 */
const emitOrderSent = (io, order) => {
  try {
    if (!io) {
      console.warn('⚠️  Socket.IO not available - cannot emit order:sent');
      return false;
    }

    io.to('monitor').emit('order:sent', order);
    io.to('tablets').emit('order:sent', order);
    console.log(`📤 Event emitted: order:sent (Order #${order.id})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to emit order:sent (Order #${order.id}):`, error.message);
    return false;
  }
};

/**
 * Emit order completed event
 * @param {Object} io - Socket.IO instance
 * @param {Object} order - Completed order data
 * @returns {boolean} - True se emit riuscito, false altrimenti
 */
const emitOrderCompleted = (io, order) => {
  try {
    if (!io) {
      console.warn('⚠️  Socket.IO not available - cannot emit order:completed');
      return false;
    }

    io.to('monitor').emit('order:completed', order);
    io.to('tablets').emit('order:completed', order);
    console.log(`📤 Event emitted: order:completed (Order #${order.id})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to emit order:completed (Order #${order.id}):`, error.message);
    return false;
  }
};

/**
 * Emit order cancelled event
 * @param {Object} io - Socket.IO instance
 * @param {Object} order - Cancelled order data
 * @returns {boolean} - True se emit riuscito, false altrimenti
 */
const emitOrderCancelled = (io, order) => {
  try {
    if (!io) {
      console.warn('⚠️  Socket.IO not available - cannot emit order:cancelled');
      return false;
    }

    io.to('monitor').emit('order:cancelled', order);
    io.to('tablets').emit('order:cancelled', order);
    console.log(`📤 Event emitted: order:cancelled (Order #${order.id})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to emit order:cancelled (Order #${order.id}):`, error.message);
    return false;
  }
};

/**
 * Emit print success event
 * @param {Object} io - Socket.IO instance
 * @param {Object} printJob - Print job data
 * @returns {boolean} - True se emit riuscito, false altrimenti
 */
const emitPrintSuccess = (io, printJob) => {
  try {
    if (!io) {
      console.warn('⚠️  Socket.IO not available - cannot emit print:success');
      return false;
    }

    io.to('monitor').emit('print:success', printJob);
    io.to('tablets').emit('print:success', printJob);
    console.log(`📤 Event emitted: print:success (Order #${printJob.order_id})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to emit print:success (Order #${printJob.order_id}):`, error.message);
    return false;
  }
};

/**
 * Emit print failed event
 * @param {Object} io - Socket.IO instance
 * @param {Object} printJob - Failed print job data
 * @returns {boolean} - True se emit riuscito, false altrimenti
 */
const emitPrintFailed = (io, printJob) => {
  try {
    if (!io) {
      console.warn('⚠️  Socket.IO not available - cannot emit print:failed');
      return false;
    }

    io.to('monitor').emit('print:failed', printJob);
    io.to('tablets').emit('print:failed', printJob);
    console.log(`📤 Event emitted: print:failed (Order #${printJob.order_id})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to emit print:failed (Order #${printJob.order_id}):`, error.message);
    return false;
  }
};

/**
 * Emit menu update event (when categories/flavors change)
 * @param {Object} io - Socket.IO instance
 * @param {Object} menuData - Updated menu data
 * @returns {boolean} - True se emit riuscito, false altrimenti
 */
const emitMenuUpdate = (io, menuData) => {
  try {
    if (!io) {
      console.warn('⚠️  Socket.IO not available - cannot emit menu:updated');
      return false;
    }

    io.to('monitor').emit('menu:updated', menuData);
    io.to('tablets').emit('menu:updated', menuData);
    console.log(`📤 Event emitted: menu:updated`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to emit menu:updated:`, error.message);
    return false;
  }
};

module.exports = {
  emitTableUpdate,
  emitOrderNew,
  emitOrderUpdate,
  emitOrderSent,
  emitOrderCompleted,
  emitOrderCancelled,
  emitPrintSuccess,
  emitPrintFailed,
  emitMenuUpdate
};
