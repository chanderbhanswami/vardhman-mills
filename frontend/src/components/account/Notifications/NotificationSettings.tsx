'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  Cog6ToothIcon,
  BellAlertIcon,
  BellSlashIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/components/notifications';
import { useNotification } from '@/hooks/notification/useNotification';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface NotificationSettingsProps {
  /** Show test notification button */
  showTest?: boolean;
  
  /** Show import/export functionality */
  showImportExport?: boolean;
  
  /** Show clear all button */
  showClearAll?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

export interface NotificationSettingsState {
  // Sound settings
  soundEnabled: boolean;
  soundVolume: number;
  customSound: string;
  
  // Visual settings
  showBadge: boolean;
  badgeCount: 'all' | 'unread' | 'important';
  showDesktopNotifications: boolean;
  showInAppNotifications: boolean;
  
  // Behavior settings
  autoMarkReadOnView: boolean;
  autoMarkReadDelay: number;
  groupSimilar: boolean;
  collapseOld: boolean;
  collapseOldAfter: number;
  
  // Privacy settings
  showPreviews: boolean;
  showSensitiveContent: boolean;
  hideOnLockScreen: boolean;
  
  // Storage settings
  retentionDays: number;
  maxStoredNotifications: number;
  autoDeleteRead: boolean;
  autoDeleteAfterDays: number;
  
  // Do Not Disturb
  dndEnabled: boolean;
  dndStart: string;
  dndEnd: string;
  dndAllowUrgent: boolean;
  
  // Browser notifications
  browserPermission: 'default' | 'granted' | 'denied';
  requestPermissionOnLoad: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_SETTINGS: NotificationSettingsState = {
  soundEnabled: true,
  soundVolume: 70,
  customSound: 'default',
  showBadge: true,
  badgeCount: 'unread',
  showDesktopNotifications: true,
  showInAppNotifications: true,
  autoMarkReadOnView: true,
  autoMarkReadDelay: 3,
  groupSimilar: true,
  collapseOld: true,
  collapseOldAfter: 7,
  showPreviews: true,
  showSensitiveContent: false,
  hideOnLockScreen: false,
  retentionDays: 30,
  maxStoredNotifications: 100,
  autoDeleteRead: false,
  autoDeleteAfterDays: 7,
  dndEnabled: false,
  dndStart: '22:00',
  dndEnd: '08:00',
  dndAllowUrgent: true,
  browserPermission: 'default',
  requestPermissionOnLoad: false,
};

const SOUND_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'chime', label: 'Chime' },
  { value: 'bell', label: 'Bell' },
  { value: 'ding', label: 'Ding' },
  { value: 'ping', label: 'Ping' },
  { value: 'none', label: 'None' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * NotificationSettings Component
 * 
 * Account-specific notification settings panel with features including:
 * - Sound and volume controls
 * - Badge configuration
 * - Desktop notification permissions
 * - Auto-read behavior
 * - Notification grouping
 * - Privacy controls
 * - Storage and retention
 * - Do Not Disturb mode
 * - Import/Export settings
 * - Clear all notifications
 * - Test notifications
 * 
 * @example
 * ```tsx
 * <NotificationSettings
 *   showTest={true}
 *   showImportExport={true}
 * />
 * ```
 */
export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  showTest = true,
  showImportExport = true,
  showClearAll = true,
  className,
}) => {
  // Hooks
  const notificationContext = useNotifications();
  const toast = useNotification();

  // State
  const [settings, setSettings] = useState<NotificationSettingsState>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notification-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (err) {
        console.error('Failed to parse saved settings:', err);
      }
    }

    // Check browser permission
    if ('Notification' in window) {
      setSettings(prev => ({
        ...prev,
        browserPermission: Notification.permission,
      }));
    }
  }, []);

  // Request browser permission
  useEffect(() => {
    if (settings.requestPermissionOnLoad && settings.browserPermission === 'default') {
      handleRequestBrowserPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.requestPermissionOnLoad, settings.browserPermission]);

  // Handlers
  const handleSettingChange = useCallback(<K extends keyof NotificationSettingsState>(
    key: K,
    value: NotificationSettingsState[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('notification-settings', JSON.stringify(settings));
      
      // Update context if available
      if (notificationContext?.updatePreferences) {
        await notificationContext.updatePreferences(settings as unknown as Record<string, unknown>);
      }

      toast?.success('Settings saved successfully');
      setHasChanges(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      toast?.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [settings, notificationContext, toast]);

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
    toast?.info('Settings reset to defaults');
  }, [toast]);

  const handleRequestBrowserPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast?.error('Browser notifications not supported');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setSettings(prev => ({ ...prev, browserPermission: permission }));
      
      if (permission === 'granted') {
        toast?.success('Browser notifications enabled');
      } else {
        toast?.warning('Browser notifications denied');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request notification permission';
      toast?.error(errorMessage);
    }
  }, [toast]);

  const handleTestNotification = useCallback(() => {
    if (notificationContext?.addNotification) {
      notificationContext.addNotification({
        title: 'Test Notification',
        message: 'This is a test notification to check your settings',
        type: 'announcement' as const,
        category: 'system' as const,
        priority: 'normal' as const,
        channels: ['in_app'],
        content: {
          title: 'Test Notification',
          body: 'This is a test notification to check your settings',
          actions: [],
        },
        tracking: {
          opened: false,
          clicked: false,
          actionsPerformed: [],
          engagement: {
            views: 0,
            clicks: 0,
            shares: 0,
            timeSpent: 0,
          },
        },
        status: 'sent' as const,
        deliveryStatus: {
          overall: 'delivered' as const,
          channels: [],
          attempts: 1,
        },
        deliveryConfig: {
          channels: [{
            channel: 'in_app' as const,
            enabled: true,
            priority: 1,
          }],
          fallbackChannels: [],
          timing: { immediate: true },
          retryPolicy: {
            enabled: false,
            maxAttempts: 1,
            initialDelay: 1000,
            maxDelay: 3600000,
            backoffMultiplier: 2,
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
            window: 300,
            keyFields: ['title', 'message'],
            strategy: 'skip' as const,
          },
        },
        source: 'test',
        tags: ['test'],
        personalized: false,
        userId: 'current-user',
      });
      
      toast?.success('Test notification sent');
    } else if (toast) {
      toast.info('Test notification', { duration: 5000 });
    }
  }, [notificationContext, toast]);

  const handleClearAll = useCallback(async () => {
    if (notificationContext?.notifications) {
      try {
        // Clear notifications by marking all as read or deleting
        const notifications = notificationContext.notifications || [];
        for (const notif of notifications) {
          if (notificationContext.deleteNotification) {
            await notificationContext.deleteNotification(notif.id);
          }
        }
        toast?.success('All notifications cleared');
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to clear notifications';
        toast?.error(errorMessage);
      }
    } else if (toast) {
      toast?.dismissAll?.();
      toast.success('All toast notifications cleared');
    }
  }, [notificationContext, toast]);

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notification-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast?.success('Settings exported');
  }, [settings, toast]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setSettings(imported);
        setHasChanges(true);
        toast?.success('Settings imported');
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Invalid settings file';
        toast?.error(errorMessage);
      }
    };
    reader.readAsText(file);
  }, [toast]);

  // Render component
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Configure how notifications appear and behave</p>
        </div>

        <div className="flex gap-2">
          {showTest && (
            <Button variant="outline" onClick={handleTestNotification}>
              <BellAlertIcon className="w-4 h-4 mr-2" />
              Test
            </Button>
          )}
          {showImportExport && (
            <>
              <label>
                <Button variant="outline">
                  <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <input
                  type="file"
                  accept=".json"
                  aria-label="Import settings file"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              <Button variant="outline" onClick={handleExport}>
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Export
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Sound Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SpeakerWaveIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Sound & Volume</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.soundEnabled ? (
                  <SpeakerWaveIcon className="w-5 h-5 text-blue-600" />
                ) : (
                  <SpeakerXMarkIcon className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <span className="font-medium text-gray-900">Enable Sound</span>
                  <p className="text-sm text-gray-500">Play sound when notifications arrive</p>
                </div>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
              />
            </div>

            {settings.soundEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volume: {settings.soundVolume}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.soundVolume}
                    onChange={(e) => handleSettingChange('soundVolume', parseInt(e.target.value))}
                    className="w-full"
                    aria-label="Sound volume control"
                  />
                </div>

                <Select
                  value={settings.customSound}
                  onValueChange={(value) => handleSettingChange('customSound', String(value))}
                  options={SOUND_OPTIONS}
                  label="Notification Sound"
                />
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Visual Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ComputerDesktopIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Visual Settings</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">Show Badge Count</span>
                <p className="text-sm text-gray-500">Display notification count on app icon</p>
              </div>
              <Switch
                checked={settings.showBadge}
                onCheckedChange={(checked) => handleSettingChange('showBadge', checked)}
              />
            </div>

            {settings.showBadge && (
              <Select
                value={settings.badgeCount}
                onValueChange={(value) => handleSettingChange('badgeCount', value as NotificationSettingsState['badgeCount'])}
                options={[
                  { value: 'all', label: 'All Notifications' },
                  { value: 'unread', label: 'Unread Only' },
                  { value: 'important', label: 'Important Only' },
                ]}
                label="Badge Count Type"
              />
            )}

            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">Desktop Notifications</span>
                <p className="text-sm text-gray-500">Show browser notifications</p>
              </div>
              <div className="flex items-center gap-2">
                {settings.browserPermission === 'granted' && (
                  <Badge variant="success" size="sm">
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    Enabled
                  </Badge>
                )}
                {settings.browserPermission === 'denied' && (
                  <Badge variant="destructive" size="sm">
                    <XCircleIcon className="w-3 h-3 mr-1" />
                    Denied
                  </Badge>
                )}
                {settings.browserPermission === 'default' && (
                  <Button size="sm" variant="outline" onClick={handleRequestBrowserPermission}>
                    Enable
                  </Button>
                )}
                <Switch
                  checked={settings.showDesktopNotifications}
                  onCheckedChange={(checked) => handleSettingChange('showDesktopNotifications', checked)}
                  disabled={settings.browserPermission === 'denied'}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">In-App Notifications</span>
                <p className="text-sm text-gray-500">Show notifications within the app</p>
              </div>
              <Switch
                checked={settings.showInAppNotifications}
                onCheckedChange={(checked) => handleSettingChange('showInAppNotifications', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Behavior Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Behavior</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">Auto Mark as Read</span>
                <p className="text-sm text-gray-500">Mark notifications as read when viewed</p>
              </div>
              <Switch
                checked={settings.autoMarkReadOnView}
                onCheckedChange={(checked) => handleSettingChange('autoMarkReadOnView', checked)}
              />
            </div>

            {settings.autoMarkReadOnView && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-read delay: {settings.autoMarkReadDelay} seconds
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={settings.autoMarkReadDelay}
                  onChange={(e) => handleSettingChange('autoMarkReadDelay', parseInt(e.target.value))}
                  className="w-full"
                  aria-label="Auto-read delay control"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">Group Similar Notifications</span>
                <p className="text-sm text-gray-500">Combine notifications from the same source</p>
              </div>
              <Switch
                checked={settings.groupSimilar}
                onCheckedChange={(checked) => handleSettingChange('groupSimilar', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">Collapse Old Notifications</span>
                <p className="text-sm text-gray-500">Automatically collapse old notifications</p>
              </div>
              <Switch
                checked={settings.collapseOld}
                onCheckedChange={(checked) => handleSettingChange('collapseOld', checked)}
              />
            </div>

            {settings.collapseOld && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collapse after {settings.collapseOldAfter} days
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={settings.collapseOldAfter}
                  onChange={(e) => handleSettingChange('collapseOldAfter', parseInt(e.target.value))}
                  className="w-full"
                  aria-label="Collapse old notifications after days"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Privacy</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DevicePhoneMobileIcon className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="font-medium text-gray-900">Show Message Previews</span>
                  <p className="text-sm text-gray-500">Display notification content in previews</p>
                </div>
              </div>
              <Switch
                checked={settings.showPreviews}
                onCheckedChange={(checked) => handleSettingChange('showPreviews', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">Show Sensitive Content</span>
                <p className="text-sm text-gray-500">Display payment and security details</p>
              </div>
              <Switch
                checked={settings.showSensitiveContent}
                onCheckedChange={(checked) => handleSettingChange('showSensitiveContent', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">Hide on Lock Screen</span>
                <p className="text-sm text-gray-500">Don&apos;t show notifications when device is locked</p>
              </div>
              <Switch
                checked={settings.hideOnLockScreen}
                onCheckedChange={(checked) => handleSettingChange('hideOnLockScreen', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrashIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Storage & Retention</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retention Period: {settings.retentionDays} days
              </label>
              <input
                type="range"
                min="7"
                max="90"
                value={settings.retentionDays}
                onChange={(e) => handleSettingChange('retentionDays', parseInt(e.target.value))}
                className="w-full"
                aria-label="Notification retention period in days"
              />
              <p className="text-sm text-gray-500 mt-1">
                Notifications older than this will be automatically deleted
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Stored: {settings.maxStoredNotifications}
              </label>
              <input
                type="range"
                min="50"
                max="500"
                step="50"
                value={settings.maxStoredNotifications}
                onChange={(e) => handleSettingChange('maxStoredNotifications', parseInt(e.target.value))}
                className="w-full"
                aria-label="Maximum stored notifications limit"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">Auto-delete Read Notifications</span>
                <p className="text-sm text-gray-500">Automatically remove read notifications</p>
              </div>
              <Switch
                checked={settings.autoDeleteRead}
                onCheckedChange={(checked) => handleSettingChange('autoDeleteRead', checked)}
              />
            </div>

            {settings.autoDeleteRead && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delete read after {settings.autoDeleteAfterDays} days
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={settings.autoDeleteAfterDays}
                  onChange={(e) => handleSettingChange('autoDeleteAfterDays', parseInt(e.target.value))}
                  className="w-full"
                  aria-label="Auto-delete read notifications after days"
                />
              </div>
            )}

            {showClearAll && (
              <Button
                variant="destructive"
                onClick={handleClearAll}
                className="w-full"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Clear All Notifications
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Do Not Disturb */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.dndEnabled ? (
                <BellSlashIcon className="w-5 h-5 text-gray-600" />
              ) : (
                <BellIcon className="w-5 h-5 text-gray-600" />
              )}
              <h3 className="text-lg font-semibold text-gray-900">Do Not Disturb</h3>
            </div>
            <Switch
              checked={settings.dndEnabled}
              onCheckedChange={(checked) => handleSettingChange('dndEnabled', checked)}
            />
          </div>
        </CardHeader>
        {settings.dndEnabled && (
          <CardContent>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <Input
                      type="time"
                      value={settings.dndStart}
                      onChange={(e) => handleSettingChange('dndStart', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <Input
                      type="time"
                      value={settings.dndEnd}
                      onChange={(e) => handleSettingChange('dndEnd', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">Allow Urgent Notifications</span>
                    <p className="text-sm text-gray-500">Critical and urgent notifications will override DND</p>
                  </div>
                  <Switch
                    checked={settings.dndAllowUrgent}
                    onCheckedChange={(checked) => handleSettingChange('dndAllowUrgent', checked)}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        )}
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="warning">Unsaved Changes</Badge>
          )}
          <Button
            variant="default"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            loading={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
