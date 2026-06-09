'use strict';

const { body } = require('express-validator');

const ALLOWED_CATEGORIES = ['conference', 'workshop', 'concert', 'sports', 'networking', 'exhibition', 'festival', 'other'];
const ALLOWED_STATUSES = ['draft', 'published', 'cancelled', 'completed'];

const createEventValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters'),

  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Short description must not exceed 300 characters'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(ALLOWED_CATEGORIES).withMessage(`Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`),

  // Flat venue fields (MySQL columns)
  body('venueName').optional().trim().isLength({ max: 200 }),
  body('venueAddress').optional().trim().isLength({ max: 500 }),
  body('venueCity').optional().trim().isLength({ max: 100 }),
  body('venueState').optional().trim().isLength({ max: 100 }),
  body('venueCountry').optional().trim().isLength({ max: 100 }),
  body('venueZipCode').optional().trim().isLength({ max: 20 }),
  body('isOnline').optional().isBoolean(),
  body('onlineLink')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ protocols: ['https'], require_protocol: true })
    .withMessage('Online link must be a valid HTTPS URL'),

  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid ISO 8601 date'),

  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('End date must be a valid ISO 8601 date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('capacity')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 1000000 }).withMessage('Capacity must be between 1 and 1,000,000'),

  body('ticketPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Ticket price cannot be negative'),

  body('isFree')
    .optional()
    .isBoolean(),

  body('tags')
    .optional()
    .isArray({ max: 10 }).withMessage('Maximum 10 tags allowed')
    .custom((tags) => tags.every((t) => typeof t === 'string' && t.length <= 50))
    .withMessage('Each tag must be a string of max 50 characters'),

  body('status')
    .optional()
    .isIn(['draft', 'published']).withMessage('Status on creation must be draft or published'),
];

const updateEventValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters'),

  body('category')
    .optional()
    .isIn(ALLOWED_CATEGORIES).withMessage(`Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`),

  body('status')
    .optional()
    .isIn(ALLOWED_STATUSES).withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`),

  body('capacity')
    .optional()
    .isInt({ min: 1, max: 1000000 }),

  body('ticketPrice')
    .optional()
    .isFloat({ min: 0 }),
];

module.exports = { createEventValidator, updateEventValidator };
