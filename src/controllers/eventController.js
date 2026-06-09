'use strict';

const { Op } = require('sequelize');
const { Event, User, EventAttendee } = require('../models/associations');

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: List all published events (paginated)
 *     tags: [Events]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [conference, workshop, concert, sports, networking, exhibition, festival, other]
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Full-text search in title and description
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [startDate, createdAt, ticketPrice], default: startDate }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *     responses:
 *       200:
 *         description: List of events
 */
async function getAllEvents(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const ALLOWED_CATEGORIES = ['conference', 'workshop', 'concert', 'sports', 'networking', 'exhibition', 'festival', 'other'];
    const ALLOWED_SORT_FIELDS = { startDate: 'start_date', createdAt: 'created_at', ticketPrice: 'ticket_price' };

    // Build WHERE clause — only published events
    const where = { status: 'published', isDeleted: false };

    if (req.query.category && ALLOWED_CATEGORIES.includes(req.query.category)) {
      where.category = req.query.category;
    }

    // Full-text search via MATCH...AGAINST (parameterized through Sequelize literal)
    let searchLiteral = null;
    if (req.query.search && typeof req.query.search === 'string') {
      const safeSearch = req.query.search.replace(/['"*+\-<>()~@]/g, '').substring(0, 200);
      if (safeSearch) {
        where[Op.and] = Event.sequelize.literal(
          `MATCH(title, description) AGAINST(${Event.sequelize.escape(safeSearch)} IN BOOLEAN MODE)`
        );
      }
    }

    const sortCol = ALLOWED_SORT_FIELDS[req.query.sortBy] || 'start_date';
    const sortDir = req.query.order === 'desc' ? 'DESC' : 'ASC';

    const { count, rows: events } = await Event.findAndCountAll({
      where,
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'name', 'email', 'avatar'] },
      ],
      order: [[sortCol, sortDir]],
      limit,
      offset,
      distinct: true,
    });

    return res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 */
async function getEventById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id || id < 1) {
      return res.status(400).json({ success: false, message: 'Invalid event ID.' });
    }

    const event = await Event.findByPk(id, {
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'attendees', attributes: ['id', 'name', 'avatar'] },
      ],
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    return res.status(200).json({ success: true, data: { event } });
  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, category, startDate, endDate]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Tech Summit 2026"
 *               description:
 *                 type: string
 *               shortDescription:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [conference, workshop, concert, sports, networking, exhibition, festival, other]
 *               venueName:
 *                 type: string
 *               venueAddress:
 *                 type: string
 *               venueCity:
 *                 type: string
 *               venueState:
 *                 type: string
 *               venueCountry:
 *                 type: string
 *               isOnline:
 *                 type: boolean
 *               onlineLink:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               capacity:
 *                 type: integer
 *               ticketPrice:
 *                 type: number
 *               isFree:
 *                 type: boolean
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *     responses:
 *       201:
 *         description: Event created
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation failed
 */
async function createEvent(req, res, next) {
  try {
    const {
      title, description, shortDescription, category,
      venueName, venueAddress, venueCity, venueState, venueCountry, venueZipCode,
      isOnline, onlineLink,
      startDate, endDate, capacity, ticketPrice, isFree, tags, status,
    } = req.body;

    // Organizer set from authenticated user — never from client input
    const event = await Event.create({
      title,
      description,
      shortDescription,
      category,
      venueName,
      venueAddress,
      venueCity,
      venueState,
      venueCountry,
      venueZipCode,
      isOnline: Boolean(isOnline),
      onlineLink,
      startDate,
      endDate,
      capacity,
      ticketPrice,
      isFree,
      tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
      status: ['draft', 'published'].includes(status) ? status : 'draft',
      organizerId: req.user.id, // Server-side ownership — never from client
    });

    return res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: { event },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update an event (organizer or admin only)
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Event updated
 *       403:
 *         description: Forbidden — not the event organizer
 *       404:
 *         description: Event not found
 */
async function updateEvent(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id || id < 1) {
      return res.status(400).json({ success: false, message: 'Invalid event ID.' });
    }

    const event = await Event.unscoped().findOne({ where: { id, isDeleted: false } });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Ownership check — server-side, close to data access
    const isOwner = event.organizerId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this event.',
      });
    }

    // Only allow specific fields to be updated — strict allowlist
    const allowedUpdates = [
      'title', 'description', 'shortDescription', 'category',
      'venueName', 'venueAddress', 'venueCity', 'venueState', 'venueCountry', 'venueZipCode',
      'isOnline', 'onlineLink',
      'startDate', 'endDate', 'capacity', 'ticketPrice', 'isFree', 'tags', 'status',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    await event.save();

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      data: { event },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Soft-delete an event
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Event deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
async function deleteEvent(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id || id < 1) {
      return res.status(400).json({ success: false, message: 'Invalid event ID.' });
    }

    const event = await Event.unscoped().findOne({ where: { id, isDeleted: false } });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const isOwner = event.organizerId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this event.',
      });
    }

    // Soft delete — preserves data and audit trail
    event.isDeleted = true;
    event.status = 'cancelled';
    await event.save();

    return res.status(200).json({ success: true, message: 'Event deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /events/{id}/attend:
 *   post:
 *     summary: Register current user as an attendee
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Registered as attendee
 *       400:
 *         description: Already attending or event full
 *       404:
 *         description: Event not found
 */
async function attendEvent(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id || id < 1) {
      return res.status(400).json({ success: false, message: 'Invalid event ID.' });
    }

    const event = await Event.findOne({ where: { id, status: 'published', isDeleted: false } });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found or not available.' });
    }

    // Check if already attending
    const existing = await EventAttendee.findOne({
      where: { userId: req.user.id, eventId: id },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You are already registered for this event.' });
    }

    // Capacity check
    if (event.capacity && event.attendeeCount >= event.capacity) {
      return res.status(400).json({ success: false, message: 'This event has reached its capacity.' });
    }

    // Create attendee record and increment count atomically
    await EventAttendee.create({ userId: req.user.id, eventId: id });
    await event.increment('attendeeCount');

    return res.status(200).json({ success: true, message: 'Successfully registered for the event.' });
  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /events/my:
 *   get:
 *     summary: Get events created by the current user
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's events
 */
async function getMyEvents(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    // Ownership validated by querying with authenticated user's ID
    const { count, rows: events } = await Event.unscoped().findAndCountAll({
      where: { organizerId: req.user.id, isDeleted: false },
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      data: {
        events,
        pagination: { total: count, page, limit, pages: Math.ceil(count / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  attendEvent,
  getMyEvents,
};
