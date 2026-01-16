require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  
  services: {
    printService: process.env.PRINT_SERVICE_URL || 'http://localhost:4000',
    kitchenDisplay: process.env.KITCHEN_DISPLAY_URL || 'http://localhost:5000',
  },
};