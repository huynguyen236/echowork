const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// ─── Ensure upload directories exist ─────────────────────────────────────────
const AVATAR_DIR = path.join(__dirname, '..', 'uploads', 'avatars');
const CV_DIR     = path.join(__dirname, '..', 'uploads', 'cvs');

[AVATAR_DIR, CV_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ─── Allowed MIME types ────────────────────────────────────────────────────
// Avatar: images only (jpg/jpeg/png)
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
// CV: PDF only (per spec)
const CV_MIME_TYPES    = ['application/pdf'];

// ─── Safe extension extractor ─────────────────────────────────────────────
// Prevents path traversal by only allowing known safe extensions.
const SAFE_IMAGE_EXTS = ['.jpg', '.jpeg', '.png'];
const SAFE_CV_EXTS    = ['.pdf'];

function safeExtension(originalname, allowedExts) {
  const ext = path.extname(originalname).toLowerCase();
  return allowedExts.includes(ext) ? ext : null;
}

// ─── Storage Engines ──────────────────────────────────────────────────────────
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AVATAR_DIR),
  filename:    (req, file, cb) => {
    const ext    = safeExtension(file.originalname, SAFE_IMAGE_EXTS) || '.jpg';
    const unique = `avatar-${req.user.id}-${Date.now()}${ext}`;
    cb(null, unique);
  },
});

const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CV_DIR),
  filename:    (req, file, cb) => {
    const ext    = safeExtension(file.originalname, SAFE_CV_EXTS) || '.pdf';
    const unique = `cv-${req.user.id}-${Date.now()}${ext}`;
    cb(null, unique);
  },
});

// ─── File Filters ──────────────────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error('Invalid file type. Only JPG, JPEG, and PNG images are allowed.');
    err.code = 'INVALID_FILE_TYPE';
    cb(err, false);
  }
};

const cvFilter = (req, file, cb) => {
  if (CV_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error('Invalid file type. Only PDF files are allowed for CV upload.');
    err.code = 'INVALID_FILE_TYPE';
    cb(err, false);
  }
};

// ─── Size limits ───────────────────────────────────────────────────────────────
const AVATAR_MAX_BYTES = parseInt(process.env.AVATAR_MAX_SIZE) || 2 * 1024 * 1024; // 2 MB
const CV_MAX_BYTES     = parseInt(process.env.CV_MAX_SIZE)     || 5 * 1024 * 1024; // 5 MB

// ─── Multer Instances ──────────────────────────────────────────────────────────
const uploadAvatar = multer({
  storage:    avatarStorage,
  fileFilter: imageFilter,
  limits:     { fileSize: AVATAR_MAX_BYTES },
});

const uploadCV = multer({
  storage:    cvStorage,
  fileFilter: cvFilter,
  limits:     { fileSize: CV_MAX_BYTES },
});

// ─── Multer Error Handler ─────────────────────────────────────────────────────
/**
 * Wrap a multer upload middleware and convert Multer errors into clean 400 responses.
 * Usage: handleUpload(uploadAvatar.single('avatar'))(req, res, next)
 */
const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (!err) return next();

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum allowed size is ${
          err.field === 'avatar'
            ? `${AVATAR_MAX_BYTES / (1024 * 1024)}MB`
            : `${CV_MAX_BYTES / (1024 * 1024)}MB`
        }.`,
      });
    }

    if (err.code === 'INVALID_FILE_TYPE' || err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: err.message });
    }

    // Unknown upload error
    return res.status(500).json({ success: false, message: 'File upload failed.' });
  });
};

module.exports = { uploadAvatar, uploadCV, handleUpload };
