const { body } = require('express-validator');

const createJobValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Job title is required.')
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters.'),

  body('description')
    .trim()
    .notEmpty().withMessage('Job description is required.'),

  body('companyName')
    .trim()
    .notEmpty().withMessage('Company name is required.')
    .isLength({ max: 200 }).withMessage('Company name must be under 200 characters.'),

  body('salary')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Salary must be a positive number.'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Location must be under 255 characters.'),
];

const updateJobValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters.'),

  body('description')
    .optional()
    .trim(),

  body('salary')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Salary must be a positive number.'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Location must be under 255 characters.'),
];

module.exports = { createJobValidation, updateJobValidation };
