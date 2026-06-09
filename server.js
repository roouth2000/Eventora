'use strict';

require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const { connectDB, sequelize } = require('./src/config/database');
// Load all model associations before connecting
require('./src/models/associations');
const config = require('./src/config/config');

const PORT = config.port;

async function startServer() {
  // Connect to MySQL and sync tables before accepting requests
  await connectDB();

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log('══════════════════════════════════════════════════');
    console.log(`  🎉  Eventora API Server started`);
    console.log(`  📌  Environment : ${config.env}`);
    console.log(`  🗄️   Database    : MySQL (${config.db.host}:${config.db.port}/${config.db.name})`);
    console.log(`  🚀  Local URL   : http://localhost:${PORT}`);
    console.log(`  🌐  Production  : ${config.productionDomain}`);
    console.log(`  📚  Swagger UI  : http://localhost:${PORT}/api/docs`);
    console.log(`  💡  API Base    : http://localhost:${PORT}/api/v1`);
    console.log('══════════════════════════════════════════════════');
  });

  // ─── Graceful Shutdown ────────────────────────────────────────────────────
  const shutdown = async (signal) => {
    console.log(`\n[Server] ${signal} received — gracefully shutting down...`);
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      try {
        await sequelize.close();
        console.log('[DB] MySQL connection pool closed.');
      } catch (err) {
        console.error('[DB] Error closing MySQL connection:', err.message);
      }
      process.exit(0);
    });

    // Force shutdown after 10s
    setTimeout(() => {
      console.error('[Server] Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('[Server] Unhandled Promise Rejection:', reason?.message || 'Unknown reason');
    if (config.isProduction) process.exit(1);
  });

  process.on('uncaughtException', (err) => {
    console.error('[Server] Uncaught Exception:', err.message);
    process.exit(1);
  });
}

startServer();
