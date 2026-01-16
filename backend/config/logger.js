/**
 * Winston Logger Configuration
 * Structured logging per produzione con rotazione file
 */

const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format (colorized for development)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Determina environment
const isDevelopment = process.env.NODE_ENV !== 'production';

// Transports configuration
const transports = [
  // Console output (always)
  new winston.transports.Console({
    format: isDevelopment ? consoleFormat : format,
  }),
];

// In produzione, aggiungi file transports
if (!isDevelopment) {
  transports.push(
    // Error log file
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  levels,
  format,
  transports,
  // Non uscire su errori non gestiti
  exitOnError: false,
});

// Stream per Morgan (HTTP request logging)
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

module.exports = logger;
