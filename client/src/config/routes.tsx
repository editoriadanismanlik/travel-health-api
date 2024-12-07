import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const Dashboard = lazy(() => import('@/pages/dashboard'));
const Jobs = lazy(() => import('@/pages/jobs'));
const Tasks = lazy(() => import('@/pages/tasks'));
const Profile = lazy(() => import('@/pages/profile'));
const Login = lazy(() => import('@/pages/auth/login'));
const Register = lazy(() => import('@/pages/auth/register'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'jobs/*', element: <Jobs /> },
      { path: 'tasks/*', element: <Tasks /> },
      { path: 'profile', element: <Profile /> },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },
]; 