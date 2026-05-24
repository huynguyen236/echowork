const applicationService = require('../services/application.service');
const { sendSuccess } = require('../utils/response.util');

/**
 * POST /api/applications
 * CANDIDATE: apply to a job.
 * Body: { jobId }
 */
exports.applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    const application = await applicationService.applyToJob(req.user.id, parseInt(jobId));
    return sendSuccess(res, 201, 'Application submitted.', application);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/applications
 * - CANDIDATE  → own applications
 * - RECRUITER  → applications on their jobs
 * - ADMIN      → all
 * Supports ?jobId=, ?status=, ?page=, ?limit=
 */
exports.getApplications = async (req, res, next) => {
  try {
    const result = await applicationService.getApplications(
      req.user.id,
      req.user.role,
      req.query
    );
    return sendSuccess(res, 200, 'Applications fetched.', result);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/applications/:id/status
 * RECRUITER / ADMIN: update application status.
 * Body: { status: 'ACCEPTED' | 'REJECTED' | 'PENDING' }
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const application = await applicationService.updateStatus(
      parseInt(req.params.id),
      status,
      req.user.id,
      req.user.role
    );
    return sendSuccess(res, 200, 'Application status updated.', application);
  } catch (err) {
    next(err);
  }
};
