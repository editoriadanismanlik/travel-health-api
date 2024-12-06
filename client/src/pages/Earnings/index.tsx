import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Divider,
  Button,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  Assignment,
  Download as DownloadIcon,
  CalendarToday,
} from '@mui/icons-material';
import { StatCard } from '../../components/StatCard';
import { EarningsChart } from '../../components/EarningsChart';
import axios from 'axios';

interface Earning {
  _id: string;
  jobId: string;
  amount: number;
  date: string;
  status: 'pending' | 'paid';
  job: {
    title: string;
  };
  description: string;
}

interface EarningsSummary {
  totalEarnings: number;
  monthlyEarnings: number;
  pendingPayments: number;
  completedJobs: number;
}

interface ChartData {
  daily: { date: string; amount: number }[];
  monthly: { date: string; amount: number }[];
  yearly: { date: string; amount: number }[];
}

const Earnings = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [timeRange, setTimeRange] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [chartView, setChartView] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  const { data: earnings, isLoading: earningsLoading } = useQuery<Earning[]>(
    ['earnings'],
    async () => {
      const response = await axios.get('/api/earnings');
      return response.data;
    }
  );

  const { data: summary, isLoading: summaryLoading } = useQuery<EarningsSummary>(
    ['earnings-summary'],
    async () => {
      const response = await axios.get('/api/earnings/summary');
      return response.data;
    }
  );

  const { data: chartData, isLoading: chartLoading } = useQuery<ChartData>(
    ['earnings-chart', timeRange],
    async () => {
      const response = await axios.get(`/api/earnings/chart?timeRange=${timeRange}`);
      return response.data;
    }
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportData = async () => {
    try {
      const response = await axios.get('/api/earnings/export', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'earnings-report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (earningsLoading || summaryLoading || chartLoading) {
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
          Earnings
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportData}
        >
          Export Report
        </Button>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Earnings"
            value={`$${summary?.totalEarnings.toFixed(2)}`}
            icon={<AttachMoney />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Earnings"
            value={`$${summary?.monthlyEarnings.toFixed(2)}`}
            icon={<TrendingUp />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Payments"
            value={`$${summary?.pendingPayments.toFixed(2)}`}
            icon={<CalendarToday />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed Jobs"
            value={summary?.completedJobs}
            icon={<Assignment />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Earnings Overview</Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>View</InputLabel>
            <Select
              value={chartView}
              label="View"
              onChange={(e) => setChartView(e.target.value as any)}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <EarningsChart
          data={chartData?.[chartView] || []}
          title=""
        />
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Job</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {earnings
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((earning) => (
                  <TableRow key={earning._id}>
                    <TableCell>
                      {new Date(earning.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{earning.job.title}</TableCell>
                    <TableCell>{earning.description}</TableCell>
                    <TableCell>${earning.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            earning.status === 'paid'
                              ? 'success.main'
                              : 'warning.main',
                        }}
                      >
                        {earning.status.charAt(0).toUpperCase() +
                          earning.status.slice(1)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={earnings?.length || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default Earnings;
