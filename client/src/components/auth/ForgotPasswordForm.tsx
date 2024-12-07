import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '../shared/Button';
import { toast } from 'react-toastify';
import api from '@/config/api';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await api.post('/auth/forgot-password', data);
      toast.success('Password reset instructions have been sent to your email');
    } catch (error) {
      toast.error('Failed to process password reset request');
      console.error('Password reset request failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        isLoading={isSubmitting}
        className="w-full"
      >
        Reset Password
      </Button>
    </form>
  );
};

export default ForgotPasswordForm; 