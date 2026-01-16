/**
 * Middleware: Autenticazione JWT
 * Verifica token e attacca user a req
 */

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * Verifica JWT token
 */
const authenticate = (req, res, next) => {
  try {
    // Estrai token dall'header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Token non fornito'
      });
    }

    // Format: "Bearer <token>"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    // Verifica token
    const decoded = jwt.verify(token, jwtConfig.secret);

    // Attacca user a request
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token scaduto'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token non valido'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Errore autenticazione'
    });
  }
};

/**
 * Verifica ruolo admin
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Permessi insufficienti'
    });
  }
  next();
};

module.exports = {
  authenticate,
  requireAdmin
};
