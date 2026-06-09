'use strict';

const { DataTypes, Model } = require('sequelize');
const crypto = require('crypto');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: "Tech Summit 2026"
 *         slug:
 *           type: string
 *           example: "tech-summit-2026-a1b2c3"
 *         description:
 *           type: string
 *         shortDescription:
 *           type: string
 *         category:
 *           type: string
 *           enum: [conference, workshop, concert, sports, networking, exhibition, festival, other]
 *         status:
 *           type: string
 *           enum: [draft, published, cancelled, completed]
 *         venueName:
 *           type: string
 *         venueAddress:
 *           type: string
 *         venueCity:
 *           type: string
 *         venueState:
 *           type: string
 *         venueCountry:
 *           type: string
 *         venueZipCode:
 *           type: string
 *         isOnline:
 *           type: boolean
 *         onlineLink:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         capacity:
 *           type: integer
 *         ticketPrice:
 *           type: number
 *         isFree:
 *           type: boolean
 *         tags:
 *           type: string
 *           description: Comma-separated list of tags
 *         bannerImage:
 *           type: string
 *         organizerId:
 *           type: integer
 *         attendeeCount:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 */
class Event extends Model {}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Event title is required' },
        len: { args: [3, 200], msg: 'Title must be between 3 and 200 characters' },
      },
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Description is required' },
        len: { args: [10, 5000], msg: 'Description must be between 10 and 5000 characters' },
      },
    },
    shortDescription: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM(
        'conference', 'workshop', 'concert', 'sports',
        'networking', 'exhibition', 'festival', 'other'
      ),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Category is required' },
      },
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'cancelled', 'completed'),
      defaultValue: 'draft',
      allowNull: false,
    },
    // Venue fields stored as flat columns (denormalized for simplicity)
    venueName: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    venueAddress: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    venueCity: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    venueState: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    venueCountry: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    venueZipCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    isOnline: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    onlineLink: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'Start date must be a valid date' },
      },
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'End date must be a valid date' },
        isAfterStart(value) {
          if (new Date(value) <= new Date(this.startDate)) {
            throw new Error('End date must be after start date');
          }
        },
      },
    },
    capacity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      validate: {
        min: { args: [1], msg: 'Capacity must be at least 1' },
        max: { args: [1000000], msg: 'Capacity must not exceed 1,000,000' },
      },
    },
    ticketPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      validate: {
        min: { args: [0], msg: 'Ticket price cannot be negative' },
      },
    },
    isFree: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Tags stored as JSON string (MySQL 5.7+ supports JSON column type)
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    bannerImage: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    },
    organizerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    attendeeCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Event',
    tableName: 'events',
    timestamps: true,
    underscored: true,
    paranoid: false, // We use our own isDeleted soft-delete flag
    defaultScope: {
      where: { isDeleted: false },
    },
    scopes: {
      includeDeleted: { where: {} },
      published: { where: { status: 'published', isDeleted: false } },
    },
    indexes: [
      { fields: ['status', 'start_date'] },
      { fields: ['organizer_id', 'status'] },
      { fields: ['category', 'status'] },
      { unique: true, fields: ['slug'] },
      // Full-text index for search on title & description
      { type: 'FULLTEXT', fields: ['title', 'description'] },
    ],
  }
);

/**
 * Hook: generate a unique URL-safe slug from the title before validating.
 */
Event.addHook('beforeValidate', async (event) => {
  if (!event.slug && event.title) {
    const base = event.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 80);
    const suffix = crypto.randomBytes(3).toString('hex');
    event.slug = `${base}-${suffix}`;
  }
});

module.exports = Event;
