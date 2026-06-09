'use strict';

const hash = '$2b$12$umAgP.cfW9PspeyucRnePOE25GFLgGL8m3gnvOqoXIMSltGnYoipK'; // hashes to 'password123'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 1. Seed Users
    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        name: 'Admin Organizer',
        email: 'admin@example.com',
        password: hash,
        role: 'organizer',
        is_email_verified: true,
        avatar: '',
        is_active: true,
        token_version: 0,
        created_at: now,
        updated_at: now
      },
      {
        id: 2,
        name: 'Aarav Sharma',
        email: 'aarav@example.com',
        password: hash,
        role: 'user',
        is_email_verified: true,
        avatar: '',
        is_active: true,
        token_version: 0,
        created_at: now,
        updated_at: now
      },
      {
        id: 3,
        name: 'Priya Patel',
        email: 'priya@example.com',
        password: hash,
        role: 'user',
        is_email_verified: true,
        avatar: '',
        is_active: true,
        token_version: 0,
        created_at: now,
        updated_at: now
      },
      {
        id: 4,
        name: 'Rohan Mehta',
        email: 'rohan@example.com',
        password: hash,
        role: 'user',
        is_email_verified: true,
        avatar: '',
        is_active: true,
        token_version: 0,
        created_at: now,
        updated_at: now
      }
    ]);

    // 2. Seed Events
    await queryInterface.bulkInsert('events', [
      {
        id: 1,
        title: 'Tech Summit 2026',
        slug: 'tech-summit-2026-a1',
        description: 'Global technology and software architecture summit hosting top speakers.',
        short_description: 'Global technology and software architecture summit.',
        category: 'conference',
        status: 'published',
        venue_name: 'Convention Center',
        venue_address: '101 Main St',
        venue_city: 'Delhi',
        venue_state: 'Delhi',
        venue_country: 'India',
        venue_zip_code: '110001',
        is_online: false,
        online_link: '',
        start_date: new Date('2026-06-15T10:00:00.000Z'),
        end_date: new Date('2026-06-16T18:00:00.000Z'),
        capacity: 500,
        ticket_price: 1499.00,
        is_free: false,
        tags: JSON.stringify(['tech', 'coding', 'ai']),
        banner_image: '',
        organizer_id: 1,
        attendee_count: 3,
        is_deleted: false,
        created_at: now,
        updated_at: now
      },
      {
        id: 2,
        title: 'Vite & React Masterclass',
        slug: 'vite-react-masterclass-b2',
        description: 'Interactive coding workshop building premium web applications with vanilla CSS styling.',
        short_description: 'Interactive coding workshop building premium UI applications.',
        category: 'workshop',
        status: 'published',
        venue_name: 'Tech Hall A',
        venue_address: 'Stall 4, Sector 62',
        venue_city: 'Noida',
        venue_state: 'Uttar Pradesh',
        venue_country: 'India',
        venue_zip_code: '201301',
        is_online: false,
        online_link: '',
        start_date: new Date('2026-06-20T09:00:00.000Z'),
        end_date: new Date('2026-06-20T17:00:00.000Z'),
        capacity: 50,
        ticket_price: 0.00,
        is_free: true,
        tags: JSON.stringify(['react', 'vite', 'javascript']),
        banner_image: '',
        organizer_id: 1,
        attendee_count: 1,
        is_deleted: false,
        created_at: now,
        updated_at: now
      },
      {
        id: 3,
        title: 'Rocking the Web Concert',
        slug: 'rocking-web-concert-c3',
        description: 'Music and art festival celebrating developers worldwide.',
        short_description: 'Music and art festival celebrating developers.',
        category: 'concert',
        status: 'published',
        venue_name: 'Grand Arena',
        venue_address: 'Central Park Ground',
        venue_city: 'Mumbai',
        venue_state: 'Maharashtra',
        venue_country: 'India',
        venue_zip_code: '400001',
        is_online: false,
        online_link: '',
        start_date: new Date('2026-07-01T18:00:00.000Z'),
        end_date: new Date('2026-07-02T01:00:00.000Z'),
        capacity: 1000,
        ticket_price: 999.00,
        is_free: false,
        tags: JSON.stringify(['music', 'concert', 'fun']),
        banner_image: '',
        organizer_id: 1,
        attendee_count: 1,
        is_deleted: false,
        created_at: now,
        updated_at: now
      }
    ]);

    // 3. Seed Registrations
    await queryInterface.bulkInsert('event_attendees', [
      {
        user_id: 2,
        event_id: 1,
        created_at: now,
        updated_at: now
      },
      {
        user_id: 3,
        event_id: 1,
        created_at: now,
        updated_at: now
      },
      {
        user_id: 3,
        event_id: 2,
        created_at: now,
        updated_at: now
      },
      {
        user_id: 4,
        event_id: 1,
        created_at: now,
        updated_at: now
      },
      {
        user_id: 4,
        event_id: 3,
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('event_attendees', null, {});
    await queryInterface.bulkDelete('events', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
