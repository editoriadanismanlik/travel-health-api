import { useQuery } from '@tanstack/react-query';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Work,
  Assignment,
  AttachMoney,
  CheckCircle,
} from '@mui/icons-material';
import { StatCard } from '../../components/StatCard';
import axios from 'axios';

interface DashboardStats {
  totalJobs: number;
  activeTasks: number;
  totalEarnings: number;
  completedTasks: number;
}

interface RecentActivity {
  _id: string;
  type: 'job' | 'task' | 'earning';
  title: string;
  date: string;
  status: string;
}

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>(
    ['dashboardStats'],
    async () => {
      const response = await axios.get('/api/dashboard/stats');
      return response.data;
    }
  );

  const { data: recentActivity, isLoading: activityLoading } = useQuery<RecentActivity[]>(
    ['recentActivity'],
    async () => {
      const response = await axios.get('/api/dashboard/recent-activity');
      return response.data;
    }
  );

  if (statsLoading || activityLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="500">
        Dashboard
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Jobs"
            value={stats?.totalJobs || 0}
            icon={<Work />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Tasks"
            value={stats?.activeTasks || 0}
            icon={<Assignment />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Earnings"
            value={`$${stats?.totalEarnings?.toFixed(2) || '0.00'}`}
            icon={<AttachMoney />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed Tasks"
            value={stats?.completedTasks || 0}
            icon={<CheckCircle />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <List>
          {recentActivity?.map((activity, index) => (
            <Box key={activity._id}>
              <ListItem>
                <ListItemText
                  primary={activity.title}
                  secondary={`${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} - ${
                    activity.status
                  } - ${new Date(activity.date).toLocaleDateString()}`}
                />
              </ListItem>
              {index < (recentActivity?.length || 0) - 1 && <Divider />}
            </Box>
          ))}
          {(!recentActivity || recentActivity.length === 0) && (
            <ListItem>
              <ListItemText primary="No recent activity" />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default Dashboard;
