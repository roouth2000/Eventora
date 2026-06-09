'use strict';

const { body } = require('express-validator');

/**
 * Validators for Auth endpoints.
 * Uses express-validator with explicit allow-list rules.
 */

const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[\p{L}\s'-]+$/u).withMessage('Name contains invalid characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail()
    .isLength({ max: 254 }).withMessage('Email must not exceed 254 characters'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .isLength({ max: 128 }).withMessage('Password must not exceed 128 characters'),
    // TODO(security): Add leaked password detection (e.g., haveibeenpwned API)

  body('role')
    .optional()
    .isIn(['user', 'organizer']).withMessage('Role must be user or organizer'),
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ max: 128 }).withMessage('Password must not exceed 128 characters'),
];

const changePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .isLength({ max: 128 }).withMessage('New password must not exceed 128 characters'),
];

module.exports = { registerValidator, loginValidator, changePasswordValidator };
