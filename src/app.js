'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const config = require('./config/config');
const swaggerSpec = require('./config/swagger');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// ─── Security Headers (Helmet) ─────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"], // unsafe-inline needed for Swagger UI
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        upgradeInsecureRequests: config.isProduction ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false, // Required for Swagger UI to load external resources
    xFrameOptions: { action: 'deny' },   // Clickjacking protection
    xContentTypeOptions: true,            // X-Content-Type-Options: nosniff
    referrerPolicy: { policy: 'same-origin' },
    permittedCrossDomainPolicies: false,
    permissionsPolicy: {
      // Disable browser features we don't use
      features: {
        camera: [],
        microphone: [],
        geolocation: [],
        payment: [],
      },
    },
  })
);

// ─── CORS ──────────────────────────────────────────────────────────────────
// Strict allowlist — never use wildcard (*) for authenticated APIs
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin header) only in development
      if (!origin && !config.isProduction) return callback(null, true);
      if (!origin || config.cors.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// ─── Body Parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));  // Limit request body size to prevent DoS
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ─── Logging ───────────────────────────────────────────────────────────────
// Use 'combined' format in production, 'dev' locally
// MUST NOT log Authorization headers or bodies containing credentials
const morganFormat = config.isProduction ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    skip: (req) => req.url.startsWith('/api/v1/health'), // Reduce health-check noise
  })
);

// ─── General Rate Limiter ──────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Swagger UI Documentation ──────────────────────────────────────────────
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Eventora API Docs',
    customCss: `
      .swagger-ui .topbar { background-color: #1a1a2e; }
      .swagger-ui .topbar-wrapper .link { display: none; }
      .swagger-ui .info .title { color: #6c63ff; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
    },
  })
);

// Expose raw swagger JSON
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerSpec);
});

// ─── Serve uploaded files (private — must be authorized in production) ─────
// TODO(security): In production, serve uploads via a signed URL or authenticated endpoint.
// Direct static serving is acceptable for development only.
if (!config.isProduction) {
  app.use(
    '/uploads',
    express.static(config.upload.path, {
      dotfiles: 'deny',
      index: false,
    })
  );
}

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/users', userRoutes);

// ─── Root redirect to docs ─────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.redirect('/api/docs');
});

// ─── 404 & Global Error Handlers ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
