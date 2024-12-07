import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  period: {
    startDate: Date;
    endDate: Date;
  };
  jobMetrics: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    successRate: number;
  };
  taskMetrics: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
    averageCompletionTime: number; // in hours
  };
  ambassadorMetrics: {
    totalActive: number;
    topPerformers: [{
      ambassadorId: mongoose.Types.ObjectId;
      tasksCompleted: number;
      averageRating: number;
      earnings: number;
    }];
    performance: {
      averageTasksPerAmbassador: number;
      averageResponseTime: number; // in hours
      averageRating: number;
    };
  };
  financialMetrics: {
    totalEarnings: number;
    averageEarningsPerJob: number;
    averageEarningsPerAmbassador: number;
    paymentStatus: {
      pending: number;
      paid: number;
      failed: number;
    };
  };
  regionalMetrics: [{
    region: string;
    activeJobs: number;
  }];
} 