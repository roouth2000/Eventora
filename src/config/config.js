'use strict';

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

/**
 * Securely resolves JWT_SECRET following a multi-tiered strategy:
 * 1. Environment variable JWT_SECRET
 * 2. Local file jwt_secret.txt (dev convenience)
 * 3. Ephemeral random secret (instance-isolated, logs severe warning)
 *
 * Never hardcodes fallback literals per secure coding guidelines.
 */
function getJwtSecret() {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim().length >= 32) {
    return process.env.JWT_SECRET.trim();
  }

  const secretFile = path.resolve(__dirname, '../../jwt_secret.txt');
  if (fs.existsSync(secretFile)) {
    const secret = fs.readFileSync(secretFile, 'utf-8').trim();
    if (secret.length >= 32) return secret;
  }

  const ephemeral = crypto.randomBytes(64).toString('hex');
  console.warn(
    '[SECURITY WARNING] JWT_SECRET not set. Generated ephemeral secret. ' +
    'THIS IS INSTANCE-ISOLATED and will cause token invalidation on restart. ' +
    'Set JWT_SECRET in environment variables for production.'
  );
  return ephemeral;
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  isProduction: process.env.NODE_ENV === 'production',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    name: process.env.DB_NAME || 'eventora',
    user: process.env.DB_USER || 'root',
    pass: process.env.DB_PASS || '',
    dialect: 'mysql',
  },

  jwt: {
    secret: getJwtSecret(),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    algorithm: 'HS256', // Hardcoded — never derive algorithm from token header
  },

  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim()),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10,
  },

  upload: {
    maxSizeBytes: (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5) * 1024 * 1024,
    path: path.resolve(process.env.UPLOAD_PATH || './uploads'),
  },

  productionDomain:
    process.env.PRODUCTION_DOMAIN || 'https://eventora.heavenwebtechnologies.com',
};

module.exports = config;
