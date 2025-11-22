'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  XMarkIcon,
  InformationCircleIcon,
  GiftIcon,
  ShoppingBagIcon,
  TruckIcon,
  HeartIcon,
  TagIcon,
  StarIcon,
  CreditCardIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';

export interface NotificationProps {
  className?: string;
  showDropdown?: boolean;
  maxNotifications?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export type NotificationType = 
  | 'order' 
  | 'shipping' 
  | 'promotion' 
  | 'account' 
  | 'system' 
  | 'wishlist' 
  | 'review' 
  | 'payment' 
  | 'social' 
  | 'announcement';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  timestamp: string;
  isRead: boolean;
  isNew: boolean;
  metadata?: {
    orderId?: string;
    productId?: string;
    userId?: string;
    amount?: number;
    discount?: number;
    [key: string]: unknown;
  };
}

interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string;
}

const Notification: React.FC<NotificationProps> = ({
  className = '',
  showDropdown = true,
  maxNotifications = 10,
  autoRefresh = false,
  refreshInterval = 30000,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationState, setNotificationState] = useState<NotificationState>({
    items: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    lastUpdated: new Date().toISOString(),
  });
  const [animateBell, setAnimateBell] = useState(false);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-notification-dropdown]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Auto refresh notifications
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // In real app, fetch new notifications from API
        setNotificationState(prev => ({
          ...prev,
          lastUpdated: new Date().toISOString(),
        }));
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Animate bell when new notifications arrive
  useEffect(() => {
    if (notificationState.unreadCount > 0) {
      setAnimateBell(true);
      const timer = setTimeout(() => setAnimateBell(false), 500);
      return () => clearTimeout(timer);
    }
  }, [notificationState.unreadCount]);

  const markAsRead = (notificationId: string) => {
    setNotificationState(prev => {
      const updatedItems = prev.items.map(item =>
        item.id === notificationId
          ? { ...item, isRead: true, isNew: false }
          : item
      );
      return {
        ...prev,
        items: updatedItems,
        unreadCount: updatedItems.filter(item => !item.isRead).length,
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const markAllAsRead = () => {
    setNotificationState(prev => ({
      ...prev,
      items: prev.items.map(item => ({ ...item, isRead: true, isNew: false })),
      unreadCount: 0,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const removeNotification = (notificationId: string) => {
    setNotificationState(prev => {
      const updatedItems = prev.items.filter(item => item.id !== notificationId);
      return {
        ...prev,
        items: updatedItems,
        unreadCount: updatedItems.filter(item => !item.isRead).length,
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const clearAllNotifications = () => {
    setNotificationState({
      items: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      lastUpdated: new Date().toISOString(),
    });
  };

  const getNotificationIcon = (type: NotificationType, priority: NotificationPriority) => {
    const iconClass = `w-5 h-5 ${
      priority === 'urgent' ? 'text-red-500' :
      priority === 'high' ? 'text-orange-500' :
      priority === 'medium' ? 'text-blue-500' :
      'text-gray-500'
    }`;

    const icons = {
      order: <ShoppingBagIcon className={iconClass} />,
      shipping: <TruckIcon className={iconClass} />,
      promotion: <TagIcon className={iconClass} />,
      account: <UserGroupIcon className={iconClass} />,
      system: <InformationCircleIcon className={iconClass} />,
      wishlist: <HeartIcon className={iconClass} />,
      review: <StarIcon className={iconClass} />,
      payment: <CreditCardIcon className={iconClass} />,
      social: <ChatBubbleLeftRightIcon className={iconClass} />,
      announcement: <GiftIcon className={iconClass} />,
    };

    return icons[type] || <InformationCircleIcon className={iconClass} />;
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    const colors = {
      urgent: 'bg-red-100 border-red-200 dark:bg-red-900/20 dark:border-red-800',
      high: 'bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
      medium: 'bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
      low: 'bg-gray-100 border-gray-200 dark:bg-gray-700 dark:border-gray-600',
    };
    return colors[priority];
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMs = now.getTime() - time.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  const bellVariants = {
    idle: { rotate: 0 },
    ring: {
      rotate: [0, -15, 15, -10, 10, -5, 5, 0],
      transition: { duration: 0.6 }
    }
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: { duration: 0.15 }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.2, staggerChildren: 0.02 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.15 } }
  };

  return (
    <div className={`relative ${className}`} data-notification-dropdown>
      {/* Notification Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        variants={bellVariants}
        animate={animateBell ? 'ring' : 'idle'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        {notificationState.unreadCount > 0 ? (
          <BellSolidIcon className="w-6 h-6 text-blue-500" />
        ) : (
          <BellIcon className="w-6 h-6" />
        )}

        {/* Notification Badge */}
        {notificationState.unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full min-w-5 h-5 flex items-center justify-center text-xs font-bold"
          >
            {notificationState.unreadCount > 99 ? '99+' : notificationState.unreadCount}
          </motion.span>
        )}

        {/* Pulse indicator for new notifications */}
        {notificationState.items.some(item => item.isNew) && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.button>

      {/* Notification Dropdown */}
      {showDropdown && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <BellIcon className="w-5 h-5 text-blue-500 mr-2" />
                    Notifications
                  </h3>
                  <div className="flex items-center space-x-2">
                    {notificationState.unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      aria-label="Close notifications"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {notificationState.unreadCount > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {notificationState.unreadCount} unread notification{notificationState.unreadCount === 1 ? '' : 's'}
                  </p>
                )}
              </div>

              {/* Notification Items */}
              <div className="max-h-96 overflow-y-auto">
                {notificationState.items.length === 0 ? (
                  <div className="p-8 text-center">
                    <BellIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">No notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      You&apos;re all caught up! We&apos;ll notify you when something new happens.
                    </p>
                  </div>
                ) : (
                  <div className="p-2">
                    <AnimatePresence>
                      {notificationState.items.map((notification) => (
                        <motion.div
                          key={notification.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className={`
                            relative p-3 rounded-lg border mb-2 transition-all duration-200 cursor-pointer
                            ${!notification.isRead 
                              ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }
                            ${getPriorityColor(notification.priority)}
                          `}
                          onClick={() => markAsRead(notification.id)}
                        >
                          {/* New indicator */}
                          {notification.isNew && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          )}

                          <div className="flex items-start space-x-3">
                            {/* Notification Icon */}
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notification.type, notification.priority)}
                            </div>

                            {/* Notification Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                  {notification.title}
                                </h4>
                                <div className="flex items-center space-x-1 ml-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                    <ClockIcon className="w-3 h-3 mr-1" />
                                    {formatTimeAgo(notification.timestamp)}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeNotification(notification.id);
                                    }}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    aria-label="Remove notification"
                                  >
                                    <XMarkIcon className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>

                              {/* Action Button */}
                              {notification.actionText && notification.actionUrl && (
                                <div className="mt-2">
                                  <Link
                                    href={notification.actionUrl}
                                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                  >
                                    {notification.actionText}
                                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </Link>
                                </div>
                              )}

                              {/* Metadata */}
                              {notification.metadata && (
                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  {notification.type === 'order' && notification.metadata.orderId && (
                                    <span>Order #{notification.metadata.orderId}</span>
                                  )}
                                  {notification.type === 'promotion' && notification.metadata.discount && (
                                    <span>{notification.metadata.discount}% off • Limited time</span>
                                  )}
                                  {notification.type === 'payment' && notification.metadata.amount && (
                                    <span>${notification.metadata.amount.toFixed(2)}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Footer */}
              {notificationState.items.length > 0 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Last updated {formatTimeAgo(notificationState.lastUpdated)}
                    </span>
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href="/account/notifications"
                      className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center block"
                      onClick={() => setIsOpen(false)}
                    >
                      View All Notifications
                    </Link>
                    <Link
                      href="/account/notifications"
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors text-center block"
                      onClick={() => setIsOpen(false)}
                    >
                      Notification Settings
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default Notification;
