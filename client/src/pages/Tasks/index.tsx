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
  MenuItem,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { TaskStatusBadge } from '../../components/TaskStatusBadge';
import axios from 'axios';

interface Task {
  _id: string;
  jobId: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
  job: {
    title: string;
  };
  createdAt: string;
}

interface Job {
  _id: string;
  title: string;
}

interface TaskFormInputs {
  title: string;
  description: string;
  jobId: string;
  status: 'pending' | 'in-progress' | 'completed';
}

const Tasks = () => {
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tabValue, setTabValue] = useState<'pending' | 'in-progress' | 'completed'>('pending');
  const queryClient = useQueryClient();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormInputs>();

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>(
    ['tasks'],
    async () => {
      const response = await axios.get('/api/tasks');
      return response.data;
    }
  );

  const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>(
    ['jobs'],
    async () => {
      const response = await axios.get('/api/jobs');
      return response.data;
    }
  );

  const createMutation = useMutation(
    (newTask: TaskFormInputs) => axios.post('/api/tasks', newTask),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks']);
        handleClose();
      },
    }
  );

  const updateMutation = useMutation(
    (updatedTask: TaskFormInputs & { id: string }) =>
      axios.put(`/api/tasks/${updatedTask.id}`, updatedTask),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks']);
        handleClose();
      },
    }
  );

  const updateStatusMutation = useMutation(
    ({ id, status }: { id: string; status: string }) =>
      axios.patch(`/api/tasks/${id}`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks']);
      },
    }
  );

  const handleOpen = (task?: Task) => {
    if (task) {
      setSelectedTask(task);
      reset({
        title: task.title,
        description: task.description,
        jobId: task.jobId,
        status: task.status,
      });
    } else {
      setSelectedTask(null);
      reset({
        title: '',
        description: '',
        jobId: '',
        status: 'pending',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTask(null);
    reset();
  };

  const onSubmit = async (data: TaskFormInputs) => {
    if (selectedTask) {
      updateMutation.mutate({ ...data, id: selectedTask._id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleStatusChange = (taskId: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    updateStatusMutation.mutate({ id: taskId, status: newStatus });
  };

  const filteredTasks = tasks?.filter((task) => task.status === tabValue) || [];

  if (tasksLoading || jobsLoading) {
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
          Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          New Task
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Pending" value="pending" />
          <Tab label="In Progress" value="in-progress" />
          <Tab label="Completed" value="completed" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {filteredTasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task._id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6" gutterBottom>
                    {task.title}
                  </Typography>
                  <IconButton size="small" onClick={() => handleOpen(task)}>
                    <EditIcon />
                  </IconButton>
                </Box>
                <Typography color="text.secondary" paragraph>
                  {task.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Job: {task.job.title}
                </Typography>
                <TaskStatusBadge status={task.status} />
              </CardContent>
              <CardActions>
                <FormControl size="small" fullWidth>
                  <InputLabel>Update Status</InputLabel>
                  <Select
                    value={task.status}
                    label="Update Status"
                    onChange={(e) => handleStatusChange(task._id, e.target.value as any)}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedTask ? 'Edit Task' : 'New Task'}</DialogTitle>
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
              <Grid item xs={12}>
                <Controller
                  name="jobId"
                  control={control}
                  rules={{ required: 'Job is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.jobId}>
                      <InputLabel>Job</InputLabel>
                      <Select {...field} label="Job">
                        {jobs?.map((job) => (
                          <MenuItem key={job._id} value={job._id}>
                            {job.title}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              {selectedTask && (
                <Grid item xs={12}>
                  <Controller
                    name="status"
                    control={control}
                    rules={{ required: 'Status is required' }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.status}>
                        <InputLabel>Status</InputLabel>
                        <Select {...field} label="Status">
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="in-progress">In Progress</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
              )}
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

export default Tasks;
