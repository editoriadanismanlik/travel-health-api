import { Chip, ChipProps } from '@mui/material';
import {
  RadioButtonUnchecked,
  Schedule,
  CheckCircle,
} from '@mui/icons-material';

type TaskStatus = 'pending' | 'in-progress' | 'completed';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  size?: ChipProps['size'];
}

export const TaskStatusBadge = ({ status, size = 'small' }: TaskStatusBadgeProps) => {
  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return {
          icon: <RadioButtonUnchecked fontSize="small" />,
          color: 'default' as const,
          label: 'Pending'
        };
      case 'in-progress':
        return {
          icon: <Schedule fontSize="small" />,
          color: 'warning' as const,
          label: 'In Progress'
        };
      case 'completed':
        return {
          icon: <CheckCircle fontSize="small" />,
          color: 'success' as const,
          label: 'Completed'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      size={size}
      sx={{ fontWeight: 500 }}
    />
  );
};
