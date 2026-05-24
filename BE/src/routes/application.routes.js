const router = require('express').Router();
const applicationController = require('../controllers/application.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

// All application routes require authentication
router.use(auth);

// POST /api/applications         — CANDIDATE: submit application
router.post('/', role('CANDIDATE'), applicationController.applyToJob);

// GET  /api/applications         — scoped by role automatically in service
router.get('/', applicationController.getApplications);

// PATCH /api/applications/:id/status — RECRUITER or ADMIN: change status
router.patch('/:id/status', role('RECRUITER', 'ADMIN'), applicationController.updateStatus);

module.exports = router;
