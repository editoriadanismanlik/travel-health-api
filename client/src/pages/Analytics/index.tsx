import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { useWebSocket } from '../../services/websocket';
import { AnalyticsWidget } from '../../components/AnalyticsWidget';
import { WidgetCustomizer, WidgetOption } from '../../components/WidgetCustomizer';
import { widgetPreferencesService, getDefaultWidgets } from '../../services/widgetPreferences';
import { useAuth } from '../../contexts/AuthContext';

interface AnalyticsData {
  jobStats: {
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    jobsByStatus: { name: string; value: number }[];
    jobsTrend: { date: string; count: number }[];
  };
  taskStats: {
    totalTasks: number;
    pendingTasks: number;
    completedTasks: number;
    tasksByStatus: { name: string; value: number }[];
    tasksTrend: { date: string; count: number }[];
  };
  earningStats: {
    totalEarnings: number;
    monthlyEarnings: number;
    earningsByJob: { name: string; value: number }[];
    earningsTrend: { date: string; amount: number }[];
  };
}

export const Analytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [widgets, setWidgets] = useState<WidgetOption[]>(getDefaultWidgets());
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const { subscribe } = useWebSocket();
  const { user } = useAuth();

  const { data, isLoading } = useQuery<AnalyticsData>(
    ['analytics', timeRange],
    async () => {
      const response = await axios.get(`/api/analytics?timeRange=${timeRange}`);
      return response.data;
    }
  );

  // Load saved widget preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (user?.id) {
        try {
          const savedWidgets = await widgetPreferencesService.loadPreferences(user.id);
          setWidgets(savedWidgets);
        } catch (error) {
          console.error('Failed to load widget preferences:', error);
        }
      }
    };
    loadPreferences();
  }, [user?.id]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribe('analytics', (updatedData) => {
      // Handle real-time analytics updates
      console.log('Real-time analytics update:', updatedData);
    });
    return unsubscribe;
  }, [subscribe]);

  const handleSaveWidgetPreferences = async (updatedWidgets: WidgetOption[]) => {
    if (user?.id) {
      try {
        await widgetPreferencesService.savePreferences(updatedWidgets, user.id);
        setWidgets(updatedWidgets);
      } catch (error) {
        console.error('Failed to save widget preferences:', error);
      }
    }
  };

  if (isLoading || !data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const getWidgetData = (widgetId: string) => {
    switch (widgetId) {
      case 'total-jobs':
        return data.jobStats.jobsByStatus;
      case 'earnings-trend':
        return data.earningStats.earningsTrend;
      case 'task-distribution':
        return data.taskStats.tasksByStatus;
      case 'completion-rate':
        return data.taskStats.tasksTrend;
      case 'revenue-by-region':
        return data.earningStats.earningsByJob;
      case 'top-performers':
        return []; // Add top performers data when available
      default:
        return [];
    }
  };

  const getDataKey = (widgetId: string) => {
    switch (widgetId) {
      case 'earnings-trend':
      case 'revenue-by-region':
        return 'amount';
      case 'completion-rate':
      case 'total-jobs':
        return 'count';
      default:
        return 'value';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="500">
          Analytics Dashboard
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">Last 3 Months</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Customize Dashboard">
            <IconButton onClick={() => setIsCustomizerOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {widgets
          .filter(widget => widget.enabled)
          .sort((a, b) => a.order - b.order)
          .map(widget => (
            <Grid item xs={12} md={6} key={widget.id}>
              <AnalyticsWidget
                type={widget.type}
                title={widget.title}
                data={getWidgetData(widget.id)}
                dataKey={getDataKey(widget.id)}
                height={300}
              />
            </Grid>
          ))}
      </Grid>

      <WidgetCustomizer
        open={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        widgets={widgets}
        onSave={handleSaveWidgetPreferences}
      />
    </Box>
  );
};
