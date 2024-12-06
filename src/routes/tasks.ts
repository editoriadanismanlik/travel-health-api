import express from 'express';
import { auth } from '../middleware/auth';
import Task from '../models/Task';
import Job from '../models/Job';

const router = express.Router();

// Get all tasks for a job
router.get('/job/:jobId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ jobId: req.params.jobId })
      .populate('assignedTo', 'username')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's tasks
router.get('/my-tasks', auth, async (req: any, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.userId })
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new task
router.post('/', auth, async (req: any, res) => {
  try {
    const { jobId, title, description, assignedTo } = req.body;
    
    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const task = new Task({
      jobId,
      title,
      description,
      assignedTo,
      status: 'pending'
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task status
router.patch('/:id', auth, async (req: any, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.assignedTo.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    task.status = status;
    if (status === 'completed') {
      task.completedAt = new Date();
    }
    
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
