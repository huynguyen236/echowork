const userService = require('../services/user.service');
const { sendSuccess } = require('../utils/response.util');
const path = require('path');

/**
 * GET /api/users/profile
 * Returns the authenticated user's profile.
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.id);
    return sendSuccess(res, 200, 'Profile fetched.', user);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/profile
 * Update profile fields + optional avatar upload.
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, disability } = req.body;

    // If a file was uploaded, build the public URL path
    const avatarPath = req.file
      ? `/uploads/avatars/${req.file.filename}`
      : undefined;

    const user = await userService.updateProfile(req.user.id, { fullName, disability, avatarPath });
    return sendSuccess(res, 200, 'Profile updated.', user);
  } catch (err) {
    next(err);
  }
};
