require('dotenv').config();

const config = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'vicanto_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.PGPASSWORD || '',
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: '../database/migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: '../database/seeds',
  },
};

module.exports = {
  development: config,
  production: config,
  test: {
    ...config,
    connection: {
      ...config.connection,
      database: process.env.DB_TEST_NAME || 'vicanto_test_db',
    },
  },
};