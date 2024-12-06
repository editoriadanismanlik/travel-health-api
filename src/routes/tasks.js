const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Temporary task data store (replace with MongoDB model later)
let tasks = [];

// @route   GET api/tasks
// @desc    Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/tasks
// @desc    Create a task
router.post('/', auth, async (req, res) => {
  try {
    const task = {
      id: Date.now().toString(),
      title: req.body.title,
      description: req.body.description,
      status: req.body.status || 'pending',
      assignedTo: req.body.assignedTo,
      createdBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    tasks.push(task);
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/tasks/:id
// @desc    Update a task
router.put('/:id', auth, async (req, res) => {
  try {
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);
    if (taskIndex === -1) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...req.body,
      updatedAt: new Date()
    };

    res.json(tasks[taskIndex]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/tasks/:id
// @desc    Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);
    if (taskIndex === -1) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    tasks = tasks.filter(t => t.id !== req.params.id);
    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
