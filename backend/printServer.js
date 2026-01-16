#!/usr/bin/env node
/**
 * Print Server - Processo separato per gestione stampe
 * Monitora print_queue e stampa ricevute su stampante termica WiFi
 *
 * Uso:
 *   node printServer.js                    (modalità normale)
 *   node printServer.js --mock             (modalità test senza stampante)
 *   npm run print-server                   (via npm script)
 */

require('dotenv').config();
const QueueWatcher = require('./services/QueueWatcher');

// Configurazione da .env o argomenti
const config = {
  // Modalità mock (per testing senza stampante fisica)
  mockMode: process.argv.includes('--mock') || process.env.PRINT_MOCK_MODE === 'true',

  // Polling interval (ms)
  pollInterval: parseInt(process.env.PRINT_POLL_INTERVAL) || 500,

  // Socket.IO (per emit eventi print:success/failed)
  socketURL: process.env.SOCKET_URL || 'http://localhost:3000',
  authToken: process.env.PRINT_SERVICE_TOKEN || null,

  // Configurazione stampante
  printerConfig: {
    type: process.env.PRINTER_TYPE || 'epson', // epson, star, etc.
    interface: process.env.PRINTER_IP || 'tcp://192.168.1.100', // IP stampante WiFi
    characterSet: 'PC850_MULTILINGUAL',
    removeSpecialCharacters: false,
    lineCharacter: '-',
    options: {
      timeout: parseInt(process.env.PRINTER_TIMEOUT) || 5000
    }
  }
};

console.log('\n' + '='.repeat(70));
console.log('🖨️  VICANTO PRINT SERVER');
console.log('='.repeat(70));
console.log(`Modalità: ${config.mockMode ? 'MOCK (testing)' : 'PRODUCTION'}`);
console.log(`Polling: ${config.pollInterval}ms`);
console.log(`Stampante: ${config.printerConfig.interface}`);
console.log(`Socket.IO: ${config.socketURL}`);
console.log('='.repeat(70) + '\n');

// Avvia QueueWatcher
const watcher = new QueueWatcher(config);

// Setup graceful shutdown
watcher.setupGracefulShutdown();

// Avvia
(async () => {
  try {
    await watcher.start();
    console.log('✅ Print Server pronto e in ascolto sulla coda di stampa\n');
  } catch (error) {
    console.error('❌ Errore avvio Print Server:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
