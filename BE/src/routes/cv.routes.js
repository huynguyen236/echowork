const router = require('express').Router();
const cvController = require('../controllers/cv.controller');
const auth     = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { cvValidation } = require('../validations/cv.validation');

// All CV routes require authentication
router.use(auth);

// IMPORTANT: /download/:id must be declared BEFORE /:id
// to prevent Express from matching "download" as an :id param

// GET  /api/cv/download/:id — Export CV as PDF
router.get('/download/:id', cvController.downloadCV);

// GET  /api/cv/my-cvs      — Get all CVs for current user
router.get('/my-cvs', cvController.getMyCVs);

// POST /api/cv              — Create CV
router.post('/', cvValidation, validate, cvController.createCV);

// GET  /api/cv/:id          — Get CV by ID
router.get('/:id', cvController.getCVById);

// PUT  /api/cv/:id          — Update CV
router.put('/:id', cvValidation, validate, cvController.updateCV);

module.exports = router;
