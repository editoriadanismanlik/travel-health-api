import { Payment, User, Job, Task, Notification } from '../models';
import { IPayment } from '../models';
import { WebSocketService } from './WebSocketService';

export class PaymentService {
  private wsService: WebSocketService;

  constructor(wsService: WebSocketService) {
    this.wsService = wsService;
  }

  async processPayment(paymentData: Partial<IPayment>): Promise<IPayment> {
    try {
      // Validate ambassador and job existence
      const ambassador = await User.findById(paymentData.ambassadorId);
      const job = await Job.findById(paymentData.jobId);

      if (!ambassador || !job) {
        throw new Error('Invalid ambassador or job reference');
      }

      // Calculate payment breakdown
      const breakdown = await this.calculatePaymentBreakdown(paymentData);

      // Create payment record
      const payment = new Payment({
        ...paymentData,
        breakdown,
        status: 'processing',
        updatedAt: new Date()
      });

      await payment.save();

      // Process payment through payment provider
      await this.processPaymentWithProvider(payment);

      // Update payment status
      payment.status = 'completed';
      payment.processedAt = new Date();
      await payment.save();

      // Create notification
      await this.createPaymentNotification(payment);

      // Emit real-time update
      this.wsService.emitToUser(payment.ambassadorId.toString(), 'payment_update', {
        type: 'payment_processed',
        paymentId: payment._id
      });

      return payment;
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  private async calculatePaymentBreakdown(paymentData: Partial<IPayment>) {
    const baseAmount = paymentData.amount || 0;
    const bonus = await this.calculateBonus(paymentData);
    const tax = this.calculateTax(baseAmount);
    const fees = this.calculateFees(baseAmount);

    return {
      baseAmount,
      bonus,
      tax,
      fees
    };
  }

  private async calculateBonus(paymentData: Partial<IPayment>): Promise<number> {
    // Implement bonus calculation logic
    return 0;
  }

  private calculateTax(amount: number): number {
    // Implement tax calculation logic
    return amount * 0.1; // Example: 10% tax
  }

  private calculateFees(amount: number): number {
    // Implement processing fees calculation
    return amount * 0.03; // Example: 3% processing fee
  }

  private async processPaymentWithProvider(payment: IPayment): Promise<void> {
    // Implement actual payment processing logic with your payment provider
    // This is where you'd integrate with Stripe, PayPal, etc.
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
  }

  private async createPaymentNotification(payment: IPayment): Promise<void> {
    await Notification.create({
      recipient: payment.ambassadorId,
      type: 'payment',
      title: 'Payment Processed',
      message: `Payment of ${payment.amount} ${payment.currency} has been processed`,
      priority: 'high',
      reference: {
        type: 'payment',
        id: payment._id
      }
    });
  }
} 