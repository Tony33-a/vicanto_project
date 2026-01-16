const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   GET /api/menu/categories
 * @desc    Get all menu categories
 * @access  Private
 */
router.get('/categories', authenticate, menuController.getCategories);

/**
 * @route   GET /api/menu/categories/:code
 * @desc    Get category by code with flavors
 * @access  Private
 */
router.get('/categories/:code', authenticate, menuController.getCategoryByCode);

/**
 * @route   GET /api/menu/flavors
 * @desc    Get all flavors
 * @access  Private
 */
router.get('/flavors', authenticate, menuController.getAllFlavors);

/**
 * @route   GET /api/menu/flavors/:categoryCode
 * @desc    Get flavors by category
 * @access  Private
 */
router.get('/flavors/:categoryCode', authenticate, menuController.getFlavorsByCategory);

/**
 * @route   GET /api/menu/supplements
 * @desc    Get all supplements
 * @access  Private
 */
router.get('/supplements', authenticate, menuController.getSupplements);

/**
 * @route   GET /api/menu/full
 * @desc    Get full menu (categories, flavors, supplements)
 * @access  Private
 */
router.get('/full', authenticate, menuController.getFullMenu);

module.exports = router;
