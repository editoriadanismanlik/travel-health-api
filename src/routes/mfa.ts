import { Router } from 'express';
import { auth } from '../middleware/auth';
import { MFAService } from '../services/mfa';
import User from '../models/User';

const router = Router();

// Setup MFA
router.post('/setup', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.mfa.enabled) {
      return res.status(400).json({ message: 'MFA is already enabled' });
    }

    const { secret, qrCode, backupCodes } = await MFAService.setupMFA(
      user._id.toString(),
      user.email
    );

    // Store secret temporarily (should be verified before enabling)
    user.mfa.secret = secret;
    user.mfa.backupCodes = backupCodes;
    await user.save();

    res.json({ qrCode, backupCodes: backupCodes.map(bc => bc.code) });
  } catch (error) {
    console.error('MFA Setup Error:', error);
    res.status(500).json({ message: 'Error setting up MFA' });
  }
});

// Verify and enable MFA
router.post('/verify', auth, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user || !user.mfa.secret) {
      return res.status(400).json({ message: 'Invalid setup state' });
    }

    const isValid = MFAService.verifyToken(token, user.mfa.secret);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    user.mfa.enabled = true;
    await user.save();

    res.json({ message: 'MFA enabled successfully' });
  } catch (error) {
    console.error('MFA Verification Error:', error);
    res.status(500).json({ message: 'Error verifying MFA' });
  }
});

// Verify MFA during login
router.post('/validate', async (req, res) => {
  try {
    const { userId, token, isBackupCode = false } = req.body;
    const user = await User.findById(userId);

    if (!user || !user.mfa.enabled) {
      return res.status(400).json({ message: 'Invalid state' });
    }

    let isValid = false;
    if (isBackupCode) {
      const backupCode = MFAService.verifyBackupCode(token, user.mfa.backupCodes);
      if (backupCode) {
        backupCode.used = true;
        isValid = true;
      }
    } else {
      isValid = MFAService.verifyToken(token, user.mfa.secret);
    }

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    if (isBackupCode) {
      await user.save(); // Save the used backup code status
    }

    res.json({ message: 'MFA validation successful' });
  } catch (error) {
    console.error('MFA Validation Error:', error);
    res.status(500).json({ message: 'Error validating MFA' });
  }
});

// Disable MFA
router.post('/disable', auth, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user || !user.mfa.enabled) {
      return res.status(400).json({ message: 'MFA is not enabled' });
    }

    const isValid = MFAService.verifyToken(token, user.mfa.secret);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    user.mfa = {
      enabled: false,
      secret: null,
      backupCodes: []
    };
    await user.save();

    res.json({ message: 'MFA disabled successfully' });
  } catch (error) {
    console.error('MFA Disable Error:', error);
    res.status(500).json({ message: 'Error disabling MFA' });
  }
});

// Generate new backup codes
router.post('/backup-codes', auth, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user || !user.mfa.enabled) {
      return res.status(400).json({ message: 'MFA is not enabled' });
    }

    const isValid = MFAService.verifyToken(token, user.mfa.secret);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const backupCodes = MFAService.generateRecoveryCodes().map(code => ({
      code,
      used: false
    }));

    user.mfa.backupCodes = backupCodes;
    await user.save();

    res.json({ backupCodes: backupCodes.map(bc => bc.code) });
  } catch (error) {
    console.error('Backup Codes Generation Error:', error);
    res.status(500).json({ message: 'Error generating backup codes' });
  }
});

export default router;
