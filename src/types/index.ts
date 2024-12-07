import { Request } from 'express';
import { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  mfaEnabled: boolean;
  mfaSecret?: string;
  backupCodes?: { code: string; used: boolean; }[];
  preferences?: {
    widgets?: any[];
    theme?: string;
    notifications?: {
      email: boolean;
      push: boolean;
    };
  };
}

export interface IJob extends Document {
  title: string;
  description: string;
  location: string;
  status: 'open' | 'in-progress' | 'completed';
  assignedTo: string;
  createdBy: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface ITask extends Document {
  title: string;
  description: string;
  jobId: string;
  assignedTo: string;
  createdBy: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface IEarning extends Document {
  userId: string;
  jobId: string;
  amount: number;
  date: Date;
  description: string;
  status: 'pending' | 'paid';
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role?: string;
  };
}

export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: number;
}
