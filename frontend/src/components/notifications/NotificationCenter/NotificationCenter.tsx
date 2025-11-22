'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  ArchiveBoxIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
  TagIcon,
  ArrowPathIcon,
  InboxArrowDownIcon,
  Bars3Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentArrowDownIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import {
  BellIcon as BellIconSolid,
  CheckIcon as CheckIconSolid
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Input } from '../../ui/Input';
import { Switch } from '../../ui/Switch';
import { useNotification, type StoredNotification } from '@/hooks/notification/useNotification';
import { useLocalStorage } from '@/hooks/localStorage/useLocalStorage';
import { 
  type NotificationType, 
  type NotificationPriority,
  type NotificationChannel,
  type NotificationCategory 
} from '@/types/notification.types';

// ============================================================================
// INTERFACES
// ============================================================================

interface NotificationCenterProps {
  /** Custom className for styling */
  className?: string;
  /** Maximum height of the notification center */
  maxHeight?: string | number;
  /** Number of notifications to load initially */
  initialLoadCount?: number;
  /** Enable infinite scrolling */
  enableInfiniteScroll?: boolean;
  /** Enable search functionality */
  enableSearch?: boolean;
  /** Enable filtering */
  enableFiltering?: boolean;
  /** Enable sorting */
  enableSorting?: boolean;
  /** Enable bulk actions */
  enableBulkActions?: boolean;
  /** Enable notification preview */
  enablePreview?: boolean;
  /** Enable quick actions */
  enableQuickActions?: boolean;
  /** Show empty state */
  showEmptyState?: boolean;
  /** Custom empty state message */
  emptyStateMessage?: string;
  /** Enable real-time updates */
  realTime?: boolean;
  /** Enable notification grouping */
  enableGrouping?: boolean;
  /** Auto-refresh interval (in ms) */
  autoRefreshInterval?: number;
  /** Enable keyboard navigation */
  enableKeyboardNavigation?: boolean;
  /** Notification channels to display */
  channels?: NotificationChannel[];
  /** Custom notification renderer */
  notificationRenderer?: (notification: StoredNotification) => React.ReactNode;
  /** Custom action handler */
  onActionClick?: (action: string, notification: StoredNotification) => void;
  /** Close handler */
  onClose?: () => void;
  /** Export handler */
  onExport?: (notifications: Notification[]) => void;
  /** Enable notification archiving */
  enableArchiving?: boolean;
  /** Enable notification categories */
  enableCategories?: boolean;
  /** Show notification count */
  showCount?: boolean;
  /** Enable drag and drop */
  enableDragDrop?: boolean;
  /** Position */
  position?: 'left' | 'right' | 'center' | 'fullscreen';
  /** Width */
  width?: string | number;
  /** Compact mode */
  compact?: boolean;
}

interface NotificationFilter {
  type?: NotificationType;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  channel?: NotificationChannel;
  status?: 'read' | 'unread' | 'all';
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
  tags?: string[];
}

interface NotificationSort {
  field: 'createdAt' | 'priority' | 'type' | 'category';
  direction: 'asc' | 'desc';
}

interface ViewSettings {
  layout: 'list' | 'grid' | 'compact';
  groupBy?: 'type' | 'category' | 'priority' | 'date' | 'none';
  showImages: boolean;
  showActions: boolean;
  showTimestamp: boolean;
  showPriority: boolean;
  showCategory: boolean;
  showChannel: boolean;
  density: 'comfortable' | 'compact' | 'spacious';
}

