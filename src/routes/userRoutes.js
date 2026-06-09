'use strict';

const express = require('express');
const { getProfile, updateProfile, changePassword, getAllUsers } = require('../controllers/userController');
const { changePasswordValidator } = require('../validators/authValidators');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePasswordValidator, validate, changePassword);

// Admin-only
router.get('/', authorize('admin'), getAllUsers);

module.exports = router;
