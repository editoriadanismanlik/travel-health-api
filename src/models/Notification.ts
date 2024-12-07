import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: 'job_assignment' | 'task_update' | 'payment' | 'system' | 'deadline' | 'performance';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  reference: {
    type: 'job' | 'task' | 'payment' | 'system';
    id: mongoose.Types.ObjectId;
  };
  read: boolean;
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['job_assignment', 'task_update', 'payment', 'system', 'deadline', 'performance'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  reference: {
    type: { type: String, enum: ['job', 'task', 'payment', 'system'], required: true },
    id: { type: Schema.Types.ObjectId, required: true }
  },
  read: { type: Boolean, default: false },
  readAt: { type: Date },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
}); 