import { Router } from 'express';
import { auth } from '../middleware/auth';
import User from '../models/User';

const router = Router();

// Save widget preferences
router.post('/widgets', auth, async (req, res) => {
  try {
    const { widgets } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.preferences = user.preferences || {};
    user.preferences.widgets = widgets;
    await user.save();

    res.json({ message: 'Widget preferences saved successfully' });
  } catch (error) {
    console.error('Save Widget Preferences Error:', error);
    res.status(500).json({ message: 'Error saving widget preferences' });
  }
});

// Get widget preferences
router.get('/widgets/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure user can only access their own preferences
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const widgets = user.preferences?.widgets || [];
    res.json({ widgets });
  } catch (error) {
    console.error('Get Widget Preferences Error:', error);
    res.status(500).json({ message: 'Error retrieving widget preferences' });
  }
});

export default router;
