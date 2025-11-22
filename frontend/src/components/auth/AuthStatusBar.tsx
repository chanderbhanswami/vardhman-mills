"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Shield,
  Clock,
  AlertTriangle,
  LogOut,
  Settings,
  Bell,
  Activity,
  Lock,
  Smartphone
} from 'lucide-react';
import { SecurityAlert } from '@/types/auth.types';
import { AuthSession, User as AuthUser } from '@/types/user.types';
import Link from 'next/link';

interface AuthStatusBarProps {
  user?: AuthUser;
  session?: AuthSession;
  onLogout?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  position?: 'top' | 'bottom';
  variant?: 'compact' | 'full' | 'minimal';
  showNotifications?: boolean;
  showSessionInfo?: boolean;
  className?: string;
}

interface StatusBarState {
  isOpen: boolean;
  notifications: SecurityAlert[];
  unreadCount: number;
  sessionStatus: 'active' | 'expiring' | 'expired';
  timeUntilExpiry: number;
  showSessionDetails: boolean;
  showNotificationPanel: boolean;
}

const AuthStatusBar: React.FC<AuthStatusBarProps> = ({
  user,
  session,
  onLogout,
  onProfileClick,
  onSettingsClick,
  position = 'top',
  variant = 'full',
  showNotifications = true,
  showSessionInfo = true,
  className = ""
}) => {
  const [state, setState] = useState<StatusBarState>({
    isOpen: false,
    notifications: [],
    unreadCount: 0,
    sessionStatus: 'active',
    timeUntilExpiry: 0,
    showSessionDetails: false,
    showNotificationPanel: false
  });

  // Calculate session status and time until expiry
  const updateSessionStatus = useCallback(() => {
    if (!session?.expiresAt) return;

    const now = Date.now();
    const expiryTime = new Date(session.expiresAt).getTime();
    const timeUntilExpiry = Math.max(0, expiryTime - now);
    const minutesUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60));

    let sessionStatus: 'active' | 'expiring' | 'expired' = 'active';
    
    if (timeUntilExpiry <= 0) {
      sessionStatus = 'expired';
    } else if (minutesUntilExpiry <= 15) {
      sessionStatus = 'expiring';
    }

    setState(prev => ({
      ...prev,
      sessionStatus,
      timeUntilExpiry: minutesUntilExpiry
    }));
  }, [session]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id || !showNotifications) return;

    try {
      const response = await fetch(`/api/users/${user.id}/notifications/security`);
      const data = await response.json();
      
      if (response.ok) {
        setState(prev => ({
          ...prev,
          notifications: data.notifications || [],
          unreadCount: data.unreadCount || 0
        }));
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [user?.id, showNotifications]);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      await fetch(`/api/users/${user.id}/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1)
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [user?.id]);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      await fetch(`/api/users/${user.id}/notifications/security/clear`, {
        method: 'POST'
      });
      
      setState(prev => ({
        ...prev,
        notifications: [],
        unreadCount: 0,
        showNotificationPanel: false
      }));
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }, [user?.id]);

  // Update session status periodically
  useEffect(() => {
    updateSessionStatus();
    const interval = setInterval(updateSessionStatus, 60000); // Every minute
    return () => clearInterval(interval);
  }, [updateSessionStatus]);

  // Fetch notifications on mount and periodically
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 300000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const formatTimeUntilExpiry = (minutes: number) => {
    if (minutes <= 0) return 'Expired';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getSessionStatusColor = () => {
    switch (state.sessionStatus) {
      case 'expired': return 'red';
      case 'expiring': return 'yellow';
      default: return 'green';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'login_attempt': return Lock;
      case 'password_change': return Shield;
      case 'device_change': return Smartphone;
      default: return AlertTriangle;
    }
  };

  // Don't render if no user
  if (!user) return null;

  if (variant === 'minimal') {
    return (
      <div className={`auth-status-bar-minimal flex items-center space-x-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {user.firstName} {user.lastName}
          </span>
        </div>
        
        {showSessionInfo && (
          <div className={`w-2 h-2 rounded-full bg-${getSessionStatusColor()}-500`} />
        )}
        
        <button
          onClick={onLogout}
          className="text-sm text-gray-500 hover:text-gray-700"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`auth-status-bar-compact bg-white border border-gray-200 rounded-lg px-4 py-2 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {showNotifications && state.unreadCount > 0 && (
              <div className="relative">
                <Bell className="w-4 h-4 text-gray-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">{state.unreadCount}</span>
                </div>
              </div>
            )}
            
            <div className={`w-2 h-2 rounded-full bg-${getSessionStatusColor()}-500`} />
            
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      auth-status-bar-full bg-white border-b border-gray-200 
      ${position === 'bottom' ? 'border-b-0 border-t' : ''}
      ${className}
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left side - User info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 bg-${getSessionStatusColor()}-500 rounded-full border-2 border-white`} />
              </div>
              
              <div>
                <button
                  onClick={onProfileClick}
                  className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {user.firstName} {user.lastName}
                </button>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>

            {/* Session info */}
            {showSessionInfo && (
              <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
                <Activity className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs font-medium text-gray-700">
                    Session: {state.sessionStatus === 'active' ? 'Active' : 
                             state.sessionStatus === 'expiring' ? 'Expiring Soon' : 'Expired'}
                  </p>
                  {state.sessionStatus !== 'expired' && (
                    <p className="text-xs text-gray-500">
                      {formatTimeUntilExpiry(state.timeUntilExpiry)} remaining
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-4">
            
            {/* Notifications */}
            {showNotifications && (
              <div className="relative">
                <button
                  onClick={() => setState(prev => ({ 
                    ...prev, 
                    showNotificationPanel: !prev.showNotificationPanel 
                  }))}
                  className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {state.unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-xs text-white font-medium px-1">
                        {state.unreadCount > 99 ? '99+' : state.unreadCount}
                      </span>
                    </motion.div>
                  )}
                </button>

                {/* Notifications Panel */}
                <AnimatePresence>
                  {state.showNotificationPanel && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                    >
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">
                            Security Alerts
                          </h3>
                          {state.notifications.length > 0 && (
                            <button
                              onClick={clearAllNotifications}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto">
                        {state.notifications.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">
                            No security alerts
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-200">
                            {state.notifications.map((notification) => {
                              const NotificationIcon = getNotificationIcon(notification.type);
                              return (
                                <button
                                  key={notification.id}
                                  onClick={() => markNotificationAsRead(notification.id)}
                                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                                  aria-label={`Mark notification as read: ${notification.title}`}
                                >
                                  <div className="flex items-start space-x-3">
                                    <NotificationIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="text-sm text-gray-900">
                                        {notification.message}
                                      </p>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <span className="text-xs text-gray-500">
                                          {new Date(notification.createdAt).toLocaleDateString()}
                                        </span>
                                        {notification.metadata?.location && (
                                          <span className="text-xs text-gray-500">
                                            • {String(notification.metadata.location)}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {!notification.isRead && (
                                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Settings */}
            <button
              onClick={onSettingsClick}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Open settings"
              title="Open settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Session expiry warning */}
      <AnimatePresence>
        {state.sessionStatus === 'expiring' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-yellow-50 border-t border-yellow-200"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    Your session will expire in {formatTimeUntilExpiry(state.timeUntilExpiry)}
                  </p>
                </div>
                <Link
                  href="/auth/refresh"
                  className="text-sm bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Extend Session
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthStatusBar;