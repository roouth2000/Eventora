'use strict';

/**
 * associations.js
 * Defines all Sequelize model associations in one place.
 * Call this after all models are loaded.
 *
 * MySQL Join Table: event_attendees (userId, eventId)
 */

const User = require('./User');
const Event = require('./Event');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// EventAttendee join table (Many-to-Many: Users <-> Events)
const EventAttendee = sequelize.define(
  'EventAttendee',
  {
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    eventId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'events', key: 'id' },
    },
    registeredAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'event_attendees',
    underscored: true,
    timestamps: false,
  }
);

// Event belongs to an organizer (User)
Event.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });
User.hasMany(Event, { foreignKey: 'organizerId', as: 'organizedEvents' });

// Many-to-many: Users attend Events
User.belongsToMany(Event, {
  through: EventAttendee,
  foreignKey: 'userId',
  otherKey: 'eventId',
  as: 'attendingEvents',
});
Event.belongsToMany(User, {
  through: EventAttendee,
  foreignKey: 'eventId',
  otherKey: 'userId',
  as: 'attendees',
});

module.exports = { User, Event, EventAttendee };
