import express from 'express';
import { auth } from '../middleware/auth';
import Earnings from '../models/Earnings';
import Job from '../models/Job';

const router = express.Router();

// Get user's earnings
router.get('/my-earnings', auth, async (req: any, res) => {
  try {
    const earnings = await Earnings.find({ userId: req.userId })
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });
    
    const total = await Earnings.aggregate([
      { $match: { userId: req.userId, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      earnings,
      totalEarnings: total.length > 0 ? total[0].total : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create earnings record
router.post('/', auth, async (req: any, res) => {
  try {
    const { jobId, amount } = req.body;
    
    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const earnings = new Earnings({
      userId: req.userId,
      jobId,
      amount,
      status: 'pending'
    });

    await earnings.save();
    res.status(201).json(earnings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update earnings status (admin only)
router.patch('/:id', auth, async (req: any, res) => {
  try {
    const { status } = req.body;
    const earnings = await Earnings.findById(req.params.id);
    
    if (!earnings) {
      return res.status(404).json({ message: 'Earnings record not found' });
    }

    earnings.status = status;
    if (status === 'paid') {
      earnings.paidAt = new Date();
    }
    
    await earnings.save();
    res.json(earnings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
