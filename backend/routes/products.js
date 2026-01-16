const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const {
  createProductRules,
  updateProductRules,
  productIdRules,
  barcodeRules,
  productQueryRules,
} = require('../middleware/validators/productValidator');

/**
 * @route   GET /api/products
 * @desc    Get all products
 * @access  Public
 */
router.get('/', productQueryRules, productController.getAllProducts);

/**
 * @route   GET /api/products/barcode/:barcode
 * @desc    Get product by barcode
 * @access  Public
 */
router.get('/barcode/:barcode', barcodeRules, productController.getProductByBarcode);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get('/:id', productIdRules, productController.getProductById);

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Public (temporaneamente, sarà privato con autenticazione)
 */
router.post('/', createProductRules, productController.createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Public (temporaneamente, sarà privato con autenticazione)
 */
router.put('/:id', updateProductRules, productController.updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (soft delete)
 * @access  Public (temporaneamente, sarà privato con autenticazione)
 */
router.delete('/:id', productIdRules, productController.deleteProduct);

module.exports = router;