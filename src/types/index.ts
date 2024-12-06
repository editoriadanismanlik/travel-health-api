import { Request } from 'express';
import { Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface IJob extends Document {
  title: string;
  description: string;
  location: string;
  salary: number;
  status: 'open' | 'in-progress' | 'completed';
  assignedTo?: string;
  createdBy: string;
  createdAt: Date;
}

export interface ITask extends Document {
  jobId: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
  completedAt?: Date;
  createdAt: Date;
}

export interface IEarnings extends Document {
  userId: string;
  jobId: string;
  amount: number;
  status: 'pending' | 'paid';
  paidAt?: Date;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  userId?: string;
  user?: IUser;
}

export interface JwtPayload {
  userId: string;
  role?: string;
}
