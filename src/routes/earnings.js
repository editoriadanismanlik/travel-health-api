const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Temporary earnings data store (replace with MongoDB model later)
let earnings = [];

// @route   GET api/earnings
// @desc    Get all earnings
router.get('/', auth, async (req, res) => {
  try {
    res.json(earnings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/earnings
// @desc    Create an earning record
router.post('/', auth, async (req, res) => {
  try {
    const earning = {
      id: Date.now().toString(),
      amount: req.body.amount,
      description: req.body.description,
      category: req.body.category,
      date: req.body.date || new Date(),
      userId: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    earnings.push(earning);
    res.json(earning);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/earnings/summary
// @desc    Get earnings summary
router.get('/summary', auth, async (req, res) => {
  try {
    const userEarnings = earnings.filter(e => e.userId === req.user.id);
    const total = userEarnings.reduce((sum, e) => sum + e.amount, 0);
    
    // Group by category
    const byCategory = userEarnings.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    res.json({
      total,
      byCategory,
      count: userEarnings.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
