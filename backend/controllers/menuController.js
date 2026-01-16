const MenuCategory = require('../models/MenuCategory');
const Flavor = require('../models/Flavor');
const Supplement = require('../models/Supplement');

/**
 * Get all menu categories
 * GET /api/menu/categories
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await MenuCategory.findAll();

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by code with flavors
 * GET /api/menu/categories/:code
 */
const getCategoryByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const category = await MenuCategory.findByCodeWithFlavors(code);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Categoria non trovata'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get flavors by category
 * GET /api/menu/flavors/:categoryCode
 */
const getFlavorsByCategory = async (req, res, next) => {
  try {
    const { categoryCode } = req.params;
    const flavors = await Flavor.findByCategory(categoryCode);

    res.json({
      success: true,
      count: flavors.length,
      data: flavors
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all flavors
 * GET /api/menu/flavors
 */
const getAllFlavors = async (req, res, next) => {
  try {
    const flavors = await Flavor.findAll();

    res.json({
      success: true,
      count: flavors.length,
      data: flavors
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all supplements
 * GET /api/menu/supplements
 */
const getSupplements = async (req, res, next) => {
  try {
    const supplements = await Supplement.findAll();

    res.json({
      success: true,
      count: supplements.length,
      data: supplements
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get full menu (categories with flavors + supplements)
 * GET /api/menu/full
 */
const getFullMenu = async (req, res, next) => {
  try {
    const categories = await MenuCategory.findAll();
    const flavors = await Flavor.findAll();
    const supplements = await Supplement.findAll();

    // Raggruppa gusti per categoria
    const categoriesWithFlavors = categories.map(cat => ({
      ...cat,
      flavors: flavors.filter(f => f.category_code === cat.code)
    }));

    res.json({
      success: true,
      data: {
        categories: categoriesWithFlavors,
        supplements
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryByCode,
  getFlavorsByCategory,
  getAllFlavors,
  getSupplements,
  getFullMenu
};
