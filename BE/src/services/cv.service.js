const prisma  = require('../config/prisma');
const pdfUtil = require('../utils/pdf.util');
const { sanitizeFields } = require('../utils/sanitize.util');

// Fields to sanitize on every CV create/update
const CV_SANITIZE_FIELDS = ['summary', 'education', 'experience', 'skills'];

/**
 * Create a new CV for the authenticated user.
 * Sanitizes all text fields to prevent XSS.
 */
exports.createCV = async (userId, data) => {
  const clean = sanitizeFields(data, CV_SANITIZE_FIELDS);
  const { summary, education, experience, skills, template } = clean;

  return prisma.cV.create({
    data: {
      userId,
      summary,
      education:  typeof education  === 'object' ? JSON.stringify(education)  : education,
      experience: typeof experience === 'object' ? JSON.stringify(experience) : experience,
      skills:     typeof skills     === 'object' ? JSON.stringify(skills)     : skills,
      template:   template || 'default',
    },
  });
};

/**
 * Update an existing CV (owner only).
 * Sanitizes all text fields to prevent XSS.
 */
exports.updateCV = async (cvId, userId, data) => {
  const cv = await prisma.cV.findUnique({ where: { id: cvId } });
  if (!cv) throw Object.assign(new Error('CV not found.'), { statusCode: 404 });
  if (cv.userId !== userId) throw Object.assign(new Error('Forbidden.'), { statusCode: 403 });

  const clean = sanitizeFields(data, CV_SANITIZE_FIELDS);
  const { summary, education, experience, skills, template } = clean;

  const updateData = {};
  if (summary    !== undefined) updateData.summary    = summary;
  if (template   !== undefined) updateData.template   = template;
  if (education  !== undefined) updateData.education  = typeof education  === 'object' ? JSON.stringify(education)  : education;
  if (experience !== undefined) updateData.experience = typeof experience === 'object' ? JSON.stringify(experience) : experience;
  if (skills     !== undefined) updateData.skills     = typeof skills     === 'object' ? JSON.stringify(skills)     : skills;

  return prisma.cV.update({ where: { id: cvId }, data: updateData });
};

/**
 * Get a CV by ID (owner or admin).
 */
exports.getCVById = async (cvId, userId, role) => {
  const cv = await prisma.cV.findUnique({
    where: { id: cvId },
    include: { user: { select: { id: true, fullName: true, email: true, disability: true } } },
  });
  if (!cv) throw Object.assign(new Error('CV not found.'), { statusCode: 404 });
  if (cv.userId !== userId && role !== 'ADMIN') {
    throw Object.assign(new Error('Forbidden.'), { statusCode: 403 });
  }
  return cv;
};

/**
 * Generate and return a PDF buffer for a CV.
 */
exports.generateCVPDF = async (cvId, userId, role) => {
  const cv = await prisma.cV.findUnique({
    where: { id: cvId },
    include: { user: { select: { fullName: true, email: true, disability: true } } },
  });
  if (!cv) throw Object.assign(new Error('CV not found.'), { statusCode: 404 });
  if (cv.userId !== userId && role !== 'ADMIN') {
    throw Object.assign(new Error('Forbidden.'), { statusCode: 403 });
  }

  const html      = pdfUtil.buildCVHTML(cv, cv.user);
  const pdfBuffer = await pdfUtil.generatePDFFromHTML(html);

  return { pdfBuffer, fileName: `cv-${cv.user.fullName.replace(/\s+/g, '_')}-${cvId}.pdf` };
};
