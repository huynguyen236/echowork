const jobService = require('../services/job.service');
const { sendSuccess } = require('../utils/response.util');

/**
 * GET /api/jobs
 * Public — supports ?search=, ?location=, ?minSalary=, ?maxSalary=, ?page=, ?limit=
 */
exports.getAllJobs = async (req, res, next) => {
  try {
    const result = await jobService.getAllJobs(req.query);
    return sendSuccess(res, 200, 'Jobs fetched.', result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/jobs/:id
 * Public
 */
exports.getJobById = async (req, res, next) => {
  try {
    const job = await jobService.getJobById(parseInt(req.params.id));
    return sendSuccess(res, 200, 'Job fetched.', job);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/jobs
 * RECRUITER / ADMIN only
 */
exports.createJob = async (req, res, next) => {
  try {
    const job = await jobService.createJob(req.user.id, req.body);
    return sendSuccess(res, 201, 'Job created.', job);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/jobs/:id
 * Owner (RECRUITER) or ADMIN
 */
exports.updateJob = async (req, res, next) => {
  try {
    const job = await jobService.updateJob(
      parseInt(req.params.id),
      req.user.id,
      req.user.role,
      req.body
    );
    return sendSuccess(res, 200, 'Job updated.', job);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/jobs/:id
 * Owner (RECRUITER) or ADMIN
 */
exports.deleteJob = async (req, res, next) => {
  try {
    await jobService.deleteJob(parseInt(req.params.id), req.user.id, req.user.role);
    return sendSuccess(res, 200, 'Job deleted.');
  } catch (err) {
    next(err);
  }
};
