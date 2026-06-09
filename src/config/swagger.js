'use strict';

const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./config');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Eventora API',
      version: '1.0.0',
      description: `
## Eventora Event Management API

Full-featured REST API for the **Eventora** platform hosted at [${config.productionDomain}](${config.productionDomain}).

**Database:** MySQL + Sequelize ORM  
**Auth:** JWT Bearer Token (HS256)

### Authentication
After logging in or registering, include the token in every protected request:

\`\`\`
Authorization: Bearer <your_token>
\`\`\`

### Rate Limiting
- General: ${config.rateLimit.max} requests per ${config.rateLimit.windowMs / 60000} minutes
- Auth endpoints: ${config.rateLimit.authMax} requests per window
      `.trim(),
      contact: {
        name: 'Eventora Support',
        url: config.productionDomain,
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: `${config.productionDomain}/api/v1`,
        description: 'Production Server',
      },
      {
        url: `http://localhost:${config.port}/api/v1`,
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token (obtained from /auth/login or /auth/register)',
        },
      },
      schemas: {
        // Inline schemas are defined per-route via JSDoc; shared ones here
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'An error occurred' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            pages: { type: 'integer' },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication & Registration' },
      { name: 'Events', description: 'Event CRUD operations' },
      { name: 'Users', description: 'User profile management' },
      { name: 'Health', description: 'API health check' },
    ],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
