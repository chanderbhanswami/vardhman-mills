'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  BellIcon,
  BellAlertIcon,
  BellSlashIcon,
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  BellIcon as BellIconSolid,
  BellAlertIcon as BellAlertIconSolid
} from '@heroicons/react/24/solid';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import { Tooltip } from '../../ui/Tooltip';
import { Switch } from '../../ui/Switch';
import { useNotification, type StoredNotification } from '@/hooks/notification/useNotification';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useLocalStorage } from '@/hooks/localStorage/useLocalStorage';
import { 
  type NotificationType, 
  type NotificationPriority,
  type NotificationChannel 
} from '@/types/notification.types';

// ============================================================================
// INTERFACES
// ============================================================================

interface NotificationBellProps {
  /** Custom className for styling */
  className?: string;
  /** Show notification count badge */
  showCount?: boolean;
  /** Maximum count to display (shows 99+ if exceeded) */
  maxCount?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  /** Enable sound notifications */
  enableSound?: boolean;
  /** Enable desktop notifications */
  enableDesktop?: boolean;
  /** Custom click handler */
  onClick?: () => void;
  /** Custom notification sound URL */
  soundUrl?: string;
  /** Show settings button */
  showSettings?: boolean;
  /** Enable quick actions */
  enableQuickActions?: boolean;
  /** Animation type */
  animation?: 'bounce' | 'shake' | 'pulse' | 'none';
  /** Auto-clear notifications after time (in ms) */
  autoClearDelay?: number;
  /** Show priority indicators */
  showPriority?: boolean;
  /** Enable notification grouping */
  enableGrouping?: boolean;
  /** Custom notification filter */
  filter?: (notification: StoredNotification) => boolean;
  /** Enable drag and drop */
  enableDragDrop?: boolean;
  /** Position for dropdown */
  dropdownPosition?: 'left' | 'right' | 'center';
  /** Enable keyboard shortcuts */
  enableKeyboardShortcuts?: boolean;
  /** Show notification preview */
  showPreview?: boolean;
  /** Notification channels to monitor */
  channels?: NotificationChannel[];
  /** Enable real-time updates */
  realTime?: boolean;
  /** Custom notification renderer */
  notificationRenderer?: (notification: StoredNotification) => React.ReactNode;
  /** Enable notification categories filter */
  enableCategoryFilter?: boolean;
  /** Show notification history */
  showHistory?: boolean;
  /** Enable notification export */
  enableExport?: boolean;
}

interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
  sms: boolean;
  channels: NotificationChannel[];
  priorities: NotificationPriority[];
  types: NotificationType[];
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  grouping: boolean;
  autoMark: boolean;
  preview: boolean;
}

interface NotificationState {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  lastNotification: StoredNotification | null;
  settings: NotificationSettings;
  filter: {
    type?: NotificationType;
    priority?: NotificationPriority;
    unreadOnly: boolean;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  sound: true,
  desktop: true,
  email: true,
  sms: false,
  channels: ['in_app', 'push', 'email'],
  priorities: ['high', 'normal', 'low'] as NotificationPriority[],
  types: ['order_update', 'payment_confirmation', 'product_alert', 'account_security'] as NotificationType[],
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
  grouping: true,
  autoMark: false,
  preview: true
};

const SOUND_URLS = {
  default: '/sounds/notification-default.mp3',
  urgent: '/sounds/notification-urgent.mp3',
  success: '/sounds/notification-success.mp3',
  warning: '/sounds/notification-warning.mp3',
  error: '/sounds/notification-error.mp3'
};

const SIZE_CLASSES = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10'
};

const VARIANT_CLASSES = {
  default: 'text-gray-600 hover:text-gray-800',
  primary: 'text-blue-600 hover:text-blue-800',
  secondary: 'text-purple-600 hover:text-purple-800',
  accent: 'text-emerald-600 hover:text-emerald-800'
};

