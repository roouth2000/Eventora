'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User } = require('../models/associations');

/**
 * Generates a signed JWT access token.
 * Uses hardcoded algorithm — never reads algorithm from token header.
 * Includes tokenVersion for session invalidation.
 */
function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id.toString(),
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    config.jwt.secret,
    {
      algorithm: config.jwt.algorithm, // Hardcoded HS256
      expiresIn: config.jwt.expiresIn,
      issuer: 'eventora-api',
      audience: 'eventora-client',
    }
  );
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "MyStr0ng!Pass"
 *               role:
 *                 type: string
 *                 enum: [user, organizer]
 *                 example: user
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token: { type: string }
 *       409:
 *         description: Email already in use
 *       422:
 *         description: Validation failed
 */
async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    // Only allow user or organizer roles on self-registration
    const allowedRoles = ['user', 'organizer'];
    const assignedRole = allowedRoles.includes(role) ? role : 'user';

    const user = await User.create({ name, email, password, role: assignedRole });

    // Reload with sensitive scope to get tokenVersion for JWT
    const userWithVersion = await User.scope('withSensitive').findByPk(user.id);

    const token = generateAccessToken(userWithVersion);

    // TODO(security): Send email verification link after registration
    // TODO(security): Consider OAuth provider login (Google/GitHub) as alternative

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        user: user.toSafeObject(),
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "MyStr0ng!Pass"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token: { type: string }
 *       401:
 *         description: Invalid credentials
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Include password and tokenVersion via withSensitive scope
    const user = await User.scope('withSensitive').findOne({
      where: { email: email.toLowerCase(), isActive: true },
    });

    // Use consistent error message to prevent user enumeration
    const invalidMsg = 'Invalid email or password.';

    if (!user) {
      return res.status(401).json({ success: false, message: invalidMsg });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // MUST NOT log the attempted password
      return res.status(401).json({ success: false, message: invalidMsg });
    }

    const token = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: user.toSafeObject(),
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout and invalidate current token
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Not authenticated
 */
async function logout(req, res, next) {
  try {
    // Increment tokenVersion to invalidate all outstanding tokens for this user
    await User.scope('withSensitive').update(
      { tokenVersion: sequelize.literal('token_version + 1') },
      { where: { id: req.user.id } }
    );

    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Not authenticated
 */
async function getMe(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({ success: true, data: { user: user.toSafeObject() } });
  } catch (err) {
    next(err);
  }
}

// Sequelize literal helper for token version increment (used in logout)
const { sequelize } = require('../config/database');

module.exports = { register, login, logout, getMe };
