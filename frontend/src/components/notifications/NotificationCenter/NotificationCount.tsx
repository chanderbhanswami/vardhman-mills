'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  BellIcon,
  EyeIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  TagIcon,
  UsersIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  SpeakerWaveIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import {
  BellIcon as BellIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import { Tooltip } from '../../ui/Tooltip';
import { useNotification, type StoredNotification } from '@/hooks/notification/useNotification';
import { 
  type Notification, 
  type NotificationType, 
  type NotificationPriority,
  type NotificationChannel,
  type NotificationCategory 
} from '@/types/notification.types';

// ============================================================================
// INTERFACES
// ============================================================================

interface NotificationCountProps {
  /** Custom className for styling */
  className?: string;
  /** Size variant for the count display */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Style variant */
  variant?: 'badge' | 'pill' | 'simple' | 'detailed' | 'card' | 'minimal';
  /** Color theme */
  theme?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  /** Show only unread count */
  showUnreadOnly?: boolean;
  /** Show total count */
  showTotal?: boolean;
  /** Show breakdown by priority */
  showPriorityBreakdown?: boolean;
  /** Show breakdown by category */
  showCategoryBreakdown?: boolean;
  /** Show breakdown by channel */
  showChannelBreakdown?: boolean;
  /** Show breakdown by type */
  showTypeBreakdown?: boolean;
  /** Maximum count to display (shows 999+ if exceeded) */
  maxCount?: number;
  /** Enable animations */
  enableAnimations?: boolean;
  /** Enable hover effects */
  enableHover?: boolean;
  /** Enable click interactions */
  enableClick?: boolean;
  /** Show icons */
  showIcons?: boolean;
  /** Show labels */
  showLabels?: boolean;
  /** Show percentages */
  showPercentages?: boolean;
  /** Show trends */
  showTrends?: boolean;
  /** Notification channels to count */
  channels?: NotificationChannel[];
  /** Real-time updates */
  realTime?: boolean;
  /** Custom filter for counting */
  filter?: (notification: StoredNotification) => boolean;
  /** Click handler */
  onClick?: (type?: 'total' | 'unread' | NotificationPriority | NotificationCategory) => void;
  /** Auto-refresh interval (in ms) */
  autoRefreshInterval?: number;
  /** Show zero counts */
  showZeroCounts?: boolean;
  /** Compact layout */
  compact?: boolean;
  /** Horizontal layout */
  horizontal?: boolean;
  /** Show last update time */
  showLastUpdate?: boolean;
  /** Custom format for count display */
  formatCount?: (count: number) => string;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string | null;
}

interface CountBreakdown {
  total: number;
  unread: number;
  byPriority: Record<NotificationPriority, number>;
  byCategory: Record<NotificationCategory, number>;
  byChannel: Record<NotificationChannel, number>;
  byType: Record<NotificationType, number>;
  trends: {
    total: 'up' | 'down' | 'stable';
    unread: 'up' | 'down' | 'stable';
  };
  lastUpdate: Date;
}

interface CountDisplayItem {
  key: string;
  label: string;
  count: number;
  percentage?: number;
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ComponentType<{ className?: string }>;
  color: string;
  priority?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SIZE_CLASSES = {
  xs: {
    badge: 'text-xs px-1.5 py-0.5',
    text: 'text-xs',
    icon: 'w-3 h-3'
  },
  sm: {
    badge: 'text-xs px-2 py-1',
    text: 'text-sm',
    icon: 'w-4 h-4'
  },
  md: {
    badge: 'text-sm px-2.5 py-1.5',
    text: 'text-base',
    icon: 'w-5 h-5'
  },
  lg: {
    badge: 'text-base px-3 py-2',
    text: 'text-lg',
    icon: 'w-6 h-6'
  },
  xl: {
    badge: 'text-lg px-4 py-2.5',
    text: 'text-xl',
    icon: 'w-8 h-8'
  }
};

const THEME_CLASSES = {
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  primary: 'bg-blue-100 text-blue-700 border-blue-200',
  secondary: 'bg-purple-100 text-purple-700 border-purple-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200'
};

const PRIORITY_CONFIG = {
  low: { 
    icon: InformationCircleIcon, 
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    label: 'Low Priority'
  },
  normal: { 
    icon: BellIcon, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    label: 'Normal Priority'
  },
  high: { 
    icon: ExclamationTriangleIcon, 
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
    label: 'High Priority'
  },
  urgent: { 
    icon: ExclamationTriangleIconSolid, 
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    label: 'Urgent'
  },
  critical: { 
    icon: XCircleIcon, 
    color: 'text-red-700',
    bgColor: 'bg-red-200',
    label: 'Critical'
  }
};

const CATEGORY_CONFIG = {
  transactional: { 
    icon: CheckCircleIcon, 
    color: 'text-green-500',
    label: 'Transactional'
  },
  marketing: { 
    icon: TagIcon, 
    color: 'text-purple-500',
    label: 'Marketing'
  },
  operational: { 
    icon: ClockIcon, 
    color: 'text-blue-500',
    label: 'Operational'
  },
  security: { 
    icon: EyeIcon, 
    color: 'text-red-500',
    label: 'Security'
  },
  social: { 
    icon: UsersIcon, 
    color: 'text-indigo-500',
    label: 'Social'
  },
  system: { 
    icon: CheckIcon, 
    color: 'text-gray-500',
    label: 'System'
  },
  informational: { 
    icon: InformationCircleIcon, 
    color: 'text-blue-400',
    label: 'Informational'
  },
  urgent: { 
    icon: BellIconSolid, 
    color: 'text-red-600',
    label: 'Urgent'
  },
  promotional: { 
    icon: TagIcon, 
    color: 'text-pink-500',
    label: 'Promotional'
  },
  educational: { 
    icon: InformationCircleIcon, 
    color: 'text-teal-500',
    label: 'Educational'
  }
};

const CHANNEL_CONFIG = {
  push: { 
    icon: DevicePhoneMobileIcon, 
    color: 'text-green-500',
    label: 'Push'
  },
  email: { 
    icon: EnvelopeIcon, 
    color: 'text-blue-500',
    label: 'Email'
  },
  sms: { 
    icon: ChatBubbleLeftRightIcon, 
    color: 'text-purple-500',
    label: 'SMS'
  },
  in_app: { 
    icon: BellIcon, 
    color: 'text-indigo-500',
    label: 'In-App'
  },
  whatsapp: { 
    icon: ChatBubbleLeftRightIcon, 
    color: 'text-green-600',
    label: 'WhatsApp'
  },
  slack: { 
    icon: ChatBubbleLeftRightIcon, 
    color: 'text-purple-600',
    label: 'Slack'
  },
  webhook: { 
    icon: GlobeAltIcon, 
    color: 'text-gray-500',
    label: 'Webhook'
  },
  browser: { 
    icon: GlobeAltIcon, 
    color: 'text-blue-400',
    label: 'Browser'
  },
  voice: { 
    icon: SpeakerWaveIcon, 
    color: 'text-orange-500',
    label: 'Voice'
  },
  telegram: { 
    icon: ChatBubbleLeftRightIcon, 
    color: 'text-blue-600',
    label: 'Telegram'
  }
};

// ============================================================================
// NOTIFICATION COUNT COMPONENT
// ============================================================================

export const NotificationCount: React.FC<NotificationCountProps> = ({
  className,
  size = 'md',
  variant = 'badge',
  theme = 'default',
  showUnreadOnly = false,
  showTotal = true,
  showPriorityBreakdown = false,
  showCategoryBreakdown = false,
  showChannelBreakdown = false,
  showTypeBreakdown = false,
  maxCount = 999,
  enableAnimations = true,
  enableHover = true,
  enableClick = false,
  showIcons = true,
  showLabels = true,
  showPercentages = false,
  showTrends = false,
  channels = ['in_app', 'push', 'email'],
  realTime = true,
  filter,
  onClick,
  autoRefreshInterval = 30000,
  showZeroCounts = false,
  compact = false,
  horizontal = false,
  showLastUpdate = false,
  formatCount,
  loading = false,
  error = null
}) => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const {
    notifications,
    loading: hookLoading
  } = useNotification({
    channels,
    realTime,
    filter
  });

  const [breakdown, setBreakdown] = useState<CountBreakdown>({
    total: 0,
    unread: 0,
    byPriority: {
      low: 0,
      normal: 0,
      high: 0,
      urgent: 0,
      critical: 0
    },
    byCategory: {
      transactional: 0,
      marketing: 0,
      operational: 0,
      security: 0,
      social: 0,
      system: 0,
      informational: 0,
      urgent: 0,
      promotional: 0,
      educational: 0
    },
    byChannel: {
      push: 0,
      email: 0,
      sms: 0,
      in_app: 0,
      whatsapp: 0,
      slack: 0,
      webhook: 0,
      browser: 0,
      voice: 0,
      telegram: 0
    },
    byType: {} as Record<NotificationType, number>,
    trends: {
      total: 'stable',
      unread: 'stable'
    },
    lastUpdate: new Date()
  });

  const [previousCounts, setPreviousCounts] = useState({ total: 0, unread: 0 });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const processedNotifications = useMemo(() => {
    let processed = notifications;

    if (filter) {
      processed = processed.filter(filter);
    }

    return processed;
  }, [notifications, filter]);

  const currentBreakdown = useMemo(() => {
    const total = processedNotifications.length;
    const unread = processedNotifications.filter(n => !n.isRead ? new Date() : undefined).length;
    
    const newBreakdown: CountBreakdown = {
      total,
      unread,
      byPriority: {
        low: 0,
        normal: 0,
        high: 0,
        urgent: 0,
        critical: 0
      },
      byCategory: {
        transactional: 0,
        marketing: 0,
        operational: 0,
        security: 0,
        social: 0,
        system: 0,
        informational: 0,
        urgent: 0,
        promotional: 0,
        educational: 0
      },
      byChannel: {
        push: 0,
        email: 0,
        sms: 0,
        in_app: 0,
        whatsapp: 0,
        slack: 0,
        webhook: 0,
        browser: 0,
        voice: 0,
        telegram: 0
      },
      byType: {} as Record<NotificationType, number>,
      trends: {
        total: total > previousCounts.total ? 'up' : 
               total < previousCounts.total ? 'down' : 'stable',
        unread: unread > previousCounts.unread ? 'up' : 
                unread < previousCounts.unread ? 'down' : 'stable'
      },
      lastUpdate: new Date()
    };

    // Calculate breakdowns
    processedNotifications.forEach(notification => {
      // Priority breakdown
      newBreakdown.byPriority[notification.priority]++;

      // Category breakdown
      newBreakdown.byCategory[notification.category]++;

      // Channel breakdown
      notification.channels.forEach(channel => {
        if (channel in newBreakdown.byChannel) {
          newBreakdown.byChannel[channel]++;
        }
      });

      // Type breakdown
      if (!newBreakdown.byType[notification.type]) {
        newBreakdown.byType[notification.type] = 0;
      }
      newBreakdown.byType[notification.type]++;
    });

    // Calculate trends
    newBreakdown.trends = {
      total: newBreakdown.total > previousCounts.total ? 'up' : 
             newBreakdown.total < previousCounts.total ? 'down' : 'stable',
      unread: newBreakdown.unread > previousCounts.unread ? 'up' : 
              newBreakdown.unread < previousCounts.unread ? 'down' : 'stable'
    };

    return newBreakdown;
  }, [processedNotifications, previousCounts]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    setBreakdown(currentBreakdown);
    setPreviousCounts({
      total: currentBreakdown.total,
      unread: currentBreakdown.unread
    });
  }, [currentBreakdown]);

  useEffect(() => {
    if (!autoRefreshInterval || !realTime) return;

    const interval = setInterval(() => {
      setBreakdown(prev => ({
        ...prev,
        lastUpdate: new Date()
      }));
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshInterval, realTime]);

  // ============================================================================
  // HELPERS
  // ============================================================================

  const formatCountDisplay = useCallback((count: number): string => {
    if (formatCount) {
      return formatCount(count);
    }

    if (count > maxCount) {
      return `${maxCount}+`;
    }

    return count.toLocaleString();
  }, [formatCount, maxCount]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return ArrowTrendingUpIcon;
      case 'down':
        return ArrowTrendingDownIcon;
      default:
        return null;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const handleClick = useCallback((type?: 'total' | 'unread' | NotificationPriority | NotificationCategory) => {
    if (enableClick && onClick) {
      onClick(type);
    }
  }, [enableClick, onClick]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderBreakdownItem = (item: CountDisplayItem) => {
    if (!showZeroCounts && item.count === 0) {
      return null;
    }

    const IconComponent = item.icon;
    const percentage = item.percentage;

    return (
      <motion.div
        key={item.key}
        className={clsx(
          'flex items-center justify-between p-2 rounded-md',
          'hover:bg-gray-50 transition-colors',
          enableClick && 'cursor-pointer',
          compact && 'p-1'
        )}
        onClick={() => handleClick(item.key as 'total' | 'unread' | NotificationPriority | NotificationCategory)}
        initial={enableAnimations ? { opacity: 0, x: -20 } : {}}
        animate={enableAnimations ? { opacity: 1, x: 0 } : {}}
        whileHover={enableHover ? { backgroundColor: 'rgba(0,0,0,0.02)' } : {}}
      >
        <div className="flex items-center space-x-2">
          {showIcons && IconComponent && (
            <IconComponent className={clsx(SIZE_CLASSES[size].icon, item.color)} />
          )}
          
          {showLabels && (
            <span className={clsx(SIZE_CLASSES[size].text, 'text-gray-700')}>
              {item.label}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className={clsx(SIZE_CLASSES[size].text, 'font-semibold', item.color)}>
            {formatCountDisplay(item.count)}
          </span>

          {showPercentages && percentage !== undefined && (
            <span className={clsx(SIZE_CLASSES[size].text, 'text-gray-500')}>
              ({percentage.toFixed(1)}%)
            </span>
          )}

          {showTrends && item.trend && (
            <div className={clsx(SIZE_CLASSES[size].icon, getTrendColor(item.trend))}>
              {getTrendIcon(item.trend) && React.createElement(getTrendIcon(item.trend)!, {
                className: SIZE_CLASSES[size].icon
              })}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderSimpleBadge = () => {
    const count = showUnreadOnly ? breakdown.unread : breakdown.total;
    
    if (count === 0 && !showZeroCounts) {
      return null;
    }

    return (
      <Badge
        variant={theme === 'default' ? 'secondary' : 'default'}
        className={clsx(
          SIZE_CLASSES[size].badge,
          THEME_CLASSES[theme],
          enableClick && 'cursor-pointer',
          enableHover && 'hover:opacity-80 transition-opacity',
          className
        )}
        onClick={() => handleClick(showUnreadOnly ? 'unread' : 'total')}
      >
        {enableAnimations ? (
          <motion.span
            key={count}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {formatCountDisplay(count)}
          </motion.span>
        ) : (
          formatCountDisplay(count)
        )}
      </Badge>
    );
  };

  const renderDetailedView = () => {
    const items: CountDisplayItem[] = [];

    // Add total and unread counts
    if (showTotal) {
      items.push({
        key: 'total',
        label: 'Total',
        count: breakdown.total,
        trend: showTrends ? breakdown.trends.total : undefined,
        icon: BellIcon,
        color: 'text-blue-500',
        priority: 1
      });
    }

    if (!showUnreadOnly || showTotal) {
      items.push({
        key: 'unread',
        label: 'Unread',
        count: breakdown.unread,
        trend: showTrends ? breakdown.trends.unread : undefined,
        icon: BellIconSolid,
        color: 'text-red-500',
        priority: 2
      });
    }

    // Add priority breakdown
    if (showPriorityBreakdown) {
      Object.entries(breakdown.byPriority).forEach(([priority, count]) => {
        const config = PRIORITY_CONFIG[priority as NotificationPriority];
        items.push({
          key: priority,
          label: config.label,
          count,
          percentage: showPercentages ? (count / breakdown.total) * 100 : undefined,
          icon: config.icon,
          color: config.color,
          priority: 10
        });
      });
    }

    // Add category breakdown
    if (showCategoryBreakdown) {
      Object.entries(breakdown.byCategory).forEach(([category, count]) => {
        const config = CATEGORY_CONFIG[category as NotificationCategory];
        items.push({
          key: category,
          label: config.label,
          count,
          percentage: showPercentages ? (count / breakdown.total) * 100 : undefined,
          icon: config.icon,
          color: config.color,
          priority: 20
        });
      });
    }

    // Add channel breakdown
    if (showChannelBreakdown) {
      Object.entries(breakdown.byChannel).forEach(([channel, count]) => {
        const config = CHANNEL_CONFIG[channel as NotificationChannel];
        items.push({
          key: channel,
          label: config.label,
          count,
          percentage: showPercentages ? (count / breakdown.total) * 100 : undefined,
          icon: config.icon,
          color: config.color,
          priority: 30
        });
      });
    }

    // Add type breakdown
    if (showTypeBreakdown) {
      Object.entries(breakdown.byType).forEach(([type, count]) => {
        items.push({
          key: type,
          label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          count,
          percentage: showPercentages ? (count / breakdown.total) * 100 : undefined,
          icon: BellIcon,
          color: 'text-gray-500',
          priority: 40
        });
      });
    }

    // Sort items by priority and count
    items.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority! - b.priority!;
      }
      return b.count - a.count;
    });

    return (
      <div className={clsx(
        'space-y-1',
        horizontal && 'flex space-y-0 space-x-4'
      )}>
        <AnimatePresence>
          {items.map(item => renderBreakdownItem(item))}
        </AnimatePresence>
      </div>
    );
  };

  const renderCardView = () => (
    <Card className={clsx('p-4', className)}>
      <div className="space-y-3">
        {showTotal && (
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
            {showLastUpdate && (
              <span className="text-xs text-gray-500">
                {breakdown.lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        )}
        
        {renderDetailedView()}
      </div>
    </Card>
  );

  // ============================================================================
  // LOADING & ERROR STATES
  // ============================================================================

  if (loading || hookLoading) {
    return (
      <div className={clsx('animate-pulse', className)}>
        <div className={clsx(
          'bg-gray-200 rounded',
          SIZE_CLASSES[size].badge
        )} />
      </div>
    );
  }

  if (error) {
    return (
      <Tooltip content={error}>
        <Badge variant="destructive" className={clsx(SIZE_CLASSES[size].badge, className)}>
          <XCircleIcon className={SIZE_CLASSES[size].icon} />
          Error
        </Badge>
      </Tooltip>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  switch (variant) {
    case 'badge':
    case 'pill':
    case 'simple':
    case 'minimal':
      return renderSimpleBadge();
    
    case 'card':
      return renderCardView();
    
    case 'detailed':
    default:
      return (
        <div className={clsx('space-y-2', className)}>
          {renderDetailedView()}
        </div>
      );
  }
};

export default NotificationCount;
