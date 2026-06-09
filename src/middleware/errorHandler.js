'use strict';

const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');

/**
 * Global error handler middleware.
 * Ensures no stack traces, internal messages, or sensitive data
 * are leaked to API clients.
 */
function errorHandler(err, req, res, next) {
  // Log full error server-side only — never expose to clients
  console.error('[Error Handler]', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // ── Sequelize Validation Error ─────────────────────────────────────────────
  if (err instanceof ValidationError) {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // ── Sequelize Unique Constraint (duplicate entry) ──────────────────────────
  if (err instanceof UniqueConstraintError) {
    const field = err.errors?.[0]?.path || 'field';
    return res.status(409).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`,
    });
  }

  // ── Sequelize Foreign Key Constraint ──────────────────────────────────────
  if (err instanceof ForeignKeyConstraintError) {
    return res.status(400).json({
      success: false,
      message: 'Referenced resource does not exist.',
    });
  }

  // ── CORS Error ─────────────────────────────────────────────────────────────
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({
      success: false,
      message: 'CORS policy: origin not allowed.',
    });
  }

  // ── Default ────────────────────────────────────────────────────────────────
  const statusCode = err.statusCode || err.status || 500;
  const message =
    statusCode < 500
      ? err.message || 'Request failed.'
      : 'An internal server error occurred. Please try again later.';

  res.status(statusCode).json({ success: false, message });
}

/**
 * 404 handler — must be registered after all routes
 */
function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
}

module.exports = { errorHandler, notFound };
