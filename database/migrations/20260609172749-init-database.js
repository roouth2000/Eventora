'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(254),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('user', 'organizer', 'admin'),
        defaultValue: 'user',
        allowNull: false
      },
      is_email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      avatar: {
        type: Sequelize.STRING(2048),
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      refresh_token_hash: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      token_version: {
        type: Sequelize.INTEGER.UNSIGNED,
        defaultValue: 0,
        allowNull: false
      },
      password_changed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 2. Create events table
    await queryInterface.createTable('events', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(120),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      short_description: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      category: {
        type: Sequelize.ENUM(
          'conference', 'workshop', 'concert', 'sports',
          'networking', 'exhibition', 'festival', 'other'
        ),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'cancelled', 'completed'),
        defaultValue: 'draft',
        allowNull: false
      },
      venue_name: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      venue_address: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      venue_city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      venue_state: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      venue_country: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      venue_zip_code: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      is_online: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      online_link: {
        type: Sequelize.STRING(2048),
        allowNull: true
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      capacity: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true
      },
      ticket_price: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      is_free: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      tags: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      banner_image: {
        type: Sequelize.STRING(2048),
        allowNull: true
      },
      organizer_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      attendee_count: {
        type: Sequelize.INTEGER.UNSIGNED,
        defaultValue: 0,
        allowNull: false
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 3. Create event_attendees table
    await queryInterface.createTable('event_attendees', {
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      event_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('event_attendees');
    await queryInterface.dropTable('events');
    await queryInterface.dropTable('users');
  }
};
