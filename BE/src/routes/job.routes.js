const router = require('express').Router();
const jobController = require('../controllers/job.controller');
const auth     = require('../middlewares/auth.middleware');
const role     = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { createJobValidation, updateJobValidation } = require('../validations/job.validation');

// GET  /api/jobs        — Public: list & search jobs
router.get('/', jobController.getAllJobs);

// GET  /api/jobs/:id    — Public: get single job
router.get('/:id', jobController.getJobById);

// POST /api/jobs        — RECRUITER or ADMIN only
router.post(
  '/',
  auth, role('RECRUITER', 'ADMIN'),
  createJobValidation, validate,
  jobController.createJob
);

// PUT  /api/jobs/:id    — RECRUITER (owner) or ADMIN
router.put(
  '/:id',
  auth, role('RECRUITER', 'ADMIN'),
  updateJobValidation, validate,
  jobController.updateJob
);

// DELETE /api/jobs/:id  — RECRUITER (owner) or ADMIN
router.delete(
  '/:id',
  auth, role('RECRUITER', 'ADMIN'),
  jobController.deleteJob
);

module.exports = router;
