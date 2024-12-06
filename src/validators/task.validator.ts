import { body } from 'express-validator';
import mongoose from 'mongoose';

export const createTaskValidator = [
  body('jobId')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid job ID'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('assignedTo')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid user ID')
];

export const updateTaskValidator = [
  body('status')
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Invalid status value')
];
