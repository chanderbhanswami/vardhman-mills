'use client';

import { useSession, signOut } from 'next-auth/react';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Header() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Notifications"
            aria-label="Notifications"
          >
            <BellIcon className="h-6 w-6" />
          </button>
          
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <UserCircleIcon className="h-8 w-8" />
              <span className="text-sm font-medium">
                {session?.user?.name || 'Admin User'}
              </span>
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <p className="font-medium">{session?.user?.name || 'Admin User'}</p>
                  <p className="text-gray-500">{session?.user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    signOut({ callbackUrl: '/login' });
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}