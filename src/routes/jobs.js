const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// @route   GET /api/jobs
// @desc    Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/jobs
// @desc    Create a job
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('location', 'Location is required').not().isEmpty(),
      check('budget', 'Budget must be a number').isNumeric(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newJob = new Job({
        ...req.body,
        createdBy: req.user.id,
      });

      const job = await newJob.save();
      res.json(job);
    } catch (err) {
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT /api/jobs/:id
// @desc    Update a job
router.put('/:id', auth, async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    // Make sure user owns job
    if (job.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(job);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    // Make sure user owns job
    if (job.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await job.remove();
    res.json({ msg: 'Job removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
