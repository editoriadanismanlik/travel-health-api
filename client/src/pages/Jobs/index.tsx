import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import axios from 'axios';

interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  salary: number;
  status: 'open' | 'in-progress' | 'completed';
  createdAt: string;
}

interface JobFormInputs {
  title: string;
  description: string;
  location: string;
  salary: number;
}

const Jobs = () => {
  const [open, setOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobFormInputs>();

  const { data: jobs, isLoading } = useQuery<Job[]>(['jobs'], async () => {
    const response = await axios.get('/api/jobs');
    return response.data;
  });

  const createMutation = useMutation(
    (newJob: JobFormInputs) => axios.post('/api/jobs', newJob),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['jobs']);
        handleClose();
      },
    }
  );

  const updateMutation = useMutation(
    (updatedJob: JobFormInputs & { id: string }) =>
      axios.put(`/api/jobs/${updatedJob.id}`, updatedJob),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['jobs']);
        handleClose();
      },
    }
  );

  const handleOpen = (job?: Job) => {
    if (job) {
      setSelectedJob(job);
      reset({
        title: job.title,
        description: job.description,
        location: job.location,
        salary: job.salary,
      });
    } else {
      setSelectedJob(null);
      reset({
        title: '',
        description: '',
        location: '',
        salary: 0,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedJob(null);
    reset();
  };

  const onSubmit = async (data: JobFormInputs) => {
    if (selectedJob) {
      updateMutation.mutate({ ...data, id: selectedJob._id });
    } else {
      createMutation.mutate(data);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'primary';
      case 'in-progress':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="500">
          Jobs
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          New Job
        </Button>
      </Box>

      <Grid container spacing={3}>
        {jobs?.map((job) => (
          <Grid item xs={12} md={6} lg={4} key={job._id}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="h6" gutterBottom>
                  {job.title}
                </Typography>
                <IconButton size="small" onClick={() => handleOpen(job)}>
                  <EditIcon />
                </IconButton>
              </Box>
              <Typography color="text.secondary" paragraph>
                {job.description}
              </Typography>
              <Box mt="auto">
                <Typography variant="body2" color="text.secondary">
                  Location: {job.location}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Salary: ${job.salary}
                </Typography>
                <Box mt={1}>
                  <Chip
                    label={job.status}
                    color={getStatusColor(job.status)}
                    size="small"
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedJob ? 'Edit Job' : 'New Job'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  {...register('title', { required: 'Title is required' })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  {...register('description', { required: 'Description is required' })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  error={!!errors.location}
                  helperText={errors.location?.message}
                  {...register('location', { required: 'Location is required' })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Salary"
                  type="number"
                  error={!!errors.salary}
                  helperText={errors.salary?.message}
                  {...register('salary', {
                    required: 'Salary is required',
                    min: { value: 0, message: 'Salary must be positive' },
                  })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {createMutation.isLoading || updateMutation.isLoading
                ? 'Saving...'
                : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Jobs;
