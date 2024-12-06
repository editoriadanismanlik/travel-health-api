import mongoose from 'mongoose';
import { WidgetOption } from '../types/widget';

interface IUser extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  lastActive: Date;
  mfa: {
    enabled: boolean;
    secret?: string;
    backupCodes?: Array<{
      code: string;
      used: boolean;
    }>;
  };
  preferences?: {
    widgets?: WidgetOption[];
    [key: string]: any;
  };
}

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  mfa: {
    enabled: {
      type: Boolean,
      default: false,
    },
    secret: String,
    backupCodes: [{
      code: String,
      used: {
        type: Boolean,
        default: false,
      },
    }],
  },
  preferences: {
    widgets: [{
      id: String,
      type: {
        type: String,
        enum: ['bar', 'line', 'pie'],
      },
      title: String,
      enabled: Boolean,
      order: Number,
    }],
  },
}, {
  timestamps: true,
});

export default mongoose.model<IUser>('User', UserSchema);
