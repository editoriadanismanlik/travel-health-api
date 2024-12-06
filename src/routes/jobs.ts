import express from 'express';
import { auth } from '../middleware/auth';
import Job from '../models/Job';

const router = express.Router();

// Get all jobs
router.get('/', auth, async (req, res) => {
  try {
    const jobs = await Job.find().populate('createdBy', 'username');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new job
router.post('/', auth, async (req: any, res) => {
  try {
    const { title, description, location, salary } = req.body;
    const job = new Job({
      title,
      description,
      location,
      salary,
      createdBy: req.userId
    });
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update job status
router.patch('/:id', auth, async (req: any, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    job.status = status;
    await job.save();
    
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
