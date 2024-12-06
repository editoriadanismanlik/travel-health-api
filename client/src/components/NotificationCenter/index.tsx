import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider,
  Button,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Work as WorkIcon,
  Assignment as TaskIcon,
  AttachMoney as EarningIcon,
  Check as CheckIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

interface Notification {
  _id: string;
  type: 'job' | 'task' | 'earning' | 'system';
  title: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>(
    ['notifications'],
    async () => {
      const response = await axios.get('/api/notifications');
      return response.data;
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const markAsReadMutation = useMutation(
    (notificationId: string) =>
      axios.put(`/api/notifications/${notificationId}/read`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications']);
      },
    }
  );

  const markAllAsReadMutation = useMutation(
    () => axios.put('/api/notifications/read-all'),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications']);
      },
    }
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsReadMutation.mutateAsync(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
    handleClose();
  };

  const getIcon = (type: string, severity: string) => {
    switch (type) {
      case 'job':
        return <WorkIcon color="primary" />;
      case 'task':
        return <TaskIcon color="success" />;
      case 'earning':
        return <EarningIcon color="warning" />;
      case 'system':
        switch (severity) {
          case 'success':
            return <CheckIcon color="success" />;
          case 'warning':
            return <WarningIcon color="warning" />;
          case 'error':
            return <ErrorIcon color="error" />;
          default:
            return <InfoIcon color="info" />;
        }
      default:
        return <InfoIcon />;
    }
  };

  const filteredNotifications = notifications.filter(
    (notification) => activeTab === 'all' || !notification.read
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-describedby={id}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 360, maxHeight: 480 },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={() => markAllAsReadMutation.mutate()}>
              Mark all as read
            </Button>
          )}
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All" value="all" />
          <Tab
            label={`Unread (${unreadCount})`}
            value="unread"
            disabled={unreadCount === 0}
          />
        </Tabs>

        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={24} />
          </Box>
        ) : filteredNotifications.length > 0 ? (
          <List sx={{ p: 0 }}>
            {filteredNotifications.map((notification, index) => (
              <Box key={notification._id}>
                {index > 0 && <Divider />}
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  <ListItemIcon>{getIcon(notification.type, notification.severity)}</ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        ) : (
          <Box p={3} textAlign="center">
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        )}
      </Popover>
    </>
  );
};
