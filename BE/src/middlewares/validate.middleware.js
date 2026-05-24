const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response.util');

/**
 * Validate Middleware — collects express-validator errors and returns 400.
 * Place this AFTER the validation rule arrays in route definitions.
 */
const validateMiddleware = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed.', errors.array().map(e => ({
      field: e.path,
      message: e.msg,
    })));
  }

  next();
};

module.exports = validateMiddleware;
