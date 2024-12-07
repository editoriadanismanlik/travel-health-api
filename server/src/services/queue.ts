import Bull from 'bull';
import { logger } from '../utils/logger';

interface JobData {
  type: string;
  payload: any;
}

export class QueueService {
  private static instance: QueueService;
  private queues: Map<string, Bull.Queue>;

  private constructor() {
    this.queues = new Map();
    this.initializeQueues();
  }

  static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  private initializeQueues() {
    // Initialize different queues for different job types
    this.createQueue('email', this.processEmailJob);
    this.createQueue('analytics', this.processAnalyticsJob);
    this.createQueue('notification', this.processNotificationJob);
  }

  private createQueue(name: string, processor: Bull.ProcessCallbackFunction<any>) {
    const queue = new Bull(name, {
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });

    queue.process(processor);
    queue.on('failed', this.handleFailedJob);
    
    this.queues.set(name, queue);
  }

  private async processEmailJob(job: Bull.Job<JobData>) {
    // Implement email processing logic
    logger.info(`Processing email job ${job.id}`);
  }

  private async processAnalyticsJob(job: Bull.Job<JobData>) {
    // Implement analytics processing logic
    logger.info(`Processing analytics job ${job.id}`);
  }

  private async processNotificationJob(job: Bull.Job<JobData>) {
    // Implement notification processing logic
    logger.info(`Processing notification job ${job.id}`);
  }

  private handleFailedJob(job: Bull.Job, err: Error) {
    logger.error(`Job ${job.id} failed:`, err);
    // Implement failure handling logic (retry, alert, etc.)
  }

  public async addJob(queueName: string, data: JobData, options?: Bull.JobOptions) {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    return await queue.add(data, options);
  }
} 