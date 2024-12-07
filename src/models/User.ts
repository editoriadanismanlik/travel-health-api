import mongoose from 'mongoose';
import { WidgetOption } from '../types/widget';
import { IUser } from '../types';

interface IUser extends mongoose.Document {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  mfaEnabled: boolean;
  mfaSecret?: string;
  backupCodes?: Array<{
    code: string;
    used: boolean;
  }>;
  preferences?: {
    widgets?: any[];
    theme?: string;
    notifications?: {
      email: boolean;
      push: boolean;
    };
  };
}

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaSecret: {
    type: String
  },
  backupCodes: [{
    code: String,
    used: {
      type: Boolean,
      default: false
    }
  }],
  preferences: {
    widgets: [{
      type: mongoose.Schema.Types.Mixed
    }],
    theme: {
      type: String,
      default: 'light'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
