/**
 * JWT Configuration
 */

module.exports = {
  secret: process.env.JWT_SECRET || 'vicanto_secret_key_change_in_production',
  expiresIn: process.env.JWT_EXPIRES_IN || '12h'
};
