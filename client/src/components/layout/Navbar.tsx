import React from 'react';
import { Link } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import NotificationDropdown from '../notifications/NotificationDropdown';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = React.useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto"
                src="/logo.svg"
                alt="Travel Health"
              />
            </div>
          </div>

          <div className="flex items-center">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full text-gray-400 hover:text-gray-500"
            >
              <BellIcon className="h-6 w-6" />
            </button>

            <div className="ml-3 relative">
              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src={user?.avatar || '/default-avatar.png'}
                  alt={user?.name}
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </div>
            </div>

            {showNotifications && <NotificationDropdown />}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 