/**
 * Resume File Upload & Validation Middleware
 */

const multer = require('multer');
const path = require('path');
const { ValidationError } = require('../errors/AppError');

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Megabytes

// Store in memory buffer so StorageService can route to Local Disk or Azure Blob
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // 1. Extension validation
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new ValidationError(
        `Invalid file extension '${ext}'. Only PDF and DOCX files are accepted.`
      ),
      false
    );
  }

  // 2. MIME type validation
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new ValidationError(
        `Invalid file MIME type '${file.mimetype}'. Only PDF and DOCX documents are supported.`
      ),
      false
    );
  }

  // 3. Filename sanitation & path traversal prevention
  const baseName = path.basename(file.originalname);
  if (baseName.includes('..') || baseName.includes('/') || baseName.includes('\\')) {
    return cb(new ValidationError('Malicious filename detected.'), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 2,
  },
  fileFilter,
});

module.exports = upload;
