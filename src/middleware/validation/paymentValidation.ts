import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const paymentSchema = Joi.object({
  ambassadorId: Joi.string().required(),
  jobId: Joi.string().required(),
  taskIds: Joi.array().items(Joi.string()),
  amount: Joi.number().positive().required(),
  currency: Joi.string().default('USD'),
  type: Joi.string().valid('task_completion', 'bonus', 'referral', 'adjustment').required(),
  paymentMethod: Joi.object({
    type: Joi.string().required(),
    details: Joi.object({
      accountId: Joi.string(),
      last4: Joi.string(),
      provider: Joi.string()
    })
  }).required(),
  scheduledDate: Joi.date(),
  metadata: Joi.object({
    reference: Joi.string(),
    notes: Joi.string(),
    attachments: Joi.array().items(Joi.string())
  })
});

export const validatePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await paymentSchema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid payment data',
        details: error.message
      });
    }
  }
}; 