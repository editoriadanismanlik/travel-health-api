import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  ambassadorId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  taskIds: mongoose.Types.ObjectId[];
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  type: 'task_completion' | 'bonus' | 'referral' | 'adjustment';
  paymentMethod: {
    type: string;
    details: {
      accountId?: string;
      last4?: string;
      provider?: string;
    };
  };
  breakdown: {
    baseAmount: number;
    bonus?: number;
    tax?: number;
    fees?: number;
  };
  metadata: {
    reference?: string;
    notes?: string;
    attachments?: string[];
  };
  scheduledDate?: Date;
  processedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

const PaymentSchema = new Schema({
  ambassadorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  taskIds: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['task_completion', 'bonus', 'referral', 'adjustment'],
    required: true
  },
  paymentMethod: {
    type: { type: String, required: true },
    details: {
      accountId: String,
      last4: String,
      provider: String
    }
  },
  breakdown: {
    baseAmount: { type: Number, required: true },
    bonus: Number,
    tax: Number,
    fees: Number
  },
  metadata: {
    reference: String,
    notes: String,
    attachments: [String]
  },
  scheduledDate: { type: Date },
  processedAt: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPayment>('Payment', PaymentSchema); 