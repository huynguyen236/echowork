const { body } = require('express-validator');

const cvValidation = [
  body('summary')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Summary must be under 2000 characters.'),

  body('education')
    .optional()
    .trim(),

  body('experience')
    .optional()
    .trim(),

  body('skills')
    .optional()
    .trim(),

  body('template')
    .optional()
    .isIn(['default', 'modern', 'minimal', 'professional'])
    .withMessage('Template must be one of: default, modern, minimal, professional.'),
];

module.exports = { cvValidation };
