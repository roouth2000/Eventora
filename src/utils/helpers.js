'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Generates a JWT access token for a user.
 * Algorithm is hardcoded as HS256 — never derived from token.
 */
function generateToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    config.jwt.secret,
    {
      algorithm: config.jwt.algorithm,
      expiresIn: config.jwt.expiresIn,
      issuer: 'eventora-api',
      audience: 'eventora-client',
    }
  );
}

/**
 * Formats a standardized API success response.
 */
function successResponse(res, statusCode, message, data = null) {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
}

/**
 * Formats a standardized API error response.
 * Never exposes internal error details.
 */
function errorResponse(res, statusCode, message, errors = null) {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
}

/**
 * Sanitizes a string for safe use in text contexts.
 * Use textContent / parameterized queries; this is a utility for logging only.
 */
function sanitizeForLog(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[\n\r]/g, ' ').substring(0, 200);
}

module.exports = { generateToken, successResponse, errorResponse, sanitizeForLog };
