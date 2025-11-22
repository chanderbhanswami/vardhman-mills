'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

// Utility function to convert timestamp to Date
const toDate = (timestamp: string | number | Date): Date => {
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp);
  if (typeof timestamp === 'number') return new Date(timestamp);
  return new Date();
};
import {
  BellIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
  XMarkIcon,
  EllipsisHorizontalIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  ArchiveBoxIcon,
  BookmarkIcon,
  ShareIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  BoltIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import {
  BellIcon as BellIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Switch } from '../../ui/Switch';
import { Tooltip } from '../../ui/Tooltip';
import { Checkbox } from '../../ui/Checkbox';
import { DropdownMenu } from '../../ui/DropdownMenu';
import { useNotification, type StoredNotification } from '@/hooks/notification/useNotification';
import { useLocalStorage } from '@/hooks/localStorage/useLocalStorage';
import { useClickOutside } from '@/hooks/common/useClickOutside';
import { 
  type Notification,
  type NotificationType,
  type NotificationPriority,
  type NotificationCategory, 
  type NotificationChannel,
  type NotificationFilter,
  type NotificationSortOption
} from '@/types/notification.types';

// ============================================================================
// INTERFACES
// ============================================================================

interface NotificationDropdownProps {
  /** Trigger element */
  trigger: React.ReactNode;
  /** Custom className for styling */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Position of the dropdown */
  position?: 'left' | 'right' | 'center';
  /** Maximum height of the dropdown */
  maxHeight?: string | number;
  /** Maximum width of the dropdown */
  maxWidth?: string | number;
  /** Show header */
  showHeader?: boolean;
  /** Show footer */
  showFooter?: boolean;
  /** Show search */
  showSearch?: boolean;
  /** Show filters */
  showFilters?: boolean;
  /** Show actions */
  showActions?: boolean;
  /** Show bulk actions */
  showBulkActions?: boolean;
  /** Show settings */
  showSettings?: boolean;
  /** Maximum notifications to display */
  maxNotifications?: number;
  /** Enable virtualization for large lists */
  enableVirtualization?: boolean;
  /** Auto-close on outside click */
  autoClose?: boolean;
  /** Auto-close on action */
  autoCloseOnAction?: boolean;
  /** Real-time updates */
  realTime?: boolean;
  /** Default filter */
  defaultFilter?: NotificationFilter;
  /** Default sort */
  defaultSort?: NotificationSortOption;
  /** Channels to display */
  channels?: NotificationChannel[];
  /** Custom notification renderer */
  notificationRenderer?: (notification: StoredNotification) => React.ReactNode;
  /** Custom empty state */
  emptyState?: React.ReactNode;
  /** Custom loading state */
  loadingState?: React.ReactNode;
  /** Custom error state */
  errorState?: React.ReactNode;
  /** Action handlers */
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAsUnread?: (notificationId: string) => void;
  onArchive?: (notificationId: string) => void;
  onDelete?: (notificationId: string) => void;
  onBookmark?: (notificationId: string) => void;
  onShare?: (notificationId: string) => void;
  onBulkAction?: (action: string, notificationIds: string[]) => void;
  onSettingsChange?: (settings: DropdownSettings) => void;
  onNotificationClick?: (notification: StoredNotification) => void;
  /** Accessibility options */
  'aria-label'?: string;
  'aria-describedby'?: string;
}

interface DropdownSettings {
  showTimestamps: boolean;
  showAvatars: boolean;
  showPreviews: boolean;
  groupByDate: boolean;
  compactMode: boolean;
  enableAnimations: boolean;
  autoMarkAsRead: boolean;
  enableSounds: boolean;
  theme: 'light' | 'dark' | 'auto';
}

interface NotificationItemProps {
  notification: Notification;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onAction?: (action: string) => void;
  onClick?: () => void;
  showTimestamp?: boolean;
  showAvatar?: boolean;
  showPreview?: boolean;
  showActions?: boolean;
  compact?: boolean;
  enableAnimations?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SIZE_CLASSES = {
  sm: {
    dropdown: 'w-80 max-h-96',
    item: 'p-2 text-sm',
    avatar: 'w-8 h-8',
    badge: 'text-xs px-1.5 py-0.5'
  },
  md: {
    dropdown: 'w-96 max-h-[32rem]',
    item: 'p-3 text-sm',
    avatar: 'w-10 h-10',
    badge: 'text-xs px-2 py-1'
  },
  lg: {
    dropdown: 'w-[28rem] max-h-[36rem]',
    item: 'p-4 text-base',
    avatar: 'w-12 h-12',
    badge: 'text-sm px-2.5 py-1.5'
  },
  xl: {
    dropdown: 'w-[32rem] max-h-[40rem]',
    item: 'p-5 text-base',
    avatar: 'w-14 h-14',
    badge: 'text-sm px-3 py-2'
  }
};

const PRIORITY_CONFIG: Record<NotificationPriority, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  low: { 
    icon: InformationCircleIcon, 
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200'
  },
  normal: { 
    icon: BellIcon, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  high: { 
    icon: ExclamationTriangleIcon, 
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  urgent: { 
    icon: BoltIcon, 
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  critical: { 
    icon: XCircleIcon, 
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300'
  }
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Notifications' },
  { value: 'unread', label: 'Unread Only' },
  { value: 'starred', label: 'Starred' },
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'high_priority', label: 'High Priority' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'priority', label: 'By Priority' },
  { value: 'unread_first', label: 'Unread First' },
  { value: 'read_first', label: 'Read First' }
];

// ============================================================================
// NOTIFICATION ITEM COMPONENT
// ============================================================================

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  selected = false,
  onSelect,
  onAction,
  onClick,
  showTimestamp = true,
  showAvatar = true,
  showPreview = true,
  showActions = true,
  compact = false,
  enableAnimations = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const priorityConfig = PRIORITY_CONFIG[notification.priority];
  const PriorityIcon = priorityConfig.icon;

  const getTypeIcon = (type: string) => {
    switch (type as NotificationType) {
      case 'account_security': return ExclamationTriangleIcon;
      case 'payment_confirmation': return CheckCircleIcon;
      case 'order_update': return InformationCircleIcon;
      case 'shipping_update': return BoltIcon;
      case 'product_alert': return BellIcon;
      case 'price_drop': return TagIcon;
      case 'stock_alert': return ExclamationTriangleIcon;
      case 'promotion': return TagIcon;
      case 'sale_alert': return TagIcon;
      case 'reminder': return ClockIcon;
      case 'announcement': return BellIconSolid;
      case 'system_alert': return XCircleIcon;
      case 'social_activity': return UserIcon;
      case 'newsletter': return InformationCircleIcon;
      case 'support_update': return CheckCircleIcon;
      default: return BellIcon;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category as NotificationCategory) {
      case 'system': return BellIconSolid;
      case 'social': return UserIcon;
      case 'security': return ExclamationTriangleIcon;
      case 'transactional': return CheckCircleIcon;
      case 'marketing': return TagIcon;
      case 'operational': return BoltIcon;
      case 'promotional': return TagIcon;
      case 'urgent': return ExclamationTriangleIcon;
      default: return BellIcon;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes > 0 ? `${minutes}m ago` : 'Just now';
    }
  };

  const menuItems = [
    { 
      key: 'mark_read', 
      label: notification.isRead ? new Date() : undefined ? 'Mark as Unread' : 'Mark as Read',
      icon: notification.isRead ? new Date() : undefined ? EyeSlashIcon : EyeIcon
    },
    { 
      key: 'bookmark', 
      label: notification.tracking.bookmarkedAt ? 'Remove Bookmark' : 'Bookmark',
      icon: notification.tracking.bookmarkedAt ? BookmarkIconSolid : BookmarkIcon
    },
    { 
      key: 'star', 
      label: notification.tracking.starredAt ? 'Remove Star' : 'Star',
      icon: notification.tracking.starredAt ? StarIconSolid : StarIcon
    },
    { key: 'share', label: 'Share', icon: ShareIcon },
    { key: 'archive', label: 'Archive', icon: ArchiveBoxIcon },
    { key: 'delete', label: 'Delete', icon: TrashIcon, destructive: true }
  ];

  return (
    <motion.div
      className={clsx(
        'relative flex items-start space-x-3 p-3 border-b border-gray-100',
        'hover:bg-gray-50 transition-colors cursor-pointer',
        !notification.isRead && 'bg-blue-50/30',
        selected && 'bg-blue-100',
        compact && 'p-2 space-x-2'
      )}
      initial={enableAnimations ? { opacity: 0, y: 10 } : {}}
      animate={enableAnimations ? { opacity: 1, y: 0 } : {}}
      exit={enableAnimations ? { opacity: 0, y: -10 } : {}}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      role="listitem"
      aria-label={`Notification: ${notification.title}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="flex-shrink-0 pt-1">
          <Checkbox
            checked={selected}
            onChange={(e) => onSelect(e.target.checked)}
            aria-label={`Select notification: ${notification.title}`}
          />
        </div>
      )}

      {/* Priority Indicator */}
      <div className="flex-shrink-0 pt-1">
        <div className={clsx(
          'w-2 h-2 rounded-full',
          !notification.isRead && priorityConfig.bgColor,
          notification.isRead ? new Date() : undefined && 'bg-gray-200'
        )} />
      </div>

      {/* Avatar */}
      {showAvatar && notification.metadata?.avatar && (
        <div className="flex-shrink-0">
          <div className={clsx(
            'rounded-full overflow-hidden bg-gray-200',
            compact ? 'w-8 h-8' : 'w-10 h-10'
          )}>
            <Image
              src={notification.metadata.avatar}
              alt={notification.metadata.sender || 'Avatar'}
              width={compact ? 32 : 40}
              height={compact ? 32 : 40}
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4 className={clsx(
              'font-medium text-gray-900 truncate',
              !notification.isRead && 'font-semibold',
              compact ? 'text-sm' : 'text-base'
            )}>
              {notification.title}
            </h4>

            {/* Message Preview */}
            {showPreview && notification.message && (
              <p className={clsx(
                'text-gray-600 mt-1',
                compact ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2'
              )}>
                {notification.message}
              </p>
            )}

            {/* Metadata */}
            <div className="flex items-center space-x-2 mt-2">
              {/* Timestamp */}
              {showTimestamp && (
                <div className="flex items-center space-x-1">
                  <CalendarIcon className={clsx(
                    'text-gray-400',
                    compact ? 'w-3 h-3' : 'w-4 h-4'
                  )} />
                  <span className={clsx(
                    'text-gray-500',
                    compact ? 'text-xs' : 'text-sm'
                  )}>
                    {formatTime(toDate(notification.createdAt))}
                  </span>
                </div>
              )}

              {/* Category Badge */}
              <div className="flex items-center space-x-1">
                {React.createElement(getCategoryIcon(notification.category), {
                  className: clsx(
                    'text-gray-400',
                    compact ? 'w-3 h-3' : 'w-4 h-4'
                  )
                })}
                <Badge
                  variant="secondary"
                  className={clsx(
                    'capitalize',
                    compact ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'
                  )}
                >
                  {notification.category.replace('_', ' ')}
                </Badge>
              </div>

              {/* Type Icon */}
              <Tooltip content={`${notification.type} notification`}>
                {React.createElement(getTypeIcon(notification.type), {
                  className: clsx(
                    'text-gray-500',
                    compact ? 'w-3 h-3' : 'w-4 h-4'
                  )
                })}
              </Tooltip>

              {/* Priority Icon */}
              <Tooltip content={`${notification.priority} priority`}>
                <PriorityIcon className={clsx(
                  priorityConfig.color,
                  compact ? 'w-3 h-3' : 'w-4 h-4'
                )} />
              </Tooltip>
            </div>
          </div>

          {/* Actions */}
          <div className={clsx(
            'flex items-center space-x-1 ml-2',
            !isHovered && 'opacity-0 transition-opacity'
          )}>
            {/* Quick Actions - only show if showActions is enabled */}
            {showActions && (
              <>
                <Tooltip content={notification.isRead ? new Date() : undefined ? 'Mark as Unread' : 'Mark as Read'}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.(notification.isRead ? new Date() : undefined ? 'mark_unread' : 'mark_read');
                    }}
                  >
                    {notification.isRead ? new Date() : undefined ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </Button>
                </Tooltip>

                <Tooltip content={notification.tracking.bookmarkedAt ? 'Remove Bookmark' : 'Bookmark'}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.('bookmark');
                    }}
                  >
                    {notification.tracking.bookmarkedAt ? (
                      <BookmarkIconSolid className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <BookmarkIcon className="w-4 h-4" />
                    )}
                  </Button>
                </Tooltip>
              </>
            )}

            {/* More Actions Menu */}
            <DropdownMenu
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EllipsisHorizontalIcon className="w-4 h-4" />
                </Button>
              }
              items={menuItems.map(item => ({
                key: item.key,
                label: item.label,
                icon: item.icon,
                destructive: item.destructive,
                onClick: () => onAction?.(item.key)
              }))}
              align="end"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN DROPDOWN COMPONENT
// ============================================================================

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  trigger,
  className,
  size = 'md',
  position = 'right',
  maxHeight,
  maxWidth,
  showHeader = true,
  showFooter = true,
  showSearch = true,
  showFilters = true,
  showActions = true,
  showBulkActions = true,
  showSettings = true,
  maxNotifications = 50,
  enableVirtualization = false,
  autoClose = true,
  autoCloseOnAction = false,
  realTime = true,
  defaultFilter = 'all',
  defaultSort = 'newest',
  channels = ['in_app', 'push', 'email'],
  notificationRenderer,
  emptyState,
  loadingState,
  errorState,
  onMarkAsRead,
  onMarkAsUnread,
  onArchive,
  onDelete,
  onBookmark,
  onShare,
  onBulkAction,
  onSettingsChange,
  onNotificationClick,
  'aria-label': ariaLabel = 'Notifications dropdown',
  'aria-describedby': ariaDescribedBy
}) => {
  // ============================================================================
  // STATE & REFS
  // ============================================================================

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(defaultFilter);
  const [selectedSort, setSelectedSort] = useState(defaultSort);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  
  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    if (autoClose) {
      setIsOpen(false);
    }
  });
  const triggerRef = useRef<HTMLDivElement>(null);

  const { value: settings, setValue: setSettings } = useLocalStorage<DropdownSettings>('notification-dropdown-settings', {
    showTimestamps: true,
    showAvatars: true,
    showPreviews: true,
    groupByDate: false,
    compactMode: false,
    enableAnimations: true,
    autoMarkAsRead: false,
    enableSounds: true,
    theme: 'auto'
  });

  // ============================================================================
  // HOOKS
  // ============================================================================

  const {
    notifications: allNotifications,
    loading,
    error,
    markAsRead,
    markAsUnread,
    archiveNotification,
    deleteNotification,
    bookmarkNotification,
    shareNotification
  } = useNotification({
    channels,
    realTime
  });

  // Real-time updates effect
  useEffect(() => {
    if (realTime && isOpen) {
      const interval = setInterval(() => {
        // Trigger re-render for real-time updates
      }, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [realTime, isOpen]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredNotifications = useMemo(() => {
    let filtered = allNotifications;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(query) ||
        notification.message?.toLowerCase().includes(query) ||
        notification.metadata?.sender?.toLowerCase().includes(query)
      );
    }

    // Apply selected filter
    switch (selectedFilter) {
      case 'unread':
        filtered = filtered.filter(n => !n.isRead ? new Date() : undefined);
        break;
      case 'starred':
        filtered = filtered.filter(n => n.tracking.starredAt);
        break;
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = filtered.filter(n => n.createdAt >= today);
        break;
      case 'this_week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(n => n.createdAt >= weekAgo);
        break;
      case 'high_priority':
        filtered = filtered.filter(n => ['high', 'urgent', 'critical'].includes(n.priority));
        break;
    }

    // Apply sorting
    switch (selectedSort) {
      case 'oldest':
        filtered.sort((a, b) => toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime());
        break;
      case 'priority':
        const priorityOrder = { critical: 5, urgent: 4, high: 3, normal: 2, low: 1 };
        filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
        break;
      case 'unread_first':
        filtered.sort((a, b) => {
          if (!a.isRead ? new Date() : undefined && b.isRead ? new Date() : undefined) return -1;
          if (a.isRead ? new Date() : undefined && !b.isRead ? new Date() : undefined) return 1;
          return toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime();
        });
        break;
      case 'read_first':
        filtered.sort((a, b) => {
          if (a.isRead ? new Date() : undefined && !b.isRead ? new Date() : undefined) return -1;
          if (!a.isRead ? new Date() : undefined && b.isRead ? new Date() : undefined) return 1;
          return toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime();
        });
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime());
        break;
    }

    return filtered.slice(0, maxNotifications);
  }, [allNotifications, searchQuery, selectedFilter, selectedSort, maxNotifications]);

  const unreadCount = allNotifications.filter(n => !n.isRead ? new Date() : undefined).length;
  const selectedCount = selectedNotifications.size;
  const allSelected = filteredNotifications.length > 0 && 
    filteredNotifications.every(n => selectedNotifications.has(n.id));

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleNotificationAction = useCallback((notification: StoredNotification, action: string) => {
    switch (action) {
      case 'mark_read':
        markAsRead(notification.id);
        onMarkAsRead?.(notification.id);
        break;
      case 'mark_unread':
        markAsUnread(notification.id);
        onMarkAsUnread?.(notification.id);
        break;
      case 'archive':
        archiveNotification(notification.id);
        onArchive?.(notification.id);
        break;
      case 'delete':
        deleteNotification(notification.id);
        onDelete?.(notification.id);
        break;
      case 'bookmark':
        bookmarkNotification(notification.id);
        onBookmark?.(notification.id);
        break;
      case 'share':
        shareNotification(notification.id);
        onShare?.(notification.id);
        break;
    }

    if (autoCloseOnAction) {
      setIsOpen(false);
    }
  }, [
    markAsRead, markAsUnread, archiveNotification, deleteNotification,
    bookmarkNotification, shareNotification, autoCloseOnAction,
    onMarkAsRead, onMarkAsUnread, onArchive, onDelete, onBookmark, onShare
  ]);

  const handleNotificationClick = useCallback((notification: StoredNotification) => {
    if (settings.autoMarkAsRead && !notification.isRead) {
      markAsRead(notification.id);
    }
    onNotificationClick?.(notification);
  }, [settings.autoMarkAsRead, markAsRead, onNotificationClick]);

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    }
  }, [allSelected, filteredNotifications]);

  const handleBulkAction = useCallback((action: string) => {
    const notificationIds = Array.from(selectedNotifications);
    
    switch (action) {
      case 'mark_read':
        notificationIds.forEach(id => markAsRead(id));
        break;
      case 'mark_unread':
        notificationIds.forEach(id => markAsUnread(id));
        break;
      case 'archive':
        notificationIds.forEach(id => archiveNotification(id));
        break;
      case 'delete':
        notificationIds.forEach(id => deleteNotification(id));
        break;
    }

    onBulkAction?.(action, notificationIds);
    setSelectedNotifications(new Set());
  }, [selectedNotifications, markAsRead, markAsUnread, archiveNotification, deleteNotification, onBulkAction]);

  const handleSettingsChange = useCallback((newSettings: Partial<DropdownSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    onSettingsChange?.(updated);
  }, [settings, setSettings, onSettingsChange]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHeader = () => (
    <div className="px-4 py-3 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Notifications
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </h3>
        
        <div className="flex items-center space-x-1">
          {showSettings && (
            <Tooltip content="Settings">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettingsPanel(!showSettingsPanel)}
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}
          
          <Tooltip content="Mark all as read">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkAction('mark_read')}
              disabled={unreadCount === 0}
            >
              <CheckIcon className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      </div>
      
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="mt-3 space-y-2">
          {showSearch && (
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          
          {showFilters && (
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <DropdownMenu
                  trigger={
                    <button
                      className="w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FunnelIcon className="inline w-4 h-4 mr-2" />
                      {FILTER_OPTIONS.find(opt => opt.value === selectedFilter)?.label || 'Filter'}
                      <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4" />
                    </button>
                  }
                  items={FILTER_OPTIONS.map(option => ({
                    key: option.value,
                    label: option.label,
                    onClick: () => setSelectedFilter(option.value as NotificationFilter)
                  }))}
                  align="start"
                />
              </div>
              
              <div className="relative flex-1">
                <DropdownMenu
                  trigger={
                    <button
                      className="w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ChevronUpIcon className="inline w-4 h-4 mr-2" />
                      {SORT_OPTIONS.find(opt => opt.value === selectedSort)?.label || 'Sort'}
                      <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4" />
                    </button>
                  }
                  items={SORT_OPTIONS.map(option => ({
                    key: option.value,
                    label: option.label,
                    onClick: () => setSelectedSort(option.value as NotificationSortOption)
                  }))}
                  align="start"
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Bulk Actions */}
      {showBulkActions && selectedCount > 0 && (
        <div className="mt-3 p-2 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedCount} selected
            </span>
            
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkAction('mark_read')}
              >
                Mark Read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkAction('archive')}
              >
                Archive
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <AnimatePresence>
      {showSettingsPanel && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 py-3 border-b border-gray-200 bg-gray-50"
        >
          <Card className="p-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 flex items-center">
                <UserIcon className="w-4 h-4 mr-2" />
                Display Settings
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    Timestamps
                  </label>
                  <Switch
                    checked={settings.showTimestamps}
                    onChange={(e) => handleSettingsChange({ showTimestamps: e.target.checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 flex items-center">
                    <UserIcon className="w-4 h-4 mr-1" />
                    Avatars
                  </label>
                  <Switch
                    checked={settings.showAvatars}
                    onChange={(e) => handleSettingsChange({ showAvatars: e.target.checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">Previews</label>
                  <Switch
                    checked={settings.showPreviews}
                    onChange={(e) => handleSettingsChange({ showPreviews: e.target.checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">Compact</label>
                  <Switch
                    checked={settings.compactMode}
                    onChange={(e) => handleSettingsChange({ compactMode: e.target.checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">Auto-read</label>
                  <Switch
                    checked={settings.autoMarkAsRead}
                    onChange={(e) => handleSettingsChange({ autoMarkAsRead: e.target.checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">Animations</label>
                  <Switch
                    checked={settings.enableAnimations}
                    onChange={(e) => handleSettingsChange({ enableAnimations: e.target.checked })}
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="text-sm text-gray-700 mb-2 flex items-center">
                  <TagIcon className="w-4 h-4 mr-1" />
                  Theme
                </label>
                <div className="relative">
                  <select
                    value={settings.theme}
                    onChange={(e) => handleSettingsChange({ theme: e.target.value as 'light' | 'dark' | 'auto' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Select theme"
                    title="Select theme"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>
              
              {/* Type Filter */}
              <div className="mt-4">
                <label className="text-sm text-gray-700 mb-2 flex items-center">
                  <FunnelIcon className="w-4 h-4 mr-1" />
                  Type Filter
                </label>
                <button
                  onClick={() => setShowTypeFilter(!showTypeFilter)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {showTypeFilter ? 'Hide Filter' : 'Show Filter'}
                  <ChevronDownIcon className="inline-block w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderNotificationsList = () => {
    if (loading && loadingState) {
      return loadingState;
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <ArrowPathIcon className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading notifications...</span>
        </div>
      );
    }

    if (error && errorState) {
      return errorState;
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-8">
          <XCircleIcon className="w-6 h-6 text-red-500" />
          <span className="ml-2 text-red-600">Failed to load notifications</span>
        </div>
      );
    }

    if (filteredNotifications.length === 0 && emptyState) {
      return emptyState;
    }

    if (filteredNotifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <BellIcon className="w-12 h-12 text-gray-400 mb-2" />
          <span className="text-gray-600">No notifications found</span>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="mt-2"
            >
              Clear search
            </Button>
          )}
        </div>
      );
    }

    return (
      <div 
        className="divide-y divide-gray-100"
        role="list"
        aria-label="Notification list"
      >
        {/* Select All Checkbox */}
        {showBulkActions && filteredNotifications.length > 0 && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200" role="listitem">
            <Checkbox
              checked={allSelected}
              indeterminate={selectedCount > 0 && !allSelected}
              onChange={() => handleSelectAll()}
              label="Select all"
            />
          </div>
        )}
        
        <AnimatePresence>
          {filteredNotifications.map((notification) => (
            notificationRenderer ? (
              <div key={notification.id}>
                {notificationRenderer(notification)}
              </div>
            ) : (
              <NotificationItem
                key={notification.id}
                notification={notification}
                selected={selectedNotifications.has(notification.id)}
                onSelect={showBulkActions ? (selected) => {
                  const newSelected = new Set(selectedNotifications);
                  if (selected) {
                    newSelected.add(notification.id);
                  } else {
                    newSelected.delete(notification.id);
                  }
                  setSelectedNotifications(newSelected);
                } : undefined}
                onAction={(action) => handleNotificationAction(notification, action)}
                onClick={() => handleNotificationClick(notification)}
                showTimestamp={settings.showTimestamps}
                showAvatar={settings.showAvatars}
                showPreview={settings.showPreviews}
                showActions={showActions}
                compact={settings.compactMode}
                enableAnimations={settings.enableAnimations}
              />
            )
          ))}
        </AnimatePresence>
      </div>
    );
  };

  const renderFooter = () => (
    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {filteredNotifications.length} of {allNotifications.length} notifications
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
        >
          View All
        </Button>
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="relative" ref={triggerRef}>
      {/* Trigger */}
      <div onClick={handleToggle} role="button" tabIndex={0}>
        {trigger}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={clsx(
              'absolute z-50 mt-2 bg-white rounded-lg shadow-lg border border-gray-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              SIZE_CLASSES[size].dropdown,
              position === 'left' && 'left-0',
              position === 'right' && 'right-0',
              position === 'center' && 'left-1/2 transform -translate-x-1/2',
              className
            )}
            style={{
              maxHeight,
              maxWidth
            }}
            role="dialog"
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
          >
            {/* Header */}
            {showHeader && renderHeader()}
            
            {/* Settings Panel */}
            {renderSettings()}
            
            {/* Notifications List */}
            <div className={clsx(
              "overflow-y-auto",
              enableVirtualization ? "max-h-80" : "max-h-96"
            )}>
              {renderNotificationsList()}
            </div>
            
            {/* Footer */}
            {showFooter && renderFooter()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
