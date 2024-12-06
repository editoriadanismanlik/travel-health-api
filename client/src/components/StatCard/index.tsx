import { Paper, Box, Typography, SvgIconProps } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement<SvgIconProps>;
  color: string;
}

export const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          p: 2,
          color: color,
          opacity: 0.2,
          transform: 'scale(1.5)',
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div" fontWeight="bold">
          {value}
        </Typography>
      </Box>
    </Paper>
  );
};
