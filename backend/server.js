const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();
const { validateConnection } = require('./services/database');
const logger = require('./config/logger');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 3000;

// Make io accessible to routes
app.set('io', io);

// Security headers
app.use(helmet());

// Compression
app.use(compression());

// HTTP Request Logging
app.use(morgan('combined', { stream: logger.stream }));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO configuration
require('./socket/socketHandler')(io);

// Routes
app.use('/api', require('./routes'));

// Root health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// 404 handler (must be before error handler)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Validazione BLOCCANTE database prima di avviare il server
(async () => {
  try {
    await validateConnection();

    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🔌 Socket.IO ready for real-time connections`);
      logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('🚨 FATAL: Server startup aborted due to database connection failure', { error });
    process.exit(1);
  }
})();

module.exports = { app, server, io };