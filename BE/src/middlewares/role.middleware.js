const { sendError } = require('../utils/response.util');

/**
 * Role Middleware — restricts route access to specified roles.
 * Must be used AFTER authMiddleware (req.user must exist).
 *
 * Usage: roleMiddleware('ADMIN', 'RECRUITER')
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized. Please log in.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access forbidden. Required role: ${allowedRoles.join(' or ')}.`
      );
    }

    next();
  };
};

module.exports = roleMiddleware;
