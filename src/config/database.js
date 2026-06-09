'use strict';

const { Sequelize } = require('sequelize');
const config = require('./config');

/**
 * Sequelize instance connected to MySQL.
 *
 * Security notes:
 * - Uses parameterized queries via Sequelize ORM (never raw string concatenation)
 * - The app DB user should only have SELECT/INSERT/UPDATE/DELETE on the eventora DB
 * - TODO(security): Use mTLS for database connection in production via ssl option
 * - TODO(security): Use a dedicated non-root DB user (set DB_USER/DB_PASS in .env)
 */
const sequelize = new Sequelize(config.db.name, config.db.user, config.db.pass, {
  host: config.db.host,
  port: config.db.port,
  dialect: config.db.dialect,
  logging: config.isProduction ? false : (msg) => console.log('[SQL]', msg),
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    // Use snake_case column names by default
    underscored: true,
    // Add createdAt / updatedAt automatically
    timestamps: true,
    // Prevent Sequelize from auto-pluralizing table names
    freezeTableName: false,
  },
  dialectOptions: config.isProduction
    ? {
        // TODO(security): Enable SSL/TLS for production MySQL connections
        // ssl: { rejectUnauthorized: true, ca: fs.readFileSync('/path/to/ca-cert.pem') }
      }
    : {},
});

/**
 * Connects to MySQL and optionally syncs tables.
 * Uses { alter: false } in production — never auto-migrate in prod.
 */
async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log(`[DB] MySQL connected: ${config.db.host}:${config.db.port}/${config.db.name}`);

    if (!config.isProduction) {
      // Sync all models in development (creates tables if not exist)
      // Use { force: true } carefully — it DROPS and re-creates tables
      await sequelize.sync({ alter: true });
      console.log('[DB] Tables synchronized (development mode).');
    } else {
      // In production, use migrations (e.g., sequelize-cli) — never auto-sync
      console.log('[DB] Production mode: skipping auto-sync. Use migrations.');
    }
  } catch (err) {
    // Log generic message — do not expose DB credentials in error output
    console.error('[DB] MySQL connection failed. Check DB_HOST, DB_USER, DB_PASS, DB_NAME.');
    console.error('[DB] Error:', err.message);
    process.exit(1);
  }
}

module.exports = { sequelize, connectDB };
