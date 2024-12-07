import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import api from '@/config/api';
import Button from '../shared/Button';

interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  estimatedHours: number;
  assignedTo?: string;
  jobId: string;
}

interface TaskFormProps {
  jobId: string;
  onSuccess?: () => void;
  initialData?: Partial<TaskFormData>;
}

const TaskForm: React.FC<TaskFormProps> = ({ jobId, onSuccess, initialData }) => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<TaskFormData>({
    defaultValues: {
      ...initialData,
      jobId
    }
  });

  const createTask = useMutation(
    async (data: TaskFormData) => {
      const response = await api.post('/tasks', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks', jobId]);
        toast.success('Task created successfully');
        onSuccess?.();
      },
      onError: () => {
        toast.error('Failed to create task');
      }
    }
  );

  const onSubmit = async (data: TaskFormData) => {
    await createTask.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          {...register('title', { required: 'Title is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          {...register('description', { required: 'Description is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="priority"
            {...register('priority', { required: 'Priority is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            id="dueDate"
            type="date"
            {...register('dueDate', { required: 'Due date is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        isLoading={isSubmitting}
        className="w-full"
      >
        {initialData ? 'Update Task' : 'Create Task'}
      </Button>
    </form>
  );
};

export default TaskForm; 