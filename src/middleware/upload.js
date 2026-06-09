'use strict';

const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

// Allowed MIME types for event banner images
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

/**
 * Disk storage with secure filename generation.
 * Uses UUID to prevent filename collision and path traversal attacks.
 * Original filename is NEVER used — only the extension (validated separately).
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.path);
  },
  filename: (req, file, cb) => {
    // Sanitize extension using path.extname — prevents directory traversal via filename
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error('Invalid file extension'));
    }
    // Generate unpredictable UUID-based filename; never trust original name
    const safeFilename = `${uuidv4()}${ext}`;
    cb(null, safeFilename);
  },
});

/**
 * MIME type filter — validates declared content type.
 * Note: magic-byte validation should be added for production hardening.
 * TODO(security): Add magic-byte / file signature validation using the 'file-type' package.
 */
function fileFilter(req, file, cb) {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, GIF`));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxSizeBytes, // Max 5MB by default
    files: 1,
  },
});

/**
 * Error-handling wrapper for multer
 */
function handleUpload(fieldName) {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            success: false,
            message: `File too large. Maximum size is ${config.upload.maxSizeBytes / (1024 * 1024)}MB.`,
          });
        }
        return res.status(400).json({ success: false, message: err.message });
      }
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  };
}

module.exports = { handleUpload };
