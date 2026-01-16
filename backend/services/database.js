const knex = require('knex');
const config = require('../config/database');

const environment = process.env.NODE_ENV || 'development';

// Validate database configuration
const dbConfig = config[environment];
if (!dbConfig.connection.password) {
  console.warn('⚠️  Database password not configured in .env file');
  console.warn('⚠️  Database operations will fail until DB_PASSWORD is set');
}

const db = knex(dbConfig);

/**
 * Validazione BLOCCANTE connessione database
 * Retry automatico con max 5 tentativi
 * Se fallisce, termina il processo (previene server start senza DB)
 */
async function validateDatabaseConnection() {
  const maxRetries = 5;
  const retryDelay = 3000; // 3 secondi

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await db.raw('SELECT 1');
      console.log('✅ Database connection established successfully');
      return true;
    } catch (error) {
      console.error(`❌ Database connection attempt ${attempt}/${maxRetries} failed:`, error.message);

      if (attempt === maxRetries) {
        console.error('🚨 FATAL: Could not connect to database after max retries');
        console.error('🚨 Please ensure:');
        console.error('   - PostgreSQL is running');
        console.error('   - Database exists and is accessible');
        console.error('   - .env configuration is correct (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD)');
        process.exit(1);  // BLOCCA avvio server
      }

      console.log(`⏳ Retrying in ${retryDelay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

module.exports = db;
module.exports.validateConnection = validateDatabaseConnection;