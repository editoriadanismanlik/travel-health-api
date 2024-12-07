import mongoose, { Schema, Document } from 'mongoose';

export interface IHealthRecord extends Document {
  userId: mongoose.Types.ObjectId;
  conditions: string[];
  medications: string[];
  allergies: string[];
  bloodType: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  lastUpdated: Date;
}

const HealthRecordSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  conditions: [{ type: String }],
  medications: [{ type: String }],
  allergies: [{ type: String }],
  bloodType: { type: String },
  emergencyContact: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relationship: { type: String, required: true }
  },
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model<IHealthRecord>('HealthRecord', HealthRecordSchema); 