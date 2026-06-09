'use strict';

const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Jane Doe
 *         email:
 *           type: string
 *           example: jane@example.com
 *         role:
 *           type: string
 *           enum: [user, organizer, admin]
 *           example: user
 *         isEmailVerified:
 *           type: boolean
 *         avatar:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
class User extends Model {
  /**
   * Compares a plain-text candidate password with the stored hash.
   * Timing-safe via bcrypt.compare.
   */
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  /**
   * Returns a safe user object without sensitive fields.
   */
  toSafeObject() {
    const obj = this.toJSON();
    delete obj.password;
    delete obj.refreshTokenHash;
    delete obj.tokenVersion;
    delete obj.passwordChangedAt;
    return obj;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Name is required' },
        len: { args: [2, 100], msg: 'Name must be between 2 and 100 characters' },
      },
    },
    email: {
      type: DataTypes.STRING(254),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: 'Must be a valid email address' },
        notEmpty: { msg: 'Email is required' },
      },
      set(value) {
        // Normalize email to lowercase
        this.setDataValue('email', value ? value.toLowerCase().trim() : value);
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: { args: [8, 128], msg: 'Password must be between 8 and 128 characters' },
      },
    },
    role: {
      type: DataTypes.ENUM('user', 'organizer', 'admin'),
      defaultValue: 'user',
      allowNull: false,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    avatar: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Refresh token stored as a hash — never plaintext
    refreshTokenHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // Incremented on logout/password-change to invalidate all outstanding JWTs
    tokenVersion: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      allowNull: false,
    },
    passwordChangedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // TODO(security): Add emailVerificationToken and passwordResetToken columns
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
    // Default scope: never return sensitive fields in queries
    defaultScope: {
      attributes: {
        exclude: ['password', 'refreshTokenHash', 'tokenVersion', 'passwordChangedAt'],
      },
    },
    scopes: {
      // Use User.scope('withSensitive') when you need password/tokenVersion
      withSensitive: {
        attributes: {},
      },
    },
    indexes: [
      { unique: true, fields: ['email'] },
      { fields: ['is_active'] },
    ],
  }
);

/**
 * Hook: hash password before create/update.
 * Uses bcrypt cost 12 — memory-hard enough for most deployments.
 * TODO(security): Consider upgrading to Argon2 for stronger memory-hard hashing.
 */
async function hashPasswordHook(user) {
  if (!user.changed('password')) return;
  const saltRounds = 12;
  user.password = await bcrypt.hash(user.password, saltRounds);
  if (!user.isNewRecord) {
    user.passwordChangedAt = new Date();
    // Invalidate all outstanding JWTs by bumping tokenVersion
    user.tokenVersion = (user.tokenVersion || 0) + 1;
  }
}

User.addHook('beforeCreate', hashPasswordHook);
User.addHook('beforeUpdate', hashPasswordHook);

module.exports = User;
