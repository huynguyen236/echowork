const prisma = require('../config/prisma');

/**
 * Get all users (admin only) with pagination.
 */
exports.getAllUsers = async (query = {}) => {
  const { page = 1, limit = 20, role, search } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {
    ...(role   ? { role }                                               : {}),
    ...(search ? { OR: [
      { fullName: { contains: search } },
      { email:    { contains: search } },
    ]} : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: { id: true, fullName: true, email: true, role: true, avatar: true, disability: true, createdAt: true },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) } };
};

/**
 * Get all jobs for admin view.
 */
exports.getAllJobsAdmin = async (query = {}) => {
  const { page = 1, limit = 20 } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, fullName: true, email: true } },
        _count:    { select: { applications: true } },
      },
    }),
    prisma.job.count(),
  ]);

  return { jobs, pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) } };
};

/**
 * Platform statistics dashboard.
 */
exports.getStatistics = async () => {
  const [
    totalUsers,
    totalCandidates,
    totalRecruiters,
    totalJobs,
    totalApplications,
    pendingApplications,
    acceptedApplications,
    rejectedApplications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'CANDIDATE' } }),
    prisma.user.count({ where: { role: 'RECRUITER' } }),
    prisma.job.count(),
    prisma.application.count(),
    prisma.application.count({ where: { status: 'PENDING' } }),
    prisma.application.count({ where: { status: 'ACCEPTED' } }),
    prisma.application.count({ where: { status: 'REJECTED' } }),
  ]);

  return {
    users: { total: totalUsers, candidates: totalCandidates, recruiters: totalRecruiters },
    jobs:  { total: totalJobs },
    applications: {
      total:    totalApplications,
      pending:  pendingApplications,
      accepted: acceptedApplications,
      rejected: rejectedApplications,
    },
  };
};

/**
 * Delete a user (admin only).
 */
exports.deleteUser = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  await prisma.user.delete({ where: { id: userId } });
  return { deleted: true };
};
