const { body } = require('express-validator');

const updateProfileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be 2–100 characters.'),

  body('disability')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Disability field must be under 255 characters.'),
];

module.exports = { updateProfileValidation };
