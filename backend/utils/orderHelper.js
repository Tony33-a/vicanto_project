/**
 * Utility functions for order management
 */

/**
 * Calculate order totals
 * @param {Array} items - Array of order items
 * @param {number} taxRate - Tax rate as decimal (e.g., 0.10 for 10%)
 * @param {number} discount - Discount amount
 * @returns {Object} Totals object
 */
function calculateOrderTotals(items, taxRate = 0, discount = 0) {
  const subtotal = items.reduce((sum, item) => {
    return sum + (parseFloat(item.total_price || item.unit_price * item.quantity) || 0);
  }, 0);

  const tax = subtotal * taxRate;
  const total = subtotal + tax - discount;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
}

/**
 * Format order number with date prefix
 * @param {Date} date - Date to use for order number
 * @returns {string} Formatted order number
 */
function formatOrderNumber(date = new Date()) {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = date.toTimeString().slice(0, 8).replace(/:/g, '');
  return `ORD${dateStr}${timeStr}`;
}

module.exports = {
  calculateOrderTotals,
  formatOrderNumber,
};