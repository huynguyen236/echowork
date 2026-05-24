const router = require('express').Router();
const accessibilityController = require('../controllers/accessibility.controller');
const auth = require('../middlewares/auth.middleware');

// All accessibility routes require authentication
router.use(auth);

// GET /api/accessibility    — Get settings (auto-creates defaults)
router.get('/', accessibilityController.getSettings);

// PUT /api/accessibility    — Update settings
router.put('/', accessibilityController.updateSettings);

module.exports = router;
