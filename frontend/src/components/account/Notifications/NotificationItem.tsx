'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon,
  ArchiveBoxIcon,
  BookmarkIcon,
  StarIcon,
  ShareIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import {
  BookmarkIcon as BookmarkIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import type { Notification, NotificationPriority } from '@/types/notification.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface NotificationItemProps {
  /** The notification object */
  notification: Notification;
  
  /** Whether the notification is selected */
  selected?: boolean;
  
  /** Callback when notification is clicked */
  onClick?: (notification: Notification) => void;
  
  /** Callback when mark as read */
  onMarkAsRead?: (notificationId: string) => void;
  
  /** Callback when mark as unread */
  onMarkAsUnread?: (notificationId: string) => void;
  
  /** Callback when delete */
  onDelete?: (notificationId: string) => void;
  
  /** Callback when archive */
  onArchive?: (notificationId: string) => void;
  
  /** Callback when bookmark */
  onBookmark?: (notificationId: string) => void;
  
  /** Callback when star */
  onStar?: (notificationId: string) => void;
  
  /** Callback when share */
  onShare?: (notification: Notification) => void;
  
  /** Callback when action button clicked */
  onActionClick?: (action: string, notification: Notification) => void;
  
  /** Show actions menu */
  showActions?: boolean;
  
  /** Compact mode */
  compact?: boolean;
  
  /** Show image */
  showImage?: boolean;
  
  /** Show category badge */
  showCategory?: boolean;
  
  /** Show priority indicator */
  showPriority?: boolean;
  
  /** Show timestamp */
  showTimestamp?: boolean;
  
  /** Enable animations */
  animated?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const NOTIFICATION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  order_update: CheckCircleIcon,
  payment_confirmation: CheckCircleIcon,
  shipping_update: BellIcon,
  product_alert: InformationCircleIcon,
  price_drop: ExclamationTriangleIcon,
  stock_alert: InformationCircleIcon,
  wishlist_update: BellIcon,
  promotion: BellIcon,
  sale_alert: ExclamationTriangleIcon,
  review_request: BellIcon,
  account_security: ExclamationTriangleIcon,
  newsletter: BellIcon,
  reminder: ClockIcon,
  announcement: InformationCircleIcon,
  system_alert: ExclamationTriangleIcon,
  social_activity: BellIcon,
  recommendation: InformationCircleIcon,
  milestone: StarIcon,
  support_update: InformationCircleIcon,
  survey_invitation: BellIcon,
  app_update: InformationCircleIcon,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  order_update: 'text-green-600 bg-green-50',
  payment_confirmation: 'text-green-600 bg-green-50',
  shipping_update: 'text-blue-600 bg-blue-50',
  product_alert: 'text-purple-600 bg-purple-50',
  price_drop: 'text-orange-600 bg-orange-50',
  stock_alert: 'text-cyan-600 bg-cyan-50',
  wishlist_update: 'text-pink-600 bg-pink-50',
  promotion: 'text-yellow-600 bg-yellow-50',
  sale_alert: 'text-red-600 bg-red-50',
  review_request: 'text-indigo-600 bg-indigo-50',
  account_security: 'text-red-600 bg-red-50',
  newsletter: 'text-teal-600 bg-teal-50',
  reminder: 'text-amber-600 bg-amber-50',
  announcement: 'text-blue-600 bg-blue-50',
  system_alert: 'text-red-600 bg-red-50',
  social_activity: 'text-purple-600 bg-purple-50',
  recommendation: 'text-indigo-600 bg-indigo-50',
  milestone: 'text-yellow-600 bg-yellow-50',
  support_update: 'text-cyan-600 bg-cyan-50',
  survey_invitation: 'text-teal-600 bg-teal-50',
  app_update: 'text-blue-600 bg-blue-50',
};