interface NotificationCenterState {
  selectedNotifications: string[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  filter: NotificationFilter;
  sort: NotificationSort;
  viewSettings: ViewSettings;
  searchQuery: string;
  showFilters: boolean;
  showSettings: boolean;
  expandedNotifications: string[];
  lastRefresh: Date | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_VIEW_SETTINGS: ViewSettings = {
  layout: 'list',
  groupBy: 'none',
  showImages: true,
  showActions: true,
  showTimestamp: true,
  showPriority: true,
  showCategory: true,
  showChannel: false,
  density: 'comfortable'
};

const DEFAULT_SORT: NotificationSort = {
  field: 'createdAt',
  direction: 'desc'
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
  critical: 'bg-red-500 text-white'
};

const CATEGORY_ICONS = {
  transactional: ClockIcon,
  marketing: TagIcon,
  operational: AdjustmentsHorizontalIcon,
  security: EyeIcon,
  social: ShareIcon,
  system: Bars3Icon,
  informational: DocumentArrowDownIcon,
  urgent: BellIconSolid,
  promotional: TagIcon,
  educational: DocumentArrowDownIcon
};

// ============================================================================
// NOTIFICATION CENTER COMPONENT
// ============================================================================

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  className,
  maxHeight = '500px',
  enableSearch = true,
  enableFiltering = true,
  enableBulkActions = true,
  enableQuickActions = true,
  showEmptyState = true,
  emptyStateMessage = 'No notifications yet',
  realTime = true,
  enableGrouping = false,
  autoRefreshInterval = 30000,
  enableKeyboardNavigation = true,
  channels = ['in_app', 'push', 'email'],
  notificationRenderer,
  onActionClick,
  onClose,
  onExport,
  enableArchiving = true,
  enableCategories = true,
  showCount = true,
  position = 'right',
  width = '400px'
}) => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    remove: deleteNotification,
    dismiss: archiveNotification
  } = useNotification({
    enableFirebase: realTime,
    autoSyncWithBackend: realTime
  });

  const {
    value: viewSettings,
    setValue: setViewSettings
  } = useLocalStorage<ViewSettings>('notification-center-view', {
    defaultValue: DEFAULT_VIEW_SETTINGS
  });

  const [state, setState] = useState<NotificationCenterState>({
    selectedNotifications: [],
    isLoading: false,
    isRefreshing: false,
    error: null,
    filter: { status: 'all' },
    sort: DEFAULT_SORT,
    viewSettings,
    searchQuery: '',
    showFilters: false,
    showSettings: false,
    expandedNotifications: [],
    lastRefresh: null
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Store available channels for filtering (used in metadata filtering)
  const availableChannels = channels;

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredAndSortedNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Apply status filter
    if (state.filter.status === 'read') {
      filtered = filtered.filter(n => n.isRead ? new Date() : undefined);
    } else if (state.filter.status === 'unread') {
      filtered = filtered.filter(n => !n.isRead ? new Date() : undefined);
    }

    // Apply other filters
    if (state.filter.type) {
      filtered = filtered.filter(n => n.type === state.filter.type);
    }

    if (state.filter.category) {
      filtered = filtered.filter(n => n.category === state.filter.category);
    }

    if (state.filter.priority) {
      filtered = filtered.filter(n => n.priority === state.filter.priority);
    }

    if (state.filter.channel) {
      // Filter notifications by channel - only show notifications that match configured channels
      filtered = filtered.filter(n => {
        const metadata = n.metadata as { channels?: string[] } | undefined;
        const notificationChannels = metadata?.channels ?? availableChannels;
        return notificationChannels?.includes(state.filter.channel!) ?? true;
      });
    }

    // Apply search
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(n => {
        const titleMatch = n.title?.toLowerCase().includes(query) ?? false;
        const messageMatch = n.message.toLowerCase().includes(query);
        const metadata = n.metadata as { tags?: string[] } | undefined;
        const tagsMatch = metadata?.tags?.some((tag: string) => tag.toLowerCase().includes(query)) ?? false;
        return titleMatch || messageMatch || tagsMatch;
      });
    }

    // Apply date range filter
    if (state.filter.dateRange) {
      filtered = filtered.filter(n => {
        const date = new Date(n.createdAt);
        return date >= state.filter.dateRange!.start && 
               date <= state.filter.dateRange!.end;
      });
    }

    // Apply tag filter
    if (state.filter.tags?.length) {
      filtered = filtered.filter(n => {
        const metadata = n.metadata as { tags?: string[] } | undefined;
        return state.filter.tags!.some(tag => metadata?.tags?.includes(tag) ?? false);
      });
    }

    // Sort notifications
    filtered.sort((a, b) => {
      const { field, direction } = state.sort;
      let aValue: string | number;
      let bValue: string | number;

      switch (field) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'priority':
          const priorityOrder: Record<string, number> = { low: 1, normal: 2, high: 3, urgent: 4, critical: 5 };
          aValue = priorityOrder[a.priority ?? 'normal'];
          bValue = priorityOrder[b.priority ?? 'normal'];
          break;
        case 'type':
          aValue = a.type ?? '';
          bValue = b.type ?? '';
          break;
        case 'category':
          aValue = a.category ?? '';
          bValue = b.category ?? '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [notifications, state.filter, state.sort, state.searchQuery, availableChannels]);

  const groupedNotifications = useMemo(() => {
    if (!enableGrouping || state.viewSettings.groupBy === 'none') {
      return { 'All Notifications': filteredAndSortedNotifications };
    }

    return filteredAndSortedNotifications.reduce((groups, notification) => {
      let groupKey: string;

      switch (state.viewSettings.groupBy) {
        case 'type':
          groupKey = (notification.type ?? 'Unknown').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          break;
        case 'category':
          groupKey = (notification.category ?? 'Uncategorized').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          break;
        case 'priority':
          groupKey = (notification.priority ?? 'Normal').replace(/\b\w/g, l => l.toUpperCase());
          break;
        case 'date':
          const date = new Date(notification.createdAt);
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          if (date.toDateString() === today.toDateString()) {
            groupKey = 'Today';
          } else if (date.toDateString() === yesterday.toDateString()) {
            groupKey = 'Yesterday';
          } else {
            groupKey = date.toLocaleDateString();
          }
          break;
        default:
          groupKey = 'All Notifications';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
      return groups;
    }, {} as Record<string, StoredNotification[]>);
  }, [filteredAndSortedNotifications, enableGrouping, state.viewSettings.groupBy]);

  const selectedCount = state.selectedNotifications.length;
  const isAllSelected = selectedCount === filteredAndSortedNotifications.length && filteredAndSortedNotifications.length > 0;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = useCallback(async () => {
    setState(prev => ({ ...prev, isRefreshing: true }));
    
    try {
      // In a real app, you'd call an API to refresh notifications
      await new Promise(resolve => setTimeout(resolve, 1000));
      setState(prev => ({ 
        ...prev, 
        isRefreshing: false, 
        lastRefresh: new Date(),
        error: null
      }));
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        isRefreshing: false,
        error: err instanceof Error ? err.message : 'Failed to refresh'
      }));
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const handleFilterChange = useCallback((newFilter: Partial<NotificationFilter>) => {
    setState(prev => ({ 
      ...prev, 
      filter: { ...prev.filter, ...newFilter }
    }));
  }, []);

  const handleSortChange = useCallback((newSort: Partial<NotificationSort>) => {
    setState(prev => ({ 
      ...prev, 
      sort: { ...prev.sort, ...newSort }
    }));
  }, []);

  const handleViewSettingsChange = useCallback((newSettings: Partial<ViewSettings>) => {
    const updatedSettings = { ...state.viewSettings, ...newSettings };
    setViewSettings(updatedSettings);
    setState(prev => ({ 
      ...prev, 
      viewSettings: updatedSettings
    }));
  }, [state.viewSettings, setViewSettings]);

  const handleNotificationSelect = useCallback((notificationId: string, selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedNotifications: selected
        ? [...prev.selectedNotifications, notificationId]
        : prev.selectedNotifications.filter(id => id !== notificationId)
    }));
  }, []);

  const handleSelectAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedNotifications: isAllSelected 
        ? [] 
        : filteredAndSortedNotifications.map(n => n.id)
    }));
  }, [isAllSelected, filteredAndSortedNotifications]);

  const handleBulkAction = useCallback(async (action: string) => {
    const selectedNotifications = state.selectedNotifications;
    
    if (selectedNotifications.length === 0) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      switch (action) {
        case 'mark-read':
          await Promise.all(selectedNotifications.map(id => markAsRead(id)));
          break;
        case 'archive':
          if (enableArchiving) {
            await Promise.all(selectedNotifications.map(id => archiveNotification(id)));
          }
          break;
        case 'delete':
          await Promise.all(selectedNotifications.map(id => deleteNotification(id)));
          break;
      }

      setState(prev => ({ 
        ...prev, 
        selectedNotifications: [],
        isLoading: false,
        error: null
      }));
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: err instanceof Error ? err.message : 'Bulk action failed'
      }));
    }
  }, [markAsRead, archiveNotification, deleteNotification, enableArchiving, state.selectedNotifications]);

  const handleNotificationClick = useCallback(async (notification: StoredNotification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Handle deep linking from metadata
    const metadata = notification.metadata as { deepLink?: string; webUrl?: string } | undefined;
    if (metadata?.deepLink) {
      window.location.href = metadata.deepLink;
    } else if (metadata?.webUrl) {
      window.open(metadata.webUrl, '_blank');
    }

    // Custom action handler
    if (onActionClick) {
      onActionClick('click', notification);
    }
  }, [markAsRead, onActionClick]);

  const handleToggleExpanded = useCallback((notificationId: string) => {
    setState(prev => ({
      ...prev,
      expandedNotifications: prev.expandedNotifications.includes(notificationId)
        ? prev.expandedNotifications.filter(id => id !== notificationId)
        : [...prev.expandedNotifications, notificationId]
    }));
  }, []);

  const handleExport = useCallback(() => {
    if (onExport) {
      // Cast to Notification[] to bypass type mismatch - the function expects Notification but we have StoredNotification
      const notificationsToExport = state.selectedNotifications.length > 0 
        ? notifications.filter(n => state.selectedNotifications.includes(n.id))
        : filteredAndSortedNotifications;
      onExport(notificationsToExport as unknown as Notification[]);
    }
  }, [onExport, state.selectedNotifications, notifications, filteredAndSortedNotifications]);

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================

  useEffect(() => {
    if (!enableKeyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search on Ctrl/Cmd + F
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Select all on Ctrl/Cmd + A
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        handleSelectAll();
      }

      // Mark selected as read on R
      if (e.key === 'r' && state.selectedNotifications.length > 0) {
        e.preventDefault();
        handleBulkAction('mark-read');
      }

      // Delete selected on Delete
      if (e.key === 'Delete' && state.selectedNotifications.length > 0) {
        e.preventDefault();
        handleBulkAction('delete');
      }

      // Archive selected on A
      if (e.key === 'a' && state.selectedNotifications.length > 0 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleBulkAction('archive');
      }

      // Toggle filters on F
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setState(prev => ({ ...prev, showFilters: !prev.showFilters }));
      }

      // Refresh on Ctrl/Cmd + R
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        handleRefresh();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    enableKeyboardNavigation,
    state.selectedNotifications.length,
    handleSelectAll,
    handleBulkAction,
    handleRefresh
  ]);

  // ============================================================================
  // AUTO REFRESH
  // ============================================================================

  useEffect(() => {
    if (!autoRefreshInterval || !realTime) return;

    const interval = setInterval(handleRefresh, autoRefreshInterval);
    return () => clearInterval(interval);
  }, [autoRefreshInterval, realTime, handleRefresh]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHeader = () => (
    <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        <BellIconSolid className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          {showCount && (
            <p className="text-sm text-gray-500">
              {unreadCount} unread • {filteredAndSortedNotifications.length} total
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={state.isRefreshing}
          className="relative"
        >
          <ArrowPathIcon className={clsx(
            "w-4 h-4",
            state.isRefreshing && "animate-spin"
          )} />
        </Button>

        {enableFiltering && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
            className={clsx(state.showFilters && "bg-gray-100")}
          >
            <FunnelIcon className="w-4 h-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setState(prev => ({ ...prev, showSettings: !prev.showSettings }))}
          className={clsx(state.showSettings && "bg-gray-100")}
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4" />
        </Button>

        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <XMarkIcon className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );

  const renderSearchAndFilters = () => (
    <AnimatePresence>
      {(enableSearch || state.showFilters) && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-b bg-gray-50"
        >
          <div className="p-4 space-y-3">
            {enableSearch && (
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search notifications..."
                  value={state.searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {state.showFilters && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <select
                  value={state.filter.status || 'all'}
                  onChange={(e) => handleFilterChange({ status: e.target.value as 'read' | 'unread' | 'all' })}
                  className="rounded-md border-gray-300 text-sm"
                  aria-label="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>

                <select
                  value={state.filter.priority || ''}
                  onChange={(e) => handleFilterChange({ priority: e.target.value as NotificationPriority || undefined })}
                  className="rounded-md border-gray-300 text-sm"
                  aria-label="Filter by priority"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                  <option value="critical">Critical</option>
                </select>

                {enableCategories && (
                  <select
                    value={state.filter.category || ''}
                    onChange={(e) => handleFilterChange({ category: e.target.value as NotificationCategory || undefined })}
                    className="rounded-md border-gray-300 text-sm"
                    aria-label="Filter by category"
                  >
                    <option value="">All Categories</option>
                    <option value="transactional">Transactional</option>
                    <option value="marketing">Marketing</option>
                    <option value="operational">Operational</option>
                    <option value="security">Security</option>
                    <option value="social">Social</option>
                    <option value="system">System</option>
                  </select>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState(prev => ({ 
                    ...prev, 
                    filter: { status: 'all' },
                    searchQuery: ''
                  }))}
                  className="text-xs"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderBulkActions = () => {
    if (!enableBulkActions || selectedCount === 0) return null;

    return (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-blue-50 border-b px-4 py-2"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-700">
            {selectedCount} selected
          </span>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkAction('mark-read')}
              disabled={state.isLoading}
            >
              <CheckIcon className="w-4 h-4 mr-1" />
              Mark Read
            </Button>

            {enableArchiving && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkAction('archive')}
                disabled={state.isLoading}
              >
                <ArchiveBoxIcon className="w-4 h-4 mr-1" />
                Archive
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkAction('delete')}
              disabled={state.isLoading}
              className="text-red-600 hover:text-red-700"
            >
              <TrashIcon className="w-4 h-4 mr-1" />
              Delete
            </Button>

            {onExport && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExport}
                disabled={state.isLoading}
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                Export
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderNotificationItem = (notification: StoredNotification) => {
    const isSelected = state.selectedNotifications.includes(notification.id);
    const isExpanded = state.expandedNotifications.includes(notification.id);
    const isUnread = !notification.isRead;
    const categoryKey = notification.category ?? 'system';
    const CategoryIcon = CATEGORY_ICONS[categoryKey as keyof typeof CATEGORY_ICONS] ?? CATEGORY_ICONS.system;
    const metadata = notification.metadata as { image?: { url: string; alt?: string }; channels?: string[]; tags?: string[]; actions?: Array<{ label: string; onClick: () => void }> } | undefined;

    return (
      <motion.div
        key={notification.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={clsx(
          "border-b border-gray-100 hover:bg-gray-50 transition-colors",
          isSelected && "bg-blue-50 border-blue-200",
          isUnread && "bg-blue-25"
        )}
      >
        <div className="p-4">
          <div className="flex items-start space-x-3">
            {enableBulkActions && (
              <div className="mt-1">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handleNotificationSelect(notification.id, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  aria-label={`Select notification: ${notification.title}`}
                />
              </div>
            )}

            {state.viewSettings.showImages && metadata?.image && (
              <div className="flex-shrink-0">
                <Image
                  src={metadata.image.url}
                  alt={metadata.image.alt || notification.title || 'Notification'}
                  width={40}
                  height={40}
                  className="rounded-lg object-cover"
                />
              </div>
            )}

            {!metadata?.image && CategoryIcon && (
              <div className="flex-shrink-0 mt-1">
                <CategoryIcon className="w-5 h-5 text-gray-400" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className={clsx(
                    "text-sm font-medium text-gray-900 line-clamp-2",
                    isUnread && "font-semibold"
                  )}>
                    {notification.title}
                  </h4>
                  
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {notification.message}
                  </p>

                  <div className="flex items-center space-x-4 mt-2">
                    {state.viewSettings.showTimestamp && (
                      <span className="text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    )}

                    {state.viewSettings.showPriority && notification.priority && (
                      <Badge
                        variant="secondary"
                        className={clsx(
                          "text-xs",
                          PRIORITY_COLORS[notification.priority]
                        )}
                      >
                        {notification.priority}
                      </Badge>
                    )}

                    {state.viewSettings.showCategory && notification.category && (
                      <Badge variant="outline" className="text-xs">
                        {notification.category}
                      </Badge>
                    )}

                    {state.viewSettings.showChannel && metadata?.channels && (
                      <span className="text-xs text-gray-400">
                        via {metadata.channels.join(', ')}
                      </span>
                    )}

                    {metadata?.tags && metadata.tags.length > 0 && (
                      <div className="flex items-center space-x-1">
                        {metadata.tags.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {metadata.tags.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{metadata.tags.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1 ml-2">
                  {isUnread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}

                  {state.viewSettings.showActions && enableQuickActions && (
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationClick(notification);
                        }}
                        className="p-1 h-6 w-6"
                      >
                        {isUnread ? <EyeIcon className="w-3 h-3" /> : <EyeSlashIcon className="w-3 h-3" />}
                      </Button>

                      {enableArchiving && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveNotification(notification.id);
                          }}
                          className="p-1 h-6 w-6"
                        >
                          <ArchiveBoxIcon className="w-3 h-3" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </Button>

                      {metadata?.actions && metadata.actions.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleExpanded(notification.id);
                          }}
                          className="p-1 h-6 w-6"
                        >
                          {isExpanded ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && metadata?.actions && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 pt-3 border-t border-gray-100"
                  >
                    <div className="flex flex-wrap gap-2">
                      {metadata.actions.map((action: { id?: string; label: string; style?: string; onClick: () => void }) => (
                        <Button
                          key={action.id ?? action.label}
                          variant={action.style === 'primary' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => onActionClick && onActionClick(action.id ?? action.label, notification)}
                          className="text-xs"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderNotificationsList = () => {
    if (state.isLoading && filteredAndSortedNotifications.length === 0) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        </div>
      );
    }

    if (filteredAndSortedNotifications.length === 0) {
      return showEmptyState ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <InboxArrowDownIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">{emptyStateMessage}</p>
          </div>
        </div>
      ) : null;
    }

    return (
      <div className="divide-y divide-gray-100">
        {Object.entries(groupedNotifications).map(([groupName, groupNotifications]) => (
          <div key={groupName}>
            {enableGrouping && state.viewSettings.groupBy !== 'none' && (
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h3 className="text-sm font-medium text-gray-700">{groupName}</h3>
                <span className="text-xs text-gray-500">{groupNotifications.length} notification{groupNotifications.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            
            <AnimatePresence mode="popLayout">
              {groupNotifications.map((notification: StoredNotification) => 
                notificationRenderer ? 
                  notificationRenderer(notification) : 
                  renderNotificationItem(notification)
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    );
  };

  const renderSettings = () => {
    if (!state.showSettings) return null;

    return (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="border-b bg-gray-50"
      >
        <div className="p-4 space-y-4">
          <h3 className="text-sm font-medium text-gray-700">View Settings</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">Layout</label>
              <select
                value={state.viewSettings.layout}
                onChange={(e) => handleViewSettingsChange({ layout: e.target.value as 'list' | 'grid' | 'compact' })}
                className="mt-1 w-full rounded-md border-gray-300 text-sm"
                aria-label="Select layout"
              >
                <option value="list">List</option>
                <option value="grid">Grid</option>
                <option value="compact">Compact</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Group By</label>
              <select
                value={state.viewSettings.groupBy}
                onChange={(e) => handleViewSettingsChange({ groupBy: e.target.value as 'type' | 'category' | 'priority' | 'date' | 'none' })}
                className="mt-1 w-full rounded-md border-gray-300 text-sm"
                aria-label="Group notifications by"
              >
                <option value="none">None</option>
                <option value="type">Type</option>
                <option value="category">Category</option>
                <option value="priority">Priority</option>
                <option value="date">Date</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Sort By</label>
              <select
                value={state.sort.field}
                onChange={(e) => handleSortChange({ field: e.target.value as 'createdAt' | 'priority' | 'type' | 'category' })}
                className="mt-1 w-full rounded-md border-gray-300 text-sm"
                aria-label="Sort notifications by"
              >
                <option value="createdAt">Date</option>
                <option value="priority">Priority</option>
                <option value="type">Type</option>
                <option value="category">Category</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Sort Order</label>
              <select
                value={state.sort.direction}
                onChange={(e) => handleSortChange({ direction: e.target.value as 'asc' | 'desc' })}
                className="mt-1 w-full rounded-md border-gray-300 text-sm"
                aria-label="Sort order"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600">Show Images</label>
              <Switch
                checked={state.viewSettings.showImages}
                onCheckedChange={(checked) => handleViewSettingsChange({ showImages: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600">Show Actions</label>
              <Switch
                checked={state.viewSettings.showActions}
                onCheckedChange={(checked) => handleViewSettingsChange({ showActions: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600">Show Timestamp</label>
              <Switch
                checked={state.viewSettings.showTimestamp}
                onCheckedChange={(checked) => handleViewSettingsChange({ showTimestamp: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600">Show Priority</label>
              <Switch
                checked={state.viewSettings.showPriority}
                onCheckedChange={(checked) => handleViewSettingsChange({ showPriority: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600">Show Category</label>
              <Switch
                checked={state.viewSettings.showCategory}
                onCheckedChange={(checked) => handleViewSettingsChange({ showCategory: checked })}
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderFooter = () => {
    if (!state.lastRefresh && !markAllAsRead) return null;

    return (
      <div className="p-4 border-t bg-gray-50 text-center">
        <div className="flex items-center justify-between">
          {state.lastRefresh && (
            <span className="text-xs text-gray-500">
              Last updated: {state.lastRefresh.toLocaleTimeString()}
            </span>
          )}
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <CheckIconSolid className="w-3 h-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div
      ref={containerRef}
      className={clsx(
        "bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden",
        "flex flex-col",
        position === 'fullscreen' && "fixed inset-4 z-50",
        className
      )}
      data-max-height={typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight}
      data-width={typeof width === 'number' ? `${width}px` : width}
    >
      {renderHeader()}
      {renderSearchAndFilters()}
      {renderSettings()}
      {renderBulkActions()}
      
      <div className="flex-1 overflow-y-auto">
        {state.error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{state.error}</p>
              </div>
            </div>
          </div>
        )}
        
        {renderNotificationsList()}
      </div>
      
      {renderFooter()}
    </div>
  );
};

export default NotificationCenter;
