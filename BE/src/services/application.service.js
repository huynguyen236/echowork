const prisma = require('../config/prisma');

/**
 * Apply to a job (CANDIDATE only).
 * Enforces the unique constraint (userId + jobId).
 */
exports.applyToJob = async (userId, jobId) => {
  // Check job exists
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw Object.assign(new Error('Job not found.'), { statusCode: 404 });

  // Check duplicate application
  const existing = await prisma.application.findUnique({
    where: { userId_jobId: { userId, jobId } },
  });
  if (existing) throw Object.assign(new Error('You have already applied to this job.'), { statusCode: 409 });

  return prisma.application.create({
    data: { userId, jobId },
    include: {
      job:  { select: { id: true, title: true, companyName: true } },
      user: { select: { id: true, fullName: true, email: true } },
    },
  });
};

/**
 * Get applications.
 * - CANDIDATE → their own applications
 * - RECRUITER  → applications on their jobs
 * - ADMIN      → all applications
 */
exports.getApplications = async (userId, role, query = {}) => {
  const { jobId, status, page = 1, limit = 10 } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  let where = {};

  if (role === 'CANDIDATE') {
    where.userId = userId;
  } else if (role === 'RECRUITER') {
    where.job = { userId };
  }

  if (jobId)  where.jobId  = parseInt(jobId);
  if (status) where.status = status;

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        job:  { select: { id: true, title: true, companyName: true, location: true } },
        user: { select: { id: true, fullName: true, email: true, avatar: true, disability: true } },
      },
    }),
    prisma.application.count({ where }),
  ]);

  return {
    applications,
    pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) },
  };
};

/**
 * Update application status (RECRUITER/ADMIN only).
 */
exports.updateStatus = async (applicationId, status, userId, role) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true },
  });
  if (!application) throw Object.assign(new Error('Application not found.'), { statusCode: 404 });

  // Recruiter can only update applications for their own jobs
  if (role === 'RECRUITER' && application.job.userId !== userId) {
    throw Object.assign(new Error('Forbidden.'), { statusCode: 403 });
  }

  return prisma.application.update({
    where: { id: applicationId },
    data:  { status },
    include: {
      job:  { select: { id: true, title: true, companyName: true } },
      user: { select: { id: true, fullName: true, email: true } },
    },
  });
};
