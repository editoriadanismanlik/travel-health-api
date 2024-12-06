import { body } from 'express-validator';

export const createJobValidator = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('salary')
    .isNumeric()
    .withMessage('Salary must be a number')
    .custom((value) => value > 0)
    .withMessage('Salary must be greater than 0')
];

export const updateJobValidator = [
  body('status')
    .isIn(['open', 'in-progress', 'completed'])
    .withMessage('Invalid status value')
];
