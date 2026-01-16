const User = require('../models/User');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * Login con username e PIN
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { username, pin } = req.body;

    // Validazione input
    if (!username || !pin) {
      return res.status(400).json({
        success: false,
        error: 'Username e PIN sono obbligatori'
      });
    }

    // Validazione PIN (deve essere 4 cifre)
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        error: 'PIN deve essere di 4 cifre'
      });
    }

    // Verifica credenziali
    const user = await User.verifyPin(username, pin);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenziali non valide'
      });
    }

    // Genera JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role
      },
      jwtConfig.secret,
      {
        expiresIn: jwtConfig.expiresIn
      }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verifica token (whoami)
 * GET /api/auth/me
 */
const me = async (req, res, next) => {
  try {
    // req.user è stato attaccato dal middleware authenticate
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utente non trovato'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        last_login: user.last_login
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout (placeholder - con JWT il logout è client-side)
 * POST /api/auth/logout
 */
const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logout effettuato. Rimuovi il token dal client.'
  });
};

module.exports = {
  login,
  me,
  logout
};
