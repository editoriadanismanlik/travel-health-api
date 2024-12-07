import React from 'react';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { BriefcaseIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import api from '@/config/api';
import { Job } from '@/types';
import Button from '../shared/Button';

const JobList: React.FC = () => {
  const { data: jobs, isLoading } = useQuery('jobs', async () => {
    const response = await api.get('/jobs');
    return response.data;
  });

  if (isLoading) {
    return <div>Loading jobs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Available Jobs</h2>
        <Link to="/jobs/create">
          <Button variant="primary">Create New Job</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs?.map((job: Job) => (
          <div
            key={job._id}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <BriefcaseIcon className="h-5 w-5 text-gray-500" />
                <h3 className="ml-2 text-lg font-medium">{job.title}</h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                job.status === 'active' ? 'bg-green-100 text-green-800' :
                job.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {job.status}
              </span>
            </div>

            <p className="mt-2 text-gray-600 line-clamp-2">{job.description}</p>

            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span>
                  {format(new Date(job.startDate), 'MMM d, yyyy')} - 
                  {format(new Date(job.endDate), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPinIcon className="h-4 w-4 mr-2" />
                <span>{job.location}</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Link to={`/jobs/${job._id}`}>
                <Button variant="secondary" size="sm">View Details</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobList; 