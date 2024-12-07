import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  startDate: Date;
  endDate: Date;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
  };
  dependencies: mongoose.Types.ObjectId[];
  assignedAmbassadors: mongoose.Types.ObjectId[];
  payment: {
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'failed';
  };
  location: {
    type: string;
    coordinates: number[];
    address: string;
  };
  createdBy: mongoose.Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

const JobSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isRecurring: { type: Boolean, default: false },
  recurringPattern: {
    frequency: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly']
    },
    interval: { type: Number }
  },
  dependencies: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
  assignedAmbassadors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  payment: {
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    }
  },
  location: {
    type: { type: String, required: true },
    coordinates: [{ type: Number, required: true }],
    address: { type: String, required: true }
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IJob>('Job', JobSchema); 