const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   POST /api/auth/login
 * @desc    Login con username e PIN (4 cifre)
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Ottieni info utente corrente
 * @access  Private
 */
router.get('/me', authenticate, authController.me);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (placeholder - JWT è stateless)
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

module.exports = router;
