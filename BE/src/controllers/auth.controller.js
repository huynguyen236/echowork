const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response.util');

/**
 * POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return sendSuccess(res, 201, 'Registration successful.', user);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return sendSuccess(res, 200, 'Login successful.', result);
  } catch (err) {
    next(err);
  }
};