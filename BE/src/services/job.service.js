const prisma = require('../config/prisma');
const { sanitizeFields } = require('../utils/sanitize.util');

// Fields to sanitize on every job create/update
const JOB_SANITIZE_FIELDS = ['title', 'description', 'companyName', 'location'];

/**
 * Get all jobs with optional search and filter.
 * @param {{ search?, location?, minSalary?, maxSalary?, page?, limit? }} query
 */
exports.getAllJobs = async (query = {}) => {
  const {
    search   = '',
    location = '',
    minSalary,
    maxSalary,
    page  = 1,
    limit = 10,
  } = query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {
    AND: [
      search   ? { OR: [
        { title:       { contains: search } },
        { companyName: { contains: search } },
        { description: { contains: search } },
      ]} : {},
      location ? { location: { contains: location } } : {},
      minSalary ? { salary: { gte: parseFloat(minSalary) } } : {},
      maxSalary ? { salary: { lte: parseFloat(maxSalary) } } : {},
    ],
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, fullName: true, avatar: true } },
        _count: { select: { applications: true } },
      },
    }),
    prisma.job.count({ where }),
  ]);

  return {
    jobs,
    pagination: {
      total,
      page:  parseInt(page),
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
};

/**
 * Get a single job by ID.
 */
exports.getJobById = async (jobId) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      createdBy: { select: { id: true, fullName: true, avatar: true } },
      _count: { select: { applications: true } },
    },
  });
  if (!job) throw Object.assign(new Error('Job not found.'), { statusCode: 404 });
  return job;
};

/**
 * Create a new job posting.
 * Sanitizes all user-provided text fields.
 */
exports.createJob = async (userId, data) => {
  const clean = sanitizeFields(data, JOB_SANITIZE_FIELDS);
  const { title, description, salary, location, companyName } = clean;

  return prisma.job.create({
    data: { title, description, salary: salary ? parseFloat(salary) : null, location, companyName, userId },
    include: { createdBy: { select: { id: true, fullName: true } } },
  });
};

/**
 * Update a job (only the owner or admin).
 * Sanitizes all user-provided text fields.
 */
exports.updateJob = async (jobId, userId, role, data) => {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw Object.assign(new Error('Job not found.'), { statusCode: 404 });

  if (job.userId !== userId && role !== 'ADMIN') {
    throw Object.assign(new Error('Forbidden. You do not own this job.'), { statusCode: 403 });
  }

  const clean = sanitizeFields(data, JOB_SANITIZE_FIELDS);
  const { title, description, salary, location, companyName } = clean;

  const updateData = {};
  if (title !== undefined)       updateData.title       = title;
  if (description !== undefined) updateData.description = description;
  if (salary !== undefined)      updateData.salary      = salary ? parseFloat(salary) : null;
  if (location !== undefined)    updateData.location    = location;
  if (companyName !== undefined) updateData.companyName = companyName;

  return prisma.job.update({ where: { id: jobId }, data: updateData });
};

/**
 * Delete a job (only the owner or admin).
 */
exports.deleteJob = async (jobId, userId, role) => {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw Object.assign(new Error('Job not found.'), { statusCode: 404 });

  if (job.userId !== userId && role !== 'ADMIN') {
    throw Object.assign(new Error('Forbidden. You do not own this job.'), { statusCode: 403 });
  }

  await prisma.job.delete({ where: { id: jobId } });
  return { deleted: true };
};
