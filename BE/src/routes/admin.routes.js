const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

// All admin routes require authentication AND ADMIN role
router.use(auth, role('ADMIN'));

// GET    /api/admin/users       — List all users (paginated)
router.get('/users', adminController.getAllUsers);

// DELETE /api/admin/users/:id   — Delete a user
router.delete('/users/:id', adminController.deleteUser);

// GET    /api/admin/jobs        — List all jobs (paginated)
router.get('/jobs', adminController.getAllJobs);

// GET    /api/admin/statistics  — Platform statistics
router.get('/statistics', adminController.getStatistics);

module.exports = router;
