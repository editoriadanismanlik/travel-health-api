import React, { useEffect, useState } from 'react';
import { Card, Chart, Stats } from '@/components/dashboard';
import { useAuth } from '@/hooks/useAuth';
import api from '@/config/api';

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  completedTasks: number;
  earnings: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/analytics/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome back, {user?.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stats
          title="Total Jobs"
          value={stats?.totalJobs || 0}
          icon="briefcase"
        />
        <Stats
          title="Active Jobs"
          value={stats?.activeJobs || 0}
          icon="clock"
          trend="up"
        />
        <Stats
          title="Completed Tasks"
          value={stats?.completedTasks || 0}
          icon="check-circle"
        />
        <Stats
          title="Total Earnings"
          value={stats?.earnings || 0}
          icon="dollar-sign"
          isCurrency
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Activity">
          {/* Add activity feed component */}
        </Card>
        <Card title="Performance">
          <Chart />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 