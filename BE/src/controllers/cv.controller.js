const cvService = require('../services/cv.service');
const { sendSuccess } = require('../utils/response.util');

/**
 * POST /api/cv
 * Create a new CV.
 */
exports.createCV = async (req, res, next) => {
  try {
    const cv = await cvService.createCV(req.user.id, req.body);
    return sendSuccess(res, 201, 'CV created.', cv);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/cv/:id
 * Update a CV (owner only).
 */
exports.updateCV = async (req, res, next) => {
  try {
    const cv = await cvService.updateCV(parseInt(req.params.id), req.user.id, req.body);
    return sendSuccess(res, 200, 'CV updated.', cv);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cv/:id
 * View a CV (owner or admin).
 */
exports.getCVById = async (req, res, next) => {
  try {
    const cv = await cvService.getCVById(parseInt(req.params.id), req.user.id, req.user.role);
    return sendSuccess(res, 200, 'CV fetched.', cv);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cv/download/:id
 * Export CV as downloadable PDF.
 */
exports.downloadCV = async (req, res, next) => {
  try {
    const { pdfBuffer, fileName } = await cvService.generateCVPDF(
      parseInt(req.params.id),
      req.user.id,
      req.user.role
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cv/my-cvs
 * Get all CVs for the current user.
 */
exports.getMyCVs = async (req, res, next) => {
  try {
    const prisma = require('../config/prisma');
    const cvs = await prisma.cV.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, 200, 'CVs fetched.', cvs);
  } catch (err) {
    next(err);
  }
};
