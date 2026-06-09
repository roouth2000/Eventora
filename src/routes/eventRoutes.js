'use strict';

const express = require('express');
const {
  getAllEvents, getEventById, createEvent,
  updateEvent, deleteEvent, attendEvent, getMyEvents,
} = require('../controllers/eventController');
const { createEventValidator, updateEventValidator } = require('../validators/eventValidators');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllEvents);
router.get('/my', authenticate, getMyEvents);
router.get('/:id', getEventById);

// Protected routes — require authentication
router.post('/', authenticate, authorize('organizer', 'admin'), createEventValidator, validate, createEvent);
router.put('/:id', authenticate, updateEventValidator, validate, updateEvent);
router.delete('/:id', authenticate, deleteEvent);
router.post('/:id/attend', authenticate, attendEvent);

module.exports = router;
