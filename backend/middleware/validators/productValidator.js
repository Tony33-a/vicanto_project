const { body, param, query } = require('express-validator');

// Validation rules for product creation
const createProductRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Product name must be between 1 and 255 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
  
  body('barcode')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Barcode must not exceed 50 characters'),
  
  body('sku')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('SKU must not exceed 50 characters'),
  
  body('image_url')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  
  body('is_available')
    .optional()
    .isBoolean()
    .withMessage('is_available must be a boolean'),
  
  body('requires_preparation')
    .optional()
    .isBoolean()
    .withMessage('requires_preparation must be a boolean'),
  
  body('preparation_time')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Preparation time must be a non-negative integer'),
  
  body('display_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
  
  body('options')
    .optional()
    .custom((value) => {
      if (typeof value === 'object' || value === null) {
        return true;
      }
      try {
        JSON.parse(value);
        return true;
      } catch {
        throw new Error('Options must be a valid JSON object');
      }
    }),
];

// Validation rules for product update
const updateProductRules = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ min: 1, max: 255 })
    .withMessage('Product name must be between 1 and 255 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
  
  body('barcode')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Barcode must not exceed 50 characters'),
  
  body('sku')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('SKU must not exceed 50 characters'),
  
  body('image_url')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  
  body('is_available')
    .optional()
    .isBoolean()
    .withMessage('is_available must be a boolean'),
  
  body('requires_preparation')
    .optional()
    .isBoolean()
    .withMessage('requires_preparation must be a boolean'),
  
  body('preparation_time')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Preparation time must be a non-negative integer'),
  
  body('display_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
  
  body('options')
    .optional()
    .custom((value) => {
      if (typeof value === 'object' || value === null) {
        return true;
      }
      try {
        JSON.parse(value);
        return true;
      } catch {
        throw new Error('Options must be a valid JSON object');
      }
    }),
];

// Validation rules for product ID parameter
const productIdRules = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
];

// Validation rules for barcode parameter
const barcodeRules = [
  param('barcode')
    .trim()
    .notEmpty()
    .withMessage('Barcode is required'),
];

// Validation rules for query parameters
const productQueryRules = [
  query('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  
  query('is_available')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('is_available must be "true" or "false"'),
];

module.exports = {
  createProductRules,
  updateProductRules,
  productIdRules,
  barcodeRules,
  productQueryRules,
};