import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Stack,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { ProfileAvatar } from '../../components/ProfileAvatar';
import axios from 'axios';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: string;
  location: string;
  bio: string;
}

interface ProfileFormInputs {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
}

interface PasswordFormInputs {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile = () => {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const queryClient = useQueryClient();

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormInputs>();

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
    watch,
  } = useForm<PasswordFormInputs>();

  const { data: profile, isLoading } = useQuery<UserProfile>(
    ['profile'],
    async () => {
      const response = await axios.get('/api/profile');
      return response.data;
    },
    {
      onSuccess: (data) => {
        resetProfile({
          name: data.name,
          email: data.email,
          phone: data.phone,
          location: data.location,
          bio: data.bio,
        });
      },
    }
  );

  const updateProfileMutation = useMutation(
    (data: ProfileFormInputs) => axios.put('/api/profile', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['profile']);
      },
    }
  );

  const updatePasswordMutation = useMutation(
    (data: PasswordFormInputs) => axios.put('/api/profile/password', data),
    {
      onSuccess: () => {
        setPasswordDialogOpen(false);
        resetPassword();
      },
    }
  );

  const updateAvatarMutation = useMutation(
    async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      await axios.put('/api/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['profile']);
      },
    }
  );

  const onProfileSubmit = (data: ProfileFormInputs) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormInputs) => {
    updatePasswordMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="500">
        Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box mb={3}>
              <ProfileAvatar
                src={profile?.avatar}
                name={profile?.name || ''}
                size={120}
                onImageUpdate={(file) => updateAvatarMutation.mutateAsync(file)}
              />
            </Box>
            <Typography variant="h6" gutterBottom>
              {profile?.name}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {profile?.role}
            </Typography>
            <Button
              startIcon={<LockIcon />}
              onClick={() => setPasswordDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              Change Password
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="name"
                    control={profileControl}
                    rules={{ required: 'Name is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Name"
                        error={!!profileErrors.name}
                        helperText={profileErrors.name?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="email"
                    control={profileControl}
                    rules={{
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email"
                        error={!!profileErrors.email}
                        helperText={profileErrors.email?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="phone"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Phone"
                        error={!!profileErrors.phone}
                        helperText={profileErrors.phone?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="location"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Location"
                        error={!!profileErrors.location}
                        helperText={profileErrors.location?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="bio"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={4}
                        label="Bio"
                        error={!!profileErrors.bio}
                        helperText={profileErrors.bio?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="flex-end" mt={3}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={updateProfileMutation.isLoading}
                >
                  {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>

              {updateProfileMutation.isSuccess && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Profile updated successfully!
                </Alert>
              )}
            </form>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
          <DialogContent>
            <Stack spacing={3}>
              <Controller
                name="currentPassword"
                control={passwordControl}
                rules={{ required: 'Current password is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showCurrentPassword ? 'text' : 'password'}
                    label="Current Password"
                    error={!!passwordErrors.currentPassword}
                    helperText={passwordErrors.currentPassword?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge="end"
                          >
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              <Controller
                name="newPassword"
                control={passwordControl}
                rules={{
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showNewPassword ? 'text' : 'password'}
                    label="New Password"
                    error={!!passwordErrors.newPassword}
                    helperText={passwordErrors.newPassword?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              <Controller
                name="confirmPassword"
                control={passwordControl}
                rules={{
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === watch('newPassword') || 'Passwords do not match',
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    error={!!passwordErrors.confirmPassword}
                    helperText={passwordErrors.confirmPassword?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Stack>

            {updatePasswordMutation.isError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Failed to update password. Please try again.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={updatePasswordMutation.isLoading}
            >
              {updatePasswordMutation.isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Profile;
