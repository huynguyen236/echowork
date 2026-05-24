const accessibilityService = require('../services/accessibility.service');
const { sendSuccess } = require('../utils/response.util');

/**
 * GET /api/accessibility
 * Get or auto-create the authenticated user's accessibility settings.
 */
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await accessibilityService.getSettings(req.user.id);
    return sendSuccess(res, 200, 'Accessibility settings fetched.', settings);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/accessibility
 * Update (upsert) accessibility settings.
 * Body: { fontSize?: 'small'|'medium'|'large', contrastMode?: 'normal'|'high'|'dark' }
 */
exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await accessibilityService.updateSettings(req.user.id, req.body);
    return sendSuccess(res, 200, 'Accessibility settings updated.', settings);
  } catch (err) {
    next(err);
  }
};