const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  critical: 'border-l-4 border-red-600',
  urgent: 'border-l-4 border-red-500',
  high: 'border-l-4 border-orange-500',
  normal: 'border-l-4 border-blue-500',
  low: 'border-l-4 border-gray-400',
};

const CATEGORY_COLORS: Record<string, string> = {
  marketing: 'bg-purple-100 text-purple-800',
  transactional: 'bg-green-100 text-green-800',
  system: 'bg-gray-100 text-gray-800',
  social: 'bg-blue-100 text-blue-800',
  promotional: 'bg-orange-100 text-orange-800',
  informational: 'bg-cyan-100 text-cyan-800',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * NotificationItem Component
 * 
 * Displays a single notification with comprehensive features including:
 * - Rich notification types with icons and colors
 * - Read/unread states
 * - Priority indicators
 * - Category badges
 * - Interactive actions (mark read, delete, archive, bookmark, star, share)
 * - Expandable content
 * - Action buttons
 * - Timestamps
 * - Images
 * - Compact and full view modes
 * - Smooth animations
 * 
 * @example
 * ```tsx
 * <NotificationItem
 *   notification={notification}
 *   onMarkAsRead={handleMarkAsRead}
 *   onDelete={handleDelete}
 *   showActions={true}
 *   animated={true}
 * />
 * ```
 */
export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  selected = false,
  onClick,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  onArchive,
  onBookmark,
  onStar,
  onShare,
  onActionClick,
  showActions = true,
  compact = false,
  showImage = true,
  showCategory = true,
  showPriority = true,
  showTimestamp = true,
  animated = true,
  className,
}) => {
  // State
  const [expanded, setExpanded] = useState(false);

  // Computed values
  const isRead = useMemo(() => notification.tracking?.readAt != null, [notification.tracking]);
  const isBookmarked = useMemo(() => (notification.metadata as Record<string, unknown>)?.bookmarked === true, [notification.metadata]);
  const isStarred = useMemo(() => (notification.metadata as Record<string, unknown>)?.starred === true, [notification.metadata]);
  
  const Icon = NOTIFICATION_ICONS[notification.type] || BellIcon;
  const iconColor = NOTIFICATION_COLORS[notification.type] || 'text-gray-600 bg-gray-50';
  const priorityBorder = PRIORITY_COLORS[notification.priority] || '';
  const categoryColor = CATEGORY_COLORS[notification.category] || 'bg-gray-100 text-gray-800';

  // Handlers
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(notification);
    }
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  }, [notification, onClick, onMarkAsRead, isRead]);

  const handleMarkAsRead = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  }, [notification.id, onMarkAsRead]);

  const handleMarkAsUnread = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkAsUnread) {
      onMarkAsUnread(notification.id);
    }
  }, [notification.id, onMarkAsUnread]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  }, [notification.id, onDelete]);

  const handleArchive = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onArchive) {
      onArchive(notification.id);
    }
  }, [notification.id, onArchive]);

  const handleBookmark = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookmark) {
      onBookmark(notification.id);
    }
  }, [notification.id, onBookmark]);

  const handleStar = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStar) {
      onStar(notification.id);
    }
  }, [notification.id, onStar]);

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(notification);
    }
  }, [notification, onShare]);

  const handleActionClick = useCallback((action: { id: string; label: string; url?: string }, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onActionClick) {
      onActionClick(action.id, notification);
    }
  }, [notification, onActionClick]);

  const toggleExpanded = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  }, [expanded]);

  // Format timestamp
  const timeAgo = useMemo(() => {
    try {
      const date = typeof notification.createdAt === 'string' 
        ? new Date(notification.createdAt)
        : notification.createdAt;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  }, [notification.createdAt]);

  // Animation variants
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -100 },
  };

  const contentVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: { height: 'auto', opacity: 1 },
  };

  // Render component
  return (
    <motion.div
      variants={animated ? itemVariants : undefined}
      initial={animated ? 'initial' : undefined}
      animate={animated ? 'animate' : undefined}
      exit={animated ? 'exit' : undefined}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      className={cn(
        'group relative flex gap-3 p-4 rounded-lg border transition-all cursor-pointer',
        isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100 border-blue-200',
        selected && 'ring-2 ring-primary-500 bg-primary-50',
        showPriority && priorityBorder,
        compact && 'p-3 gap-2',
        className
      )}
    >
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 rounded-full p-2',
        iconColor,
        compact && 'p-1.5'
      )}>
        <Icon className={cn('w-5 h-5', compact && 'w-4 h-4')} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              'font-semibold text-gray-900 truncate',
              compact && 'text-sm',
              !isRead && 'font-bold'
            )}>
              {notification.title}
            </h4>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {showCategory ? (
              <Badge variant="secondary" size="sm" className={categoryColor}>
                {notification.category}
              </Badge>
            ) : null}
            
            {isBookmarked ? (
              <BookmarkIconSolid className="w-4 h-4 text-yellow-500" />
            ) : null}
            
            {isStarred ? (
              <StarIconSolid className="w-4 h-4 text-yellow-500" />
            ) : null}

            {!isRead ? (
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
            ) : null}
          </div>
        </div>

        {/* Message */}
        <p className={cn(
          'text-gray-700 line-clamp-2',
          compact ? 'text-xs' : 'text-sm',
          expanded && 'line-clamp-none'
        )}>
          {String(notification.message || '')}
        </p>

        {/* Expanded Content */}
        <AnimatePresence>
          {expanded && notification.content?.body ? (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              transition={{ duration: 0.2 }}
              className="mt-2 text-sm text-gray-600"
            >
              {notification.content.body}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Image */}
        {showImage && (notification.metadata as Record<string, unknown>)?.image ? (
          <div className="mt-2 rounded-lg overflow-hidden relative h-32">
            <Image
              src={(notification.metadata as Record<string, unknown>).image as string}
              alt={notification.title}
              fill
              className="object-cover"
            />
          </div>
        ) : null}

        {/* Action Buttons */}
        {notification.content?.actions && notification.content.actions.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {notification.content.actions.map((action) => (
              <Button
                key={action.id}
                variant={action.style === 'primary' ? 'default' : action.style === 'secondary' ? 'secondary' : 'outline'}
                size="sm"
                onClick={(e) => handleActionClick(action, e)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}

        {/* Footer */}
        <div className="mt-2 flex items-center justify-between gap-2">
          {/* Timestamp & Meta */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {showTimestamp ? (
              <>
                <ClockIcon className="w-3.5 h-3.5" />
                <span>{timeAgo}</span>
              </>
            ) : null}
            
            {notification.tracking?.opened ? (
              <div className="flex items-center gap-1">
                <EyeIcon className="w-3.5 h-3.5" />
                <span>Viewed</span>
              </div>
            ) : null}
          </div>

          {/* Quick Actions */}
          {showActions ? (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isRead ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAsRead}
                  title="Mark as read"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAsUnread}
                  title="Mark as unread"
                >
                  <EyeSlashIcon className="w-4 h-4" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                title="Bookmark"
              >
                {isBookmarked ? (
                  <BookmarkIconSolid className="w-4 h-4 text-yellow-500" />
                ) : (
                  <BookmarkIcon className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleStar}
                title="Star"
              >
                {isStarred ? (
                  <StarIconSolid className="w-4 h-4 text-yellow-500" />
                ) : (
                  <StarIcon className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleArchive}
                title="Archive"
              >
                <ArchiveBoxIcon className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                title="Delete"
              >
                <TrashIcon className="w-4 h-4 text-red-500" />
              </Button>

              {onShare ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  title="Share"
                >
                  <ShareIcon className="w-4 h-4" />
                </Button>
              ) : null}

              {notification.content?.body ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleExpanded}
                  title={expanded ? 'Collapse' : 'Expand'}
                >
                  {expanded ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationItem;
