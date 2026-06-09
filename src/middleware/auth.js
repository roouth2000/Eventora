'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User } = require('../models/associations');

/**
 * JWT Authentication Middleware
 *
 * Security rules enforced:
 * - Hardcoded algorithm (HS256) — never derived from unverified token header
 * - 'none' algorithm rejected implicitly by specifying algorithms array
 * - 'exp' claim is validated automatically by jsonwebtoken
 * - Token version check ensures invalidation on logout / password change
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify with hardcoded algorithm — prevents algorithm confusion attacks
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret, {
        algorithms: [config.jwt.algorithm], // Hardcoded — never trust token header
        issuer: 'eventora-api',
        audience: 'eventora-client',
      });
    } catch (jwtErr) {
      const message =
        jwtErr.name === 'TokenExpiredError'
          ? 'Token has expired. Please log in again.'
          : 'Invalid token.';
      return res.status(401).json({ success: false, message });
    }

    // Load user with sensitive scope to get tokenVersion for validation
    const user = await User.scope('withSensitive').findOne({
      where: { id: decoded.sub, isActive: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated.' });
    }

    // Validate tokenVersion — ensures tokens are invalidated on logout/password-change
    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'Token has been invalidated. Please log in again.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[Auth Middleware] Unexpected error:', err.message);
    return res.status(500).json({ success: false, message: 'Authentication error.' });
  }
}

/**
 * Role-Based Authorization Middleware Factory
 * Usage: authorize('admin') or authorize('organizer', 'admin')
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
}

/**
 * Optional authentication — attaches user if token present, does not reject if absent
 */
async function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  return authenticate(req, res, next);
}

module.exports = { authenticate, authorize, optionalAuthenticate };
