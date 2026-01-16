const Product = require('../models/Product');
const { validationResult } = require('express-validator');

/**
 * Get all products
 * GET /api/products
 */
const getAllProducts = async (req, res, next) => {
  try {
    const filters = {
      category_id: req.query.category_id ? parseInt(req.query.category_id) : undefined,
      is_available: req.query.is_available !== undefined ? req.query.is_available === 'true' : true,
    };

    const products = await Product.findAll(filters);
    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID
 * GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by barcode
 * GET /api/products/barcode/:barcode
 */
const getProductByBarcode = async (req, res, next) => {
  try {
    const { barcode } = req.params;
    const product = await Product.findByBarcode(barcode);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new product
 * POST /api/products
 */
const createProduct = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const productData = {
      name: req.body.name,
      description: req.body.description || null,
      category_id: req.body.category_id || null,
      price: parseFloat(req.body.price),
      cost: req.body.cost ? parseFloat(req.body.cost) : null,
      barcode: req.body.barcode || null,
      sku: req.body.sku || null,
      image_url: req.body.image_url || null,
      is_available: req.body.is_available !== undefined ? req.body.is_available : true,
      requires_preparation: req.body.requires_preparation !== undefined ? req.body.requires_preparation : false,
      preparation_time: req.body.preparation_time ? parseInt(req.body.preparation_time) : null,
      display_order: req.body.display_order ? parseInt(req.body.display_order) : 0,
      options: req.body.options ? JSON.stringify(req.body.options) : null,
    };

    const product = await Product.create(productData);

    // Fetch complete product with category name
    const completeProduct = await Product.findById(product.id);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: completeProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product
 * PUT /api/products/:id
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const productData = {};
    if (req.body.name !== undefined) productData.name = req.body.name;
    if (req.body.description !== undefined) productData.description = req.body.description;
    if (req.body.category_id !== undefined) productData.category_id = req.body.category_id;
    if (req.body.price !== undefined) productData.price = parseFloat(req.body.price);
    if (req.body.cost !== undefined) productData.cost = req.body.cost ? parseFloat(req.body.cost) : null;
    if (req.body.barcode !== undefined) productData.barcode = req.body.barcode;
    if (req.body.sku !== undefined) productData.sku = req.body.sku;
    if (req.body.image_url !== undefined) productData.image_url = req.body.image_url;
    if (req.body.is_available !== undefined) productData.is_available = req.body.is_available;
    if (req.body.requires_preparation !== undefined) productData.requires_preparation = req.body.requires_preparation;
    if (req.body.preparation_time !== undefined) productData.preparation_time = req.body.preparation_time ? parseInt(req.body.preparation_time) : null;
    if (req.body.display_order !== undefined) productData.display_order = parseInt(req.body.display_order);
    if (req.body.options !== undefined) productData.options = req.body.options ? JSON.stringify(req.body.options) : null;

    const updatedProduct = await Product.update(id, productData);

    // Fetch complete product with category name
    const completeProduct = await Product.findById(updatedProduct.id);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: completeProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product (soft delete)
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    await Product.delete(id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct,
};