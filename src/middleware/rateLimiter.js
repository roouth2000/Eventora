'use strict';

const rateLimit = require('express-rate-limit');
const config = require('../config/config');

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  // Do not expose internal rate limit state in error responses
  skip: (req) => config.env === 'test',
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits brute-force login / registration attempts
 */
const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
  skip: (req) => config.env === 'test',
});

module.exports = { apiLimiter, authLimiter };
