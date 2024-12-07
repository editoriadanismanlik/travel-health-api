import mongoose, { Schema, Document } from 'mongoose';

export interface ITravelPlan extends Document {
  userId: mongoose.Types.ObjectId;
  destination: string;
  startDate: Date;
  endDate: Date;
  requiredVaccinations: string[];
  healthRecommendations: string[];
  localHealthFacilities: [{
    name: string;
    address: string;
    phone: string;
    type: string;
  }];
  status: 'planned' | 'active' | 'completed';
  createdAt: Date;
}

const TravelPlanSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  requiredVaccinations: [{ type: String }],
  healthRecommendations: [{ type: String }],
  localHealthFacilities: [{
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String },
    type: { type: String }
  }],
  status: { 
    type: String, 
    enum: ['planned', 'active', 'completed'],
    default: 'planned'
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITravelPlan>('TravelPlan', TravelPlanSchema); 