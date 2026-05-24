const adminService = require('../services/admin.service');
const { sendSuccess } = require('../utils/response.util');

/**
 * GET /api/admin/users
 * List all users with pagination. Supports ?role=, ?search=, ?page=, ?limit=
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const result = await adminService.getAllUsers(req.query);
    return sendSuccess(res, 200, 'Users fetched.', result);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/users/:id
 * Hard-delete a user account.
 */
exports.deleteUser = async (req, res, next) => {
  try {
    await adminService.deleteUser(parseInt(req.params.id));
    return sendSuccess(res, 200, 'User deleted.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/jobs
 * List all jobs with pagination.
 */
exports.getAllJobs = async (req, res, next) => {
  try {
    const result = await adminService.getAllJobsAdmin(req.query);
    return sendSuccess(res, 200, 'Jobs fetched.', result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/statistics
 * Platform-wide stats: total users, jobs, applications by status.
 */
exports.getStatistics = async (req, res, next) => {
  try {
    const stats = await adminService.getStatistics();
    return sendSuccess(res, 200, 'Statistics fetched.', stats);
  } catch (err) {
    next(err);
  }
};
