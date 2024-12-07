import React from 'react';
import { format } from 'date-fns';
import { Task } from '@/types';
import { 
  CalendarIcon, 
  CheckCircleIcon,
  ClockIcon,
  UserCircleIcon 
} from '@heroicons/react/24/outline';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, status: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange }) => {
  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <h4 className="text-lg font-medium">{task.title}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      <p className="mt-2 text-gray-600 text-sm line-clamp-2">{task.description}</p>

      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm text-gray-500">
          <CalendarIcon className="h-4 w-4 mr-2" />
          <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
        </div>

        <div className="flex items-center text-sm text-gray-500">
          <ClockIcon className="h-4 w-4 mr-2" />
          <span>Est. Time: {task.estimatedHours}h</span>
        </div>

        <div className="flex items-center text-sm text-gray-500">
          <UserCircleIcon className="h-4 w-4 mr-2" />
          <span>{task.assignedTo?.name || 'Unassigned'}</span>
        </div>
      </div>

      {task.completionStatus && (
        <div className="mt-3 flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
          <span className="ml-2 text-sm text-green-600">
            {task.completionStatus}% Complete
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskCard; 