import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

export const MFASetup: React.FC = () => {
  const { token } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const steps = ['Generate QR Code', 'Verify Code', 'Save Backup Codes'];

  const handleSetup = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post('/api/mfa/setup', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setQrCode(response.data.qrCode);
      setBackupCodes(response.data.backupCodes);
      setActiveStep(1);
    } catch (error) {
      setError('Failed to setup MFA. Please try again.');
      console.error('MFA Setup Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      setError('');

      await axios.post('/api/mfa/verify', 
        { token: verificationCode },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      setActiveStep(2);
    } catch (error) {
      setError('Invalid verification code. Please try again.');
      console.error('MFA Verification Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Typography variant="body1" textAlign="center">
              To enable two-factor authentication, click the button below to generate a QR code.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSetup}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate QR Code'}
            </Button>
          </Box>
        );

      case 1:
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
            <Typography variant="body1" textAlign="center">
              1. Install an authenticator app like Google Authenticator or Authy
            </Typography>
            <Box
              component="img"
              src={qrCode}
              alt="QR Code"
              sx={{ width: 200, height: 200 }}
            />
            <Typography variant="body1" textAlign="center">
              2. Scan the QR code with your authenticator app
            </Typography>
            <Typography variant="body1" textAlign="center">
              3. Enter the verification code from your app:
            </Typography>
            <TextField
              label="Verification Code"
              variant="outlined"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              inputProps={{ maxLength: 6 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleVerify}
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify Code'}
            </Button>
          </Box>
        );

      case 2:
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
            <Typography variant="body1" color="error" fontWeight="bold" textAlign="center">
              Save these backup codes in a secure location. 
              You will need them if you lose access to your authenticator app.
            </Typography>
            <Card variant="outlined" sx={{ width: '100%', maxWidth: 400 }}>
              <List dense>
                {backupCodes.map((code, index) => (
                  <React.Fragment key={code}>
                    <ListItem>
                      <ListItemText
                        primary={code}
                        secondary={`Backup Code ${index + 1}`}
                      />
                    </ListItem>
                    {index < backupCodes.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Card>
            <Button
              variant="contained"
              color="success"
              onClick={() => window.location.reload()}
            >
              Complete Setup
            </Button>
          </Box>
        );
    }
  };

  return (
    <Card sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
      <CardHeader 
        title="Setup Two-Factor Authentication" 
        subheader="Enhance your account security"
      />
      <CardContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {renderStep()}
      </CardContent>
    </Card>
  );
};
