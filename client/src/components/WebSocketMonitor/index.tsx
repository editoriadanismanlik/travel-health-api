import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { Line } from 'recharts';
import { AnalyticsWidget } from '../AnalyticsWidget';
import { WebSocketService } from '../../services/WebSocketService';

interface ConnectionStats {
  totalConnections: number;
  activeConnections: number;
  messageQueueSize: number;
  reconnectionAttempts: number;
  latency: number;
  uptime: number;
}

interface ConnectionEvent {
  timestamp: Date;
  type: 'connect' | 'disconnect' | 'error' | 'reconnect';
  details: string;
}

export const WebSocketMonitor: React.FC = () => {
  const [stats, setStats] = useState<ConnectionStats>({
    totalConnections: 0,
    activeConnections: 0,
    messageQueueSize: 0,
    reconnectionAttempts: 0,
    latency: 0,
    uptime: 0,
  });
  const [events, setEvents] = useState<ConnectionEvent[]>([]);
  const [latencyHistory, setLatencyHistory] = useState<{ time: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const wsService = WebSocketService.getInstance();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/ws/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch WebSocket stats:', error);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/ws/events');
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Failed to fetch WebSocket events:', error);
      }
    };

    const measureLatency = () => {
      const start = Date.now();
      wsService.emit('ping', {});
      
      const handlePong = () => {
        const latency = Date.now() - start;
        setStats(prev => ({ ...prev, latency }));
        setLatencyHistory(prev => [
          ...prev.slice(-19),
          { time: new Date().toLocaleTimeString(), value: latency }
        ]);
      };

      wsService.on('pong', handlePong);
      return () => wsService.off('pong', handlePong);
    };

    const intervalId = setInterval(() => {
      fetchStats();
      fetchEvents();
      measureLatency();
    }, 5000);

    fetchStats();
    fetchEvents();
    measureLatency();
    setIsLoading(false);

    return () => clearInterval(intervalId);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/ws/stats').then(res => res.json()),
      fetch('/api/ws/events').then(res => res.json())
    ]).then(([statsData, eventsData]) => {
      setStats(statsData);
      setEvents(eventsData);
      setIsLoading(false);
    });
  };

  if (isLoading) {
    return <LinearProgress />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">WebSocket Monitor</Typography>
        <IconButton onClick={handleRefresh}>
          <RefreshIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Connections
              </Typography>
              <Typography variant="h4">
                {stats.activeConnections}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Message Queue
              </Typography>
              <Typography variant="h4">
                {stats.messageQueueSize}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Current Latency
              </Typography>
              <Typography variant="h4">
                {stats.latency}ms
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Uptime
              </Typography>
              <Typography variant="h4">
                {Math.floor(stats.uptime / 3600)}h {Math.floor((stats.uptime % 3600) / 60)}m
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Latency Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Latency History
              </Typography>
              <Box height={300}>
                <AnalyticsWidget
                  type="line"
                  title="Latency (ms)"
                  data={latencyHistory}
                  dataKey="value"
                  nameKey="time"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Connection Events */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {new Date(event.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={event.type}
                        color={
                          event.type === 'connect' ? 'success' :
                          event.type === 'disconnect' ? 'error' :
                          event.type === 'reconnect' ? 'warning' : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{event.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};
