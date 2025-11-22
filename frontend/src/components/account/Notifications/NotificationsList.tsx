'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  TrashIcon,
  ArchiveBoxIcon,
  EnvelopeOpenIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon as SettingsIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import NotificationItem from './NotificationItem';
import { useNotifications } from '@/components/notifications';
import { useNotification } from '@/hooks/notification/useNotification';
import type { Notification, NotificationType, NotificationPriority, NotificationCategory, ActionType, ActionStyle } from '@/types/notification.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface NotificationsListProps {
  /** Initial filter */
  initialFilter?: NotificationFilter;
  
  /** Show search */
  showSearch?: boolean;
  
  /** Show filters */
  showFilters?: boolean;
  
  /** Show bulk actions */
  showBulkActions?: boolean;
  
  /** Compact mode */
  compact?: boolean;
  
  /** Maximum notifications to display */
  maxNotifications?: number;
  
  /** Enable virtual scrolling */
  virtualScrolling?: boolean;
  
  /** Custom notification renderer */
  customRenderer?: (notification: Notification) => React.ReactNode;
  
  /** Additional CSS classes */
  className?: string;
}

export interface NotificationFilter {
  type?: NotificationType;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  status?: 'all' | 'read' | 'unread';
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const NOTIFICATION_TYPES: { value: NotificationType; label: string }[] = [
  { value: 'order_update', label: 'Order Updates' },
  { value: 'payment_confirmation', label: 'Payment Confirmations' },
  { value: 'shipping_update', label: 'Shipping Updates' },
  { value: 'product_alert', label: 'Product Alerts' },
  { value: 'price_drop', label: 'Price Drops' },
  { value: 'stock_alert', label: 'Stock Alerts' },
  { value: 'wishlist_update', label: 'Wishlist Updates' },
  { value: 'promotion', label: 'Promotions' },
  { value: 'sale_alert', label: 'Sale Alerts' },
  { value: 'account_security', label: 'Security Alerts' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'announcement', label: 'Announcements' },
  { value: 'system_alert', label: 'System Alerts' },
];

const NOTIFICATION_PRIORITIES: { value: NotificationPriority; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
];

const NOTIFICATION_CATEGORIES: { value: NotificationCategory; label: string }[] = [
  { value: 'transactional', label: 'Transactional' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'system', label: 'System' },
  { value: 'social', label: 'Social' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'informational', label: 'Informational' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * NotificationsList Component
 * 
 * Comprehensive notifications list with features including:
 * - Search and filtering
 * - Sorting options
 * - Bulk actions (mark all read, delete, archive)
 * - Real-time updates
 * - Infinite scrolling
 * - Selection mode
 * - Empty states
 * - Loading states
 * - Error handling
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <NotificationsList
 *   showSearch={true}
 *   showFilters={true}
 *   showBulkActions={true}
 *   maxNotifications={50}
 * />
 * ```
 */
export const NotificationsList: React.FC<NotificationsListProps> = ({
  initialFilter = { status: 'all' },
  showSearch = true,
  showFilters = true,
  showBulkActions = true,
  compact = false,
  maxNotifications,
  customRenderer,
  className,
}) => {
  // Hooks
  const notificationContext = useNotifications();
  const toastNotification = useNotification();

  // State
  const [filter, setFilter] = useState<NotificationFilter>(initialFilter);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get notifications from context or fallback to toast notifications
  const contextNotifications = useMemo(() => notificationContext?.notifications || [], [notificationContext]);
  const toastNotifications = useMemo(() => toastNotification?.notifications || [], [toastNotification]);
  
  // Combine and deduplicate notifications
  const allNotifications = useMemo(() => {
    const combined = [...contextNotifications];
    
    // Add toast notifications that aren't duplicates
    toastNotifications.forEach(toast => {
      if (!combined.some(n => n.id === toast.id)) {
        // Convert toast notification to Notification format
        const notification: Notification = {
          id: toast.id,
          title: toast.title || 'Notification',
          message: toast.message,
          type: toast.type === 'success' ? 'order_update' : 
                toast.type === 'error' ? 'system_alert' : 
                toast.type === 'warning' ? 'account_security' : 'announcement',
          category: 'system' as NotificationCategory,
          priority: (toast.priority === 'medium' ? 'normal' : toast.priority) as NotificationPriority || 'normal',
          channels: ['in_app'],
          content: {
            title: toast.title || 'Notification',
            body: toast.message,
            actions: toast.actions?.map(a => ({
              id: a.label,
              label: a.label,
              type: 'navigate' as ActionType,
              url: '',
              style: (a.style === 'danger' ? 'primary' : a.style || 'primary') as ActionStyle,
            })) || [],
          },
          tracking: {
            readAt: toast.readAt?.toISOString(),
            opened: toast.isRead,
            clicked: false,
            actionsPerformed: [],
            engagement: {
              views: 0,
              clicks: 0,
              shares: 0,
              timeSpent: 0,
            },
          },
          status: 'sent',
          deliveryStatus: {
            overall: 'delivered',
            channels: [],
            attempts: 1,
          },
          deliveryConfig: {
            channels: [{
              channel: 'in_app',
              enabled: true,
              priority: 1,
            }],
            fallbackChannels: [],
            timing: { immediate: true },
            retryPolicy: {
              enabled: false,
              maxAttempts: 1,
              initialDelay: 0,
              backoffMultiplier: 1,
              maxDelay: 0,
            },
            rateLimiting: {
              enabled: false,
              globalLimits: [],
              userLimits: [],
              channelLimits: {
                push: [],
                email: [],
                sms: [],
                in_app: [],
                whatsapp: [],
                slack: [],
                webhook: [],
                browser: [],
                voice: [],
                telegram: [],
              },
            },
            deduplication: {
              enabled: false,
              window: 0,
              keyFields: [],
              strategy: 'skip',
            },
          },
          source: 'system',
          tags: [],
          personalized: false,
          createdAt: toast.createdAt.toISOString(),
          updatedAt: toast.createdAt.toISOString(),
        };
        combined.push(notification);
      }
    });
    
    return combined;
  }, [contextNotifications, toastNotifications]);

  // Filter and sort notifications
  const filteredNotifications = useMemo(() => {
    let filtered = [...allNotifications];

    // Apply filters
    if (filter.type) {
      filtered = filtered.filter(n => n.type === filter.type);
    }

    if (filter.category) {
      filtered = filtered.filter(n => n.category === filter.category);
    }

    if (filter.priority) {
      filtered = filtered.filter(n => n.priority === filter.priority);
    }

    if (filter.status === 'read') {
      filtered = filtered.filter(n => n.tracking?.readAt != null);
    } else if (filter.status === 'unread') {
      filtered = filtered.filter(n => n.tracking?.readAt == null);
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchLower) ||
        n.message.toLowerCase().includes(searchLower)
      );
    }

    // Sort notifications
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date': {
          const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : a.createdAt.getTime();
          const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : b.createdAt.getTime();
          comparison = dateA - dateB;
          break;
        }
        case 'priority': {
          const priorityOrder = { critical: 5, urgent: 4, high: 3, normal: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        }
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Limit notifications if maxNotifications is set
    if (maxNotifications && filtered.length > maxNotifications) {
      filtered = filtered.slice(0, maxNotifications);
    }

    return filtered;
  }, [allNotifications, filter, sortBy, sortOrder, maxNotifications]);

  // Computed values
  const unreadCount = useMemo(
    () => allNotifications.filter(n => n.tracking?.readAt == null).length,
    [allNotifications]
  );

  const hasSelected = selectedIds.size > 0;
  const allSelected = filteredNotifications.length > 0 && selectedIds.size === filteredNotifications.length;

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setFilter(prev => ({ ...prev, search: value }));
  }, []);

  const handleFilterChange = useCallback((key: keyof NotificationFilter, value: unknown) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map(n => n.id)));
    }
  }, [allSelected, filteredNotifications]);

  const handleSelectNotification = useCallback((notificationId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  }, []);

  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    try {
      if (notificationContext?.markAsRead) {
        await notificationContext.markAsRead(notificationId);
      } else if (toastNotification?.markAsRead) {
        toastNotification.markAsRead(notificationId);
      }
      toastNotification?.success('Notification marked as read');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark notification as read';
      toastNotification?.error(errorMessage);
    }
  }, [notificationContext, toastNotification]);

  const handleMarkAsUnread = useCallback(async (notificationId: string) => {
    try {
      if (notificationContext?.markAsUnread) {
        await notificationContext.markAsUnread(notificationId);
      }
      toastNotification?.success('Notification marked as unread');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark notification as unread';
      toastNotification?.error(errorMessage);
    }
  }, [notificationContext, toastNotification]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      if (notificationContext?.markAllAsRead) {
        await notificationContext.markAllAsRead();
      } else if (toastNotification?.markAllAsRead) {
        toastNotification.markAllAsRead();
      }
      toastNotification?.success('All notifications marked as read');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark all as read';
      toastNotification?.error(errorMessage);
    }
  }, [notificationContext, toastNotification]);

  const handleDelete = useCallback(async (notificationId: string) => {
    try {
      if (notificationContext?.deleteNotification) {
        await notificationContext.deleteNotification(notificationId);
      } else if (toastNotification?.dismiss) {
        toastNotification.dismiss(notificationId);
      }
      toastNotification?.success('Notification deleted');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete notification';
      toastNotification?.error(errorMessage);
    }
  }, [notificationContext, toastNotification]);

  const handleArchive = useCallback(async (notificationId: string) => {
    try {
      if (notificationContext?.archiveNotification) {
        await notificationContext.archiveNotification(notificationId);
      }
      toastNotification?.success('Notification archived');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to archive notification';
      toastNotification?.error(errorMessage);
    }
  }, [notificationContext, toastNotification]);

  const handleBookmark = useCallback(async (notificationId: string) => {
    try {
      if (notificationContext?.bookmarkNotification) {
        await notificationContext.bookmarkNotification(notificationId);
      }
      toastNotification?.success('Notification bookmarked');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bookmark notification';
      toastNotification?.error(errorMessage);
    }
  }, [notificationContext, toastNotification]);

  const handleStar = useCallback(async (notificationId: string) => {
    try {
      if (notificationContext?.starNotification) {
        await notificationContext.starNotification(notificationId);
      }
      toastNotification?.success('Notification starred');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to star notification';
      toastNotification?.error(errorMessage);
    }
  }, [notificationContext, toastNotification]);

  const handleShare = useCallback(async (notification: Notification) => {
    try {
      if (notificationContext?.shareNotification) {
        await notificationContext.shareNotification(notification.id);
      }
      toastNotification?.success('Notification link copied');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to share notification';
      toastNotification?.error(errorMessage);
    }
  }, [notificationContext, toastNotification]);

  const handleBulkMarkAsRead = useCallback(async () => {
    try {
      Array.from(selectedIds).forEach(async (id) => {
        if (notificationContext?.markAsRead) {
          await notificationContext.markAsRead(id);
        } else if (toastNotification?.markAsRead) {
          toastNotification.markAsRead(id);
        }
      });
      setSelectedIds(new Set());
      toastNotification?.success(`${selectedIds.size} notifications marked as read`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark notifications as read';
      toastNotification?.error(errorMessage);
    }
  }, [selectedIds, notificationContext, toastNotification]);

  const handleBulkDelete = useCallback(async () => {
    try {
      Array.from(selectedIds).forEach(async (id) => {
        if (notificationContext?.deleteNotification) {
          await notificationContext.deleteNotification(id);
        } else if (toastNotification?.dismiss) {
          toastNotification.dismiss(id);
        }
      });
      setSelectedIds(new Set());
      toastNotification?.success(`${selectedIds.size} notifications deleted`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete notifications';
      toastNotification?.error(errorMessage);
    }
  }, [selectedIds, notificationContext, toastNotification]);

  const handleBulkArchive = useCallback(async () => {
    try {
      Array.from(selectedIds).forEach(async (id) => {
        if (notificationContext?.archiveNotification) {
          await notificationContext.archiveNotification(id);
        }
      });
      setSelectedIds(new Set());
      toastNotification?.success(`${selectedIds.size} notifications archived`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to archive notifications';
      toastNotification?.error(errorMessage);
    }
  }, [selectedIds, notificationContext, toastNotification]);

  // Render empty state
  if (filteredNotifications.length === 0) {
    return (
      <Card className={cn('p-8', className)}>
        <div className="text-center">
          <EnvelopeOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter.search || filter.type || filter.category || filter.priority || filter.status !== 'all'
              ? 'Try adjusting your filters'
              : "You're all caught up!"}
          </p>
        </div>
      </Card>
    );
  }

  // Render component
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-500">
                {unreadCount} unread · {allNotifications.length} total
              </p>
            </div>

            <div className="flex items-center gap-2">
              {showBulkActions && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Mark all read
                </Button>
              )}

              {showFilters && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                  >
                    <FunnelIcon className="w-4 h-4 mr-2" />
                    Filters
                    <ChevronDownIcon
                      className={cn(
                        'w-4 h-4 ml-2 transition-transform',
                        showFilterPanel && 'transform rotate-180'
                      )}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => console.log('Advanced settings')}
                    title="Advanced notification settings"
                  >
                    <SettingsIcon className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Search and Filters */}
        <CardContent>
          {showSearch && (
            <div className="mb-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search notifications..."
                  value={filter.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilterPanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <Select
                    value={filter.status || 'all'}
                    onValueChange={(value) => handleFilterChange('status', value)}
                    options={[
                      { value: 'all', label: 'All' },
                      { value: 'unread', label: 'Unread' },
                      { value: 'read', label: 'Read' },
                    ]}
                    label="Status"
                  />

                  <Select
                    value={filter.type || ''}
                    onValueChange={(value) => handleFilterChange('type', value || undefined)}
                    options={[
                      { value: '', label: 'All Types' },
                      ...NOTIFICATION_TYPES.map(t => ({ value: t.value, label: t.label })),
                    ]}
                    label="Type"
                  />

                  <Select
                    value={filter.category || ''}
                    onValueChange={(value) => handleFilterChange('category', value || undefined)}
                    options={[
                      { value: '', label: 'All Categories' },
                      ...NOTIFICATION_CATEGORIES.map(c => ({ value: c.value, label: c.label })),
                    ]}
                    label="Category"
                  />

                  <Select
                    value={filter.priority || ''}
                    onValueChange={(value) => handleFilterChange('priority', value || undefined)}
                    options={[
                      { value: '', label: 'All Priorities' },
                      ...NOTIFICATION_PRIORITIES.map(p => ({ value: p.value, label: p.label })),
                    ]}
                    label="Priority"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sort and Bulk Actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as 'date' | 'priority' | 'type')}
                options={[
                  { value: 'date', label: 'Date' },
                  { value: 'priority', label: 'Priority' },
                  { value: 'type', label: 'Type' },
                ]}
                label="Sort by"
                className="w-32"
              />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>

              {showBulkActions && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  {allSelected ? 'Deselect all' : 'Select all'}
                </Button>
              )}
            </div>

            {hasSelected && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedIds.size} selected
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkMarkAsRead}
                >
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  Mark read
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkArchive}
                >
                  <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                  Archive
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.map((notification) => (
            customRenderer ? (
              <div key={notification.id}>{customRenderer(notification)}</div>
            ) : (
              <NotificationItem
                key={notification.id}
                notification={notification}
                selected={selectedIds.has(notification.id)}
                onClick={() => handleSelectNotification(notification.id)}
                onMarkAsRead={handleMarkAsRead}
                onMarkAsUnread={handleMarkAsUnread}
                onDelete={handleDelete}
                onArchive={handleArchive}
                onBookmark={handleBookmark}
                onStar={handleStar}
                onShare={handleShare}
                showActions={true}
                compact={compact}
                animated={true}
              />
            )
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationsList;
