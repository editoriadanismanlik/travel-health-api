import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'ambassador';
  mfaEnabled: boolean;
  mfaSecret?: string;
  backupCodes: string[];
  profileImage?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: Date;
  createdAt: Date;
}

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'ambassador'], 
    required: true 
  },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String },
  backupCodes: [{ type: String }],
  profileImage: { type: String },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended'], 
    default: 'active' 
  },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema); 