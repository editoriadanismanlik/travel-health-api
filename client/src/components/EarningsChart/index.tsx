import { useTheme } from '@mui/material/styles';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography } from '@mui/material';

interface EarningsData {
  date: string;
  amount: number;
}

interface EarningsChartProps {
  data: EarningsData[];
  title: string;
}

export const EarningsChart = ({ data, title }: EarningsChartProps) => {
  const theme = useTheme();

  const formatYAxis = (value: number) => `$${value}`;
  
  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            stroke={theme.palette.text.secondary}
            style={theme.typography.body2}
          />
          <YAxis
            tickFormatter={formatYAxis}
            stroke={theme.palette.text.secondary}
            style={theme.typography.body2}
          />
          <Tooltip
            formatter={(value: number) => [`$${value}`, 'Earnings']}
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke={theme.palette.primary.main}
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};
