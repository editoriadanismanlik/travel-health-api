import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  jobId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  assignedTo: mongoose.Types.ObjectId;
  status: 'pending' | 'in_progress' | 'under_review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: Date;
  completionTime?: Date;
  dependencies: mongoose.Types.ObjectId[];
  attachments: [{
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
  }];
  checklist: [{
    item: string;
    completed: boolean;
    completedAt?: Date;
  }];
  comments: [{
    userId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt?: Date;
  }];
  metrics: {
    timeSpent: number;  // in minutes
    attempts: number;
    qualityScore?: number;
  };
  location?: {
    type: string;
    coordinates: number[];
    address: string;
  };
  createdBy: mongoose.Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

const TaskSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'under_review', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  deadline: { type: Date, required: true },
  completionTime: { type: Date },
  dependencies: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  attachments: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  checklist: [{
    item: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date }
  }],
  comments: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
  }],
  metrics: {
    timeSpent: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    qualityScore: { type: Number }
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
    address: String
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for better query performance
TaskSchema.index({ jobId: 1, status: 1 });
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ deadline: 1 });
TaskSchema.index({ location: '2dsphere' });

export 