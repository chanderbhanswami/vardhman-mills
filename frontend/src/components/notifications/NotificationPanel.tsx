/**
 * NotificationPanel Component
 * 
 * Dropdown panel for displaying user notifications
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  ClockIcon,
  ShoppingBagIcon,
  TagIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types/notification.types';

export interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
  onNotificationClick?: (id: string) => void;
  className?: string;
}

const notificationIcons: Partial<Record<string, React.ComponentType<{ className?: string }>>> = {
  order_update: ShoppingBagIcon,
  shipping_update: ShoppingBagIcon,
  payment_confirmation: ShoppingBagIcon,
  promotion: TagIcon,
  sale_alert: TagIcon,
  price_drop: TagIcon,
  account_security: ShieldCheckIcon,
  system_alert: InformationCircleIcon,
  announcement: InformationCircleIcon,
  wishlist_update: UserGroupIcon,
};

const notificationColors: Partial<Record<string, string>> = {
  order_update: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  shipping_update: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  payment_confirmation: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  promotion: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  sale_alert: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  price_drop: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  account_security: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  system_alert: 'text-gray-600 bg-gray-50 dark:bg-gray-800',
  announcement: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
  wishlist_update: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20',
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  unreadCount = 0,
  isOpen = true,
  onClose = () => {},
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  onDelete = () => {},
  onClearAll = () => {},
  onNotificationClick,
  className,
}) => {
  const router = useRouter();

  const handleNotificationClick = (notification: Notification) => {
    if (notification.tracking && !notification.tracking.readAt && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification.id);
    }
    if (notification.content?.actions?.[0]?.url) {
      router.push(notification.content.actions[0].url);
      if (onClose) onClose();
    }
  };

  const formatTime = (date: string | Date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = now.getTime() - notifDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] z-50',
              'bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700',
              'max-h-[600px] flex flex-col',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <BellIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <Badge variant="info" size="sm">
                    {unreadCount}
                  </Badge>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onMarkAllAsRead}
                      className="text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <BellIcon className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    No notifications yet
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center mt-1">
                    We&apos;ll notify you when something arrives
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => {
                    const Icon = notificationIcons[notification.type] || BellIcon;
                    const colorClass = notificationColors[notification.type] || 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';

                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          'relative p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                          {
                            'bg-blue-50/30 dark:bg-blue-900/10': !notification.tracking.readAt,
                          }
                        )}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className={cn('flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center', colorClass)}>
                            <Icon className="w-5 h-5" />
                          </div>

                          {/* Content */}
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                {notification.title}
                              </h4>
                              {!notification.tracking.readAt && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {notification.message}
                            </p>

                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <ClockIcon className="w-3 h-3" />
                                {formatTime(notification.createdAt)}
                              </div>

                              {notification.content?.actions?.[0]?.label && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationClick(notification);
                                  }}
                                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                >
                                  {notification.content.actions[0].label}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex-shrink-0 flex gap-1">
                            {!notification.tracking.readAt && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMarkAsRead(notification.id);
                                }}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Mark as read"
                              >
                                <CheckIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(notification.id);
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                              title="Delete"
                            >
                              <TrashIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    router.push('/account/notifications');
                    onClose();
                  }}
                  className="w-full"
                >
                  View all notifications
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;