// ============================================================================
// NOTIFICATION BELL COMPONENT
// ============================================================================

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className,
  showCount = true,
  maxCount = 99,
  size = 'md',
  variant = 'default',
  enableSound = true,
  enableDesktop = true,
  onClick,
  soundUrl,
  showSettings = true,
  animation = 'bounce',
  autoClearDelay,
  showPriority = true,
  filter,
  enableKeyboardShortcuts = true,
  channels = ['in_app', 'push'],
  realTime = true
}) => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isFirebaseLoading,
    firebasePermission,
    requestFirebasePermission
  } = useNotification({
    enableFirebase: realTime,
    autoSyncWithBackend: realTime,
    enableBrowserNotifications: enableDesktop,
    enableSound: enableSound,
  });

  const {
    permission,
    requestPermission
  } = usePushNotifications();

  const {
    value: settings,
    setValue: setSettings
  } = useLocalStorage<NotificationSettings>('notification-settings', {
    defaultValue: DEFAULT_SETTINGS
  });

  const [state, setState] = useState<NotificationState>({
    isOpen: false,
    isLoading: false,
    error: null,
    lastNotification: null,
    settings,
    filter: {
      unreadOnly: false
    }
  });

  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply custom filter (custom filter expects StoredNotification now)
    if (filter) {
      filtered = filtered.filter(filter);
    }

    // Apply state filter
    if (state.filter.type) {
      filtered = filtered.filter((n: StoredNotification) => n.type === state.filter.type);
    }

    if (state.filter.priority) {
      filtered = filtered.filter((n: StoredNotification) => n.priority === state.filter.priority);
    }

    if (state.filter.unreadOnly) {
      filtered = filtered.filter((n: StoredNotification) => !n.isRead);
    }

    if (state.filter.dateRange) {
      filtered = filtered.filter((n: StoredNotification) => {
        const date = new Date(n.createdAt);
        return date >= state.filter.dateRange!.start && 
               date <= state.filter.dateRange!.end;
      });
    }

    return filtered;
  }, [notifications, filter, state.filter]);

  const displayCount = useMemo(() => {
    const count = showCount ? unreadCount : 0;
    return count > maxCount ? `${maxCount}+` : count.toString();
  }, [unreadCount, showCount, maxCount]);

  const hasUnread = unreadCount > 0;
  const hasHighPriority = filteredNotifications.some((n: StoredNotification) => 
    n.priority === 'high' && !n.isRead
  );

  // ============================================================================
  // SOUND MANAGEMENT
  // ============================================================================

  const initAudioContext = useCallback(() => {
    if (!audioContext && typeof window !== 'undefined') {
      try {
        const context = new (window.AudioContext || (window as unknown as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        setAudioContext(context);
      } catch (error) {
        console.warn('AudioContext not supported:', error);
      }
    }
  }, [audioContext]);

  const playNotificationSound = useCallback(async (notification: StoredNotification) => {
    if (!enableSound || !settings.sound) return;

    try {
      let url = soundUrl || SOUND_URLS.default;

      // Select sound based on priority or type
      if (notification.priority === 'high' || notification.priority === 'urgent') {
        url = SOUND_URLS.urgent;
      } else if (notification.category === 'system') {
        url = SOUND_URLS.warning;
      }

      // Play using Audio API
      const audio = new Audio(url);
      audio.volume = 0.5;
      await audio.play();
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }, [enableSound, settings.sound, soundUrl]);

  // ============================================================================
  // NOTIFICATION HANDLERS
  // ============================================================================

  const handleNewNotification = useCallback((notification: StoredNotification) => {
    setState(prev => ({
      ...prev,
      lastNotification: notification
    }));

    // Play sound
    if (settings.sound) {
      playNotificationSound(notification);
    }

    // Show desktop notification
    if (settings.desktop && enableDesktop && permission === 'granted') {
      new window.Notification(notification.title || 'Notification', {
        body: notification.message,
        icon: '/icons/notification-icon.png',
        badge: '/icons/notification-badge.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'high' || notification.priority === 'urgent'
      });
    }

    // Auto-clear if enabled
    if (autoClearDelay && notification.priority === 'low') {
      setTimeout(() => {
        markAsRead(notification.id);
      }, autoClearDelay);
    }
  }, [
    settings,
    enableDesktop,
    permission,
    autoClearDelay,
    playNotificationSound,
    markAsRead
  ]);

  const handleBellClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
    }

    // Mark notifications as read when opening
    if (!state.isOpen && settings.autoMark) {
      markAllAsRead();
    }
  }, [onClick, state.isOpen, settings.autoMark, markAllAsRead]);

  const handleSettingsClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSettingsOpen(true);
  }, []);

  const handleOutsideClick = useCallback((e: MouseEvent) => {
    const target = e.target as Element;
    if (!target.closest('[data-notification-bell]')) {
      setState(prev => ({ ...prev, isOpen: false }));
      setSettingsOpen(false);
    }
  }, []);

  // ============================================================================
  // SETTINGS HANDLERS
  // ============================================================================

  const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    setState(prev => ({
      ...prev,
      settings: newSettings
    }));
  }, [settings, setSettings]);

  const handlePermissionRequest = useCallback(async () => {
    if (permission === 'default') {
      await requestPermission();
    }
  }, [permission, requestPermission]);

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + N - Toggle notification panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
      }

      // Escape - Close notification panel
      if (e.key === 'Escape' && state.isOpen) {
        setState(prev => ({ ...prev, isOpen: false }));
      }

      // Ctrl/Cmd + Shift + R - Mark all as read
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        markAllAsRead();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [enableKeyboardShortcuts, state.isOpen, markAllAsRead]);

  // ============================================================================
  // LIFECYCLE EFFECTS
  // ============================================================================

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [handleOutsideClick]);

  useEffect(() => {
    initAudioContext();
  }, [initAudioContext]);

  // Handle new notifications from the hook (they're automatically managed by useNotification)
  useEffect(() => {
    if (notifications.length > 0 && realTime) {
      const latestNotification = notifications[0];
      if (latestNotification && !latestNotification.isRead) {
        handleNewNotification(latestNotification);
      }
    }
  }, [notifications, realTime, handleNewNotification]);

  // ============================================================================
  // ANIMATION VARIANTS
  // ============================================================================

  const bellVariants = {
    bounce: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.3 }
    },
    shake: {
      x: [0, -5, 5, -5, 5, 0],
      transition: { duration: 0.5 }
    },
    pulse: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.8, repeat: Infinity }
    },
    none: {}
  };

  const badgeVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 500,
        damping: 30
      }
    },
    exit: { 
      scale: 0, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderBellIcon = () => {
    const iconClasses = clsx(
      SIZE_CLASSES[size],
      VARIANT_CLASSES[variant],
      'transition-colors duration-200'
    );

    if (!settings.enabled) {
      return <BellSlashIcon className={iconClasses} />;
    }

    if (hasHighPriority) {
      return hasUnread ? 
        <BellAlertIconSolid className={clsx(iconClasses, 'text-red-500')} /> :
        <BellAlertIcon className={iconClasses} />;
    }

    return hasUnread ?
      <BellIconSolid className={iconClasses} /> :
      <BellIcon className={iconClasses} />;
  };

  const renderCountBadge = () => {
    if (!showCount || unreadCount === 0) return null;

    return (
      <AnimatePresence>
        <motion.div
          variants={badgeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute -top-1 -right-1 z-10"
        >
          <Badge
            variant={hasHighPriority ? "destructive" : "default"}
            className={clsx(
              "min-w-[1.25rem] h-5 flex items-center justify-center",
              "text-xs font-bold px-1.5 py-0.5",
              hasHighPriority && "animate-pulse"
            )}
          >
            {displayCount}
          </Badge>
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderPriorityIndicator = () => {
    if (!showPriority || !hasHighPriority) return null;

    return (
      <div className="absolute -top-1 -left-1 z-10">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
        <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full" />
      </div>
    );
  };

  const renderSettings = () => {
    if (!settingsOpen) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute top-full right-0 mt-2 z-50"
        >
          <Card className="w-80 p-4 shadow-lg border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Notification Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettingsOpen(false)}
              >
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Global Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enable Notifications</label>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => updateSettings({ enabled: checked })}
                />
              </div>

              {/* Sound Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Sound</label>
                <Switch
                  checked={settings.sound}
                  onCheckedChange={(checked) => updateSettings({ sound: checked })}
                  disabled={!settings.enabled}
                />
              </div>

              {/* Desktop Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Desktop Notifications</label>
                <Switch
                  checked={settings.desktop && permission === 'granted'}
                  onCheckedChange={(checked) => {
                    if (checked && permission !== 'granted') {
                      handlePermissionRequest();
                    }
                    updateSettings({ desktop: checked });
                  }}
                  disabled={!settings.enabled}
                />
              </div>

              {/* Permission Request */}
              {permission === 'default' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePermissionRequest}
                  className="w-full"
                >
                  Enable Desktop Notifications
                </Button>
              )}

              {/* Auto Mark as Read */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto-mark as read</label>
                <Switch
                  checked={settings.autoMark}
                  onCheckedChange={(checked) => updateSettings({ autoMark: checked })}
                  disabled={!settings.enabled}
                />
              </div>

              {/* Grouping */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Group notifications</label>
                <Switch
                  checked={settings.grouping}
                  onCheckedChange={(checked) => updateSettings({ grouping: checked })}
                  disabled={!settings.enabled}
                />
              </div>

              {/* Active Channels Info */}
              {channels.length > 0 && (
                <div className="pt-4 border-t">
                  <label className="text-xs font-medium text-gray-500">Active Channels</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {channels.map((channel) => (
                      <span
                        key={channel}
                        className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Firebase Push Notifications */}
              {realTime && (
                <div className="pt-4 border-t">
                  <label className="text-xs font-medium text-gray-500">Push Notifications Status</label>
                  <div className="mt-2 space-y-2">
                    {firebasePermission === 'granted' ? (
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Enabled</span>
                      </div>
                    ) : firebasePermission === 'denied' ? (
                      <div className="flex items-center gap-2 text-xs text-red-600">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span>Blocked</span>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={requestFirebasePermission}
                        disabled={isFirebaseLoading}
                        className="w-full text-xs"
                      >
                        {isFirebaseLoading ? 'Enabling...' : 'Enable Push Notifications'}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div
      className={clsx("relative inline-block", className)}
      data-notification-bell
    >
      <Tooltip content={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}>
        <motion.button
          className={clsx(
            "relative p-2 rounded-lg transition-all duration-200",
            "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            state.isOpen && "bg-gray-100"
          )}
          onClick={handleBellClick}
          disabled={state.isLoading || !settings.enabled}
          animate={hasUnread && animation !== 'none' ? animation : 'none'}
          variants={bellVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {renderBellIcon()}
          {renderCountBadge()}
          {renderPriorityIndicator()}

          {/* Loading indicator */}
          {state.isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </motion.button>
      </Tooltip>

      {/* Settings Button */}
      {showSettings && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute -bottom-1 -right-1 w-6 h-6 p-0 rounded-full"
          onClick={handleSettingsClick}
        >
          <Cog6ToothIcon className="w-3 h-3" />
        </Button>
      )}

      {/* Settings Panel */}
      {renderSettings()}

      {/* Error Display */}
      {state.error && (
        <div className="absolute top-full left-0 mt-2 z-50">
          <Card className="p-3 bg-red-50 border-red-200">
            <p className="text-sm text-red-600">{state.error}</p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
