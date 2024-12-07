import { Router } from 'express';
import { PaymentService } from '../../services/PaymentService';
import { authenticateToken } from '../../middleware/auth';
import { validatePayment } from '../../middleware/validation';
import { Payment } from '../../models';

const router = Router();
const paymentService = new PaymentService(global.wsService);

// Get all payments for an ambassador
router.get('/ambassador/:ambassadorId', authenticateToken, async (req, res) => {
  try {
    const payments = await Payment.find({ ambassadorId: req.params.ambassadorId })
      .sort({ createdAt: -1 })
      .populate('jobId', 'title');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Process new payment
router.post('/', authenticateToken, validatePayment, async (req, res) => {
  try {
    const payment = await paymentService.processPayment(req.body);
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Get payment details
router.get('/:paymentId', authenticateToken, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('ambassadorId', 'name email')
      .populate('jobId', 'title');
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment details' });
  }
});

export default router; 