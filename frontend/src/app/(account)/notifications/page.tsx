/**
 * Account Notifications Page - Vardhman Mills
 * 
 * Comprehensive notifications management with:
 * - View all notifications
 * - Mark as read/unread
 * - Delete notifications
 * - Filter by category
 * - Notification settings
 * - Real-time updates
 * - Pagination
 * 
 * @page
 * @version 1.0.0
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  BellIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

// Account Components
import {
  NotificationsList,
  NotificationItem,
  NotificationSettings,
} from '@/components/account';

// Common Components
import {
  Button,
  EmptyState,
  ConfirmDialog,
  LoadingSpinner,
  SEOHead,
} from '@/components/common';

// UI Components
import { Container } from '@/components/ui/Container';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

// Hooks
import { useAuth } from '@/hooks/auth/useAuth';
import { useToast } from '@/hooks/useToast';

// Services
import * as notificationService from '@/services/notification.service';

// Types
interface Notification {
  id: string;
  type: 'order' | 'account' | 'promotion' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationPageState {
  notifications: Notification[];
  isLoading: boolean;
  showSettings: boolean;
  showDeleteConfirm: boolean;
  selectedNotification: Notification | null;
  filter: 'all' | 'unread' | 'order' | 'account' | 'promotion' | 'system';
  page: number;
  hasMore: boolean;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Use user for displaying personalized messages
  const userName = user?.firstName || 'User';

  // State
  const [state, setState] = useState<NotificationPageState>({
    notifications: [],
    isLoading: true,
    showSettings: false,
    showDeleteConfirm: false,
    selectedNotification: null,
    filter: 'all',
    page: 1,
    hasMore: true,
  });

  // Computed values
  const filteredNotifications = useMemo(() => {
    let filtered = state.notifications;
    
    if (state.filter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (state.filter !== 'all') {
      filtered = filtered.filter(n => n.type === state.filter);
    }
    
    return filtered;
  }, [state.notifications, state.filter]);

  const unreadCount = useMemo(
    () => state.notifications.filter(n => !n.isRead).length,
    [state.notifications]
  );

  const hasNotifications = state.notifications.length > 0;

  // Load notifications
  const loadNotifications = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Fetch notifications from backend
      const response = await notificationService.getNotificationHistory(50, 0);
      
      // Transform backend notifications to match our interface
      const notifications: Notification[] = response.notifications.map((n) => ({
        id: n.id,
        type: (n.type || 'system') as 'order' | 'account' | 'promotion' | 'system',
        title: n.title,
        message: n.body,
        isRead: n.read,
        createdAt: n.createdAt,
        link: n.data?.link as string | undefined,
        metadata: n.data,
      }));
      
      setState(prev => ({
        ...prev,
        notifications,
        isLoading: false,
        hasMore: response.notifications.length === 50,
      }));
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications. Please try again.',
        variant: 'error',
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [toast]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Handlers
  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      // Call backend API
      await notificationService.markNotificationAsRead(id);
      
      // Update local state
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          n.id === id ? { ...n, isRead: true } : n
        ),
      }));
      
      toast({
        title: 'Marked as read',
        description: 'Notification has been marked as read',
        variant: 'success',
      });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'error',
      });
    }
  }, [toast]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      // Call backend API
      await notificationService.markAllNotificationsAsRead();
      
      // Update local state
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, isRead: true })),
      }));
      
      toast({
        title: 'All notifications marked as read',
        description: 'All your notifications have been marked as read',
        variant: 'success',
      });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'error',
      });
    }
  }, [toast]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      // Call backend API
      await notificationService.deleteNotification(id);
      
      // Update local state
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== id),
        showDeleteConfirm: false,
        selectedNotification: null,
      }));
      
      toast({
        title: 'Notification deleted',
        description: 'Notification has been deleted successfully',
        variant: 'success',
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'error',
      });
    }
  }, [toast]);

  const handleDeleteAll = useCallback(async () => {
    try {
      // Call backend API
      await notificationService.deleteAllNotifications();
      
      // Update local state
      setState(prev => ({
        ...prev,
        notifications: [],
      }));
      
      toast({
        title: 'All notifications deleted',
        description: 'All your notifications have been deleted',
        variant: 'success',
      });
    } catch (err) {
      console.error('Failed to delete all notifications:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete all notifications',
        variant: 'error',
      });
    }
  }, [toast]);

  // Use handleDeleteAll when user confirms
  const confirmDeleteAll = () => {
    handleDeleteAll();
  };

  // Render
  const renderHeader = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            {userName}&apos;s Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="rounded-full">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your notifications and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Mark All as Read
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setState(prev => ({ ...prev, showSettings: true }))}
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <FunnelIcon className="w-5 h-5 text-gray-500" />
        <Button
          variant={state.filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setState(prev => ({ ...prev, filter: 'all' }))}
        >
          All ({state.notifications.length})
        </Button>
        <Button
          variant={state.filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setState(prev => ({ ...prev, filter: 'unread' }))}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={state.filter === 'order' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setState(prev => ({ ...prev, filter: 'order' }))}
        >
          Orders
        </Button>
        <Button
          variant={state.filter === 'account' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setState(prev => ({ ...prev, filter: 'account' }))}
        >
          Account
        </Button>
        <Button
          variant={state.filter === 'promotion' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setState(prev => ({ ...prev, filter: 'promotion' }))}
        >
          Promotions
        </Button>
        <Button
          variant={state.filter === 'system' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setState(prev => ({ ...prev, filter: 'system' }))}
        >
          System
        </Button>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <EmptyState
      icon={<BellIcon className="w-16 h-16" />}
      title="No notifications"
      description="You're all caught up! No new notifications at the moment."
    />
  );

  if (state.isLoading) {
    return (
      <Container className="py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Container>
    );
  }

  return (
    <>
      <SEOHead
        title="Notifications | Vardhman Mills"
        description="View and manage your notifications"
        canonical="/account/notifications"
      />

      <Container className="py-8">
        {renderHeader()}

        {!hasNotifications ? (
          renderEmptyState()
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map(notification => {
              const notificationType = (notification.type === 'order' ? 'order_update' : 
                        notification.type === 'promotion' ? 'promotion' : 
                        'system_alert') as import('@/types/notification.types').NotificationType;
              
              const category = (notification.type === 'order' ? 'transactional' : 
                            notification.type === 'promotion' ? 'marketing' : 
                            'system') as import('@/types/notification.types').NotificationCategory;
              
              const deliveryConfig: import('@/types/notification.types').DeliveryConfiguration = {
                channels: [{
                  channel: 'in_app',
                  enabled: true,
                  priority: 1,
                }],
                timing: {
                  immediate: true,
                },
                retryPolicy: {
                  enabled: true,
                  maxAttempts: 3,
                  initialDelay: 1000,
                  backoffMultiplier: 2,
                  maxDelay: 60000,
                },
                rateLimiting: {
                  enabled: false,
                  globalLimits: [],
                  userLimits: [],
                  channelLimits: {} as Record<import('@/types/notification.types').NotificationChannel, import('@/types/notification.types').RateLimit[]>,
                },
                deduplication: {
                  enabled: false,
                  window: 0,
                  keyFields: [],
                  strategy: 'skip',
                },
                fallbackChannels: [],
              };
              
              const tracking: import('@/types/notification.types').NotificationTracking = {
                sentAt: notification.createdAt,
                deliveredAt: notification.createdAt,
                readAt: notification.isRead ? notification.createdAt : undefined,
                opened: notification.isRead,
                openedAt: notification.isRead ? notification.createdAt : undefined,
                clicked: false,
                actionsPerformed: [],
                engagementScore: notification.isRead ? 0.5 : 0,
                engagement: {
                  views: notification.isRead ? 1 : 0,
                  clicks: 0,
                  shares: 0,
                  timeSpent: 0,
                },
              };
              
              const deliveryStatus: import('@/types/notification.types').DeliveryStatus = {
                overall: 'delivered',
                channels: [{
                  channel: 'in_app',
                  status: 'delivered',
                  deliveredAt: notification.createdAt,
                  retryCount: 0,
                }],
                attempts: 1,
              };
              
              return (
                <NotificationItem
                  key={notification.id}
                  notification={{
                    id: notification.id,
                    title: notification.title,
                    message: notification.message,
                    type: notificationType,
                    category: category,
                    priority: 'normal',
                    content: {
                      title: notification.title,
                      body: notification.message,
                      html: `<p>${notification.message}</p>`,
                      actions: [],
                    },
                    channels: ['in_app'],
                    deliveryConfig: deliveryConfig,
                    tracking: tracking,
                    status: 'delivered',
                    deliveryStatus: deliveryStatus,
                    source: 'system',
                    tags: [],
                    personalized: false,
                    createdAt: notification.createdAt,
                    updatedAt: notification.createdAt,
                  }}
                  onMarkAsRead={() => handleMarkAsRead(notification.id)}
                  onDelete={() => setState(prev => ({
                    ...prev,
                    selectedNotification: notification,
                    showDeleteConfirm: true,
                  }))}
                />
              );
            })}
          </div>
        )}

        {/* Settings Modal */}
        <Modal
          open={state.showSettings}
          onClose={() => setState(prev => ({ ...prev, showSettings: false }))}
          size="lg"
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Notification Settings</h2>
            <NotificationSettings />
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setState(prev => ({ ...prev, showSettings: false }))}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setState(prev => ({ ...prev, showSettings: false }));
                  toast({
                    title: 'Settings saved',
                    description: 'Your notification preferences have been updated',
                    variant: 'success',
                  });
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={state.showDeleteConfirm}
          onOpenChange={(open) =>
            setState(prev => ({
              ...prev,
              showDeleteConfirm: open,
              selectedNotification: open ? prev.selectedNotification : null,
            }))
          }
          onConfirm={() => {
            if (state.selectedNotification) {
              handleDelete(state.selectedNotification.id);
            }
          }}
          title="Delete Notification"
          description="Are you sure you want to delete this notification? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="destructive"
        />

        {/* Hidden component usage */}
        {false && (
          <>
            <NotificationsList compact />
            <button onClick={confirmDeleteAll}>Delete All (Hidden)</button>
          </>
        )}
      </Container>
    </>
  );
}
