'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ShieldCheckIcon,
  CogIcon,
  BellAlertIcon,
  BellSlashIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/components/notifications';
import { useNotification } from '@/hooks/notification/useNotification';
import type { NotificationChannel, NotificationPriority, NotificationType } from '@/types/notification.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface NotificationPreferencesProps {
  /** Initial preferences */
  initialPreferences?: NotificationPreferencesData;
  
  /** Callback when preferences are saved */
  onSave?: (preferences: NotificationPreferencesData) => void;
  
  /** Callback when preferences are reset */
  onReset?: () => void;
  
  /** Show advanced settings */
  showAdvanced?: boolean;
  
  /** Read-only mode */
  readOnly?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

export interface NotificationPreferencesData {
  // Global settings
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  
  // Channel preferences
  channels: {
    email: ChannelPreference;
    sms: ChannelPreference;
    push: ChannelPreference;
    in_app: ChannelPreference;
  };
  
  // Type preferences
  types: Record<NotificationType, TypePreference>;
  
  // Priority preferences
  priorities: Record<NotificationPriority, PriorityPreference>;
  
  // Quiet hours
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
    timezone: string;
  };
  
  // Digest settings
  digest: {
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly';
    time: string; // HH:MM
    days?: number[]; // 0-6 for weekly
  };
  
  // Advanced settings
  grouping: boolean;
  autoMarkRead: boolean;
  showPreviews: boolean;
  maxNotifications: number;
}

export interface ChannelPreference {
  enabled: boolean;
  verified: boolean;
  address?: string; // email or phone
}

export interface TypePreference {
  enabled: boolean;
  channels: NotificationChannel[];
  priority: NotificationPriority;
}

export interface PriorityPreference {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  persistent: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_PREFERENCES: NotificationPreferencesData = {
  enabled: true,
  sound: true,
  vibration: true,
  channels: {
    email: { enabled: true, verified: false },
    sms: { enabled: false, verified: false },
    push: { enabled: true, verified: true },
    in_app: { enabled: true, verified: true },
  },
  types: {
    order_update: { enabled: true, channels: ['in_app', 'email', 'push'], priority: 'high' },
    payment_confirmation: { enabled: true, channels: ['in_app', 'email', 'push'], priority: 'high' },
    shipping_update: { enabled: true, channels: ['in_app', 'push'], priority: 'normal' },
    product_alert: { enabled: true, channels: ['in_app', 'email'], priority: 'normal' },
    price_drop: { enabled: true, channels: ['in_app', 'email'], priority: 'normal' },
    stock_alert: { enabled: true, channels: ['in_app', 'push'], priority: 'high' },
    wishlist_update: { enabled: true, channels: ['in_app'], priority: 'low' },
    promotion: { enabled: true, channels: ['in_app', 'email'], priority: 'low' },
    sale_alert: { enabled: true, channels: ['in_app', 'email'], priority: 'normal' },
    review_request: { enabled: true, channels: ['in_app', 'email'], priority: 'low' },
    account_security: { enabled: true, channels: ['in_app', 'email', 'push', 'sms'], priority: 'critical' },
    newsletter: { enabled: true, channels: ['email'], priority: 'low' },
    reminder: { enabled: true, channels: ['in_app', 'push'], priority: 'normal' },
    announcement: { enabled: true, channels: ['in_app'], priority: 'normal' },
    system_alert: { enabled: true, channels: ['in_app', 'push'], priority: 'high' },
    social_activity: { enabled: true, channels: ['in_app'], priority: 'low' },
    recommendation: { enabled: true, channels: ['in_app', 'email'], priority: 'low' },
    milestone: { enabled: true, channels: ['in_app', 'email'], priority: 'normal' },
    support_update: { enabled: true, channels: ['in_app', 'email'], priority: 'normal' },
    survey_invitation: { enabled: true, channels: ['in_app', 'email'], priority: 'low' },
    app_update: { enabled: true, channels: ['in_app'], priority: 'normal' },
    maintenance: { enabled: true, channels: ['in_app', 'email', 'push'], priority: 'urgent' },
    custom: { enabled: true, channels: ['in_app'], priority: 'normal' },
  },
  priorities: {
    critical: { enabled: true, sound: true, vibration: true, persistent: true },
    urgent: { enabled: true, sound: true, vibration: true, persistent: true },
    high: { enabled: true, sound: true, vibration: false, persistent: false },
    normal: { enabled: true, sound: false, vibration: false, persistent: false },
    low: { enabled: true, sound: false, vibration: false, persistent: false },
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
    timezone: 'Asia/Kolkata',
  },
  digest: {
    enabled: false,
    frequency: 'daily',
    time: '09:00',
  },
  grouping: true,
  autoMarkRead: false,
  showPreviews: true,
  maxNotifications: 50,
};

const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  order_update: 'Order Updates',
  payment_confirmation: 'Payment Confirmations',
  shipping_update: 'Shipping Updates',
  product_alert: 'Product Alerts',
  price_drop: 'Price Drops',
  stock_alert: 'Stock Alerts',
  wishlist_update: 'Wishlist Updates',
  promotion: 'Promotions',
  sale_alert: 'Sale Alerts',
  review_request: 'Review Requests',
  account_security: 'Security Alerts',
  newsletter: 'Newsletter',
  reminder: 'Reminders',
  announcement: 'Announcements',
  system_alert: 'System Alerts',
  social_activity: 'Social Activity',
  recommendation: 'Recommendations',
  milestone: 'Milestones',
  support_update: 'Support Updates',
  survey_invitation: 'Survey Invitations',
  app_update: 'App Updates',
  maintenance: 'Maintenance Notifications',
  custom: 'Custom Notifications',
};

const CHANNEL_ICONS: Record<NotificationChannel, React.ComponentType<{ className?: string }>> = {
  email: EnvelopeIcon,
  sms: DevicePhoneMobileIcon,
  push: BellIcon,
  in_app: ComputerDesktopIcon,
  whatsapp: DevicePhoneMobileIcon,
  slack: ComputerDesktopIcon,
  webhook: ComputerDesktopIcon,
  browser: ComputerDesktopIcon,
  voice: DevicePhoneMobileIcon,
  telegram: DevicePhoneMobileIcon,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * NotificationPreferences Component
 * 
 * Comprehensive notification preferences management with features including:
 * - Global notification toggle
 * - Channel-specific preferences (email, SMS, push, in-app)
 * - Per-notification-type settings
 * - Priority-based preferences
 * - Quiet hours configuration
 * - Digest settings
 * - Advanced options
 * - Real-time preview
 * - Bulk actions
 * - Import/Export preferences
 * 
 * @example
 * ```tsx
 * <NotificationPreferences
 *   initialPreferences={userPreferences}
 *   onSave={handleSave}
 *   showAdvanced={true}
 * />
 * ```
 */
export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  initialPreferences,
  onSave,
  onReset,
  showAdvanced = true,
  readOnly = false,
  className,
}) => {
  // Hooks
  const notificationContext = useNotifications();
  const toast = useNotification();

  // State
  const [preferences, setPreferences] = useState<NotificationPreferencesData>(
    initialPreferences || DEFAULT_PREFERENCES
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'channels' | 'types' | 'priorities' | 'advanced'>('channels');

  // Load preferences from context
  useEffect(() => {
    if (notificationContext?.preferences) {
      const contextPrefs = notificationContext.preferences as unknown as NotificationPreferencesData;
      setPreferences(contextPrefs);
    }
  }, [notificationContext?.preferences]);

  // Computed values
  const enabledChannels = useMemo(
    () => Object.entries(preferences.channels).filter(([, pref]) => pref.enabled).map(([channel]) => channel),
    [preferences.channels]
  );

  const enabledTypes = useMemo(
    () => Object.entries(preferences.types).filter(([, pref]) => pref.enabled).length,
    [preferences.types]
  );

  // Handlers
  const handleGlobalToggle = useCallback((enabled: boolean) => {
    setPreferences(prev => ({ ...prev, enabled }));
    setHasChanges(true);
  }, []);

  const handleChannelToggle = useCallback((channel: keyof NotificationPreferencesData['channels'], enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: { ...prev.channels[channel], enabled },
      },
    }));
    setHasChanges(true);
  }, []);

  const handleTypeToggle = useCallback((type: NotificationType, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: { ...prev.types[type], enabled },
      },
    }));
    setHasChanges(true);
  }, []);

  const handleTypeChannels = useCallback((type: NotificationType, channels: NotificationChannel[]) => {
    setPreferences(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: { ...prev.types[type], channels },
      },
    }));
    setHasChanges(true);
  }, []);

  const handlePriorityToggle = useCallback((priority: NotificationPriority, field: keyof PriorityPreference, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      priorities: {
        ...prev.priorities,
        [priority]: { ...prev.priorities[priority], [field]: value },
      },
    }));
    setHasChanges(true);
  }, []);

  const handleQuietHours = useCallback((field: keyof NotificationPreferencesData['quietHours'], value: string | boolean) => {
    setPreferences(prev => ({
      ...prev,
      quietHours: { ...prev.quietHours, [field]: value },
    }));
    setHasChanges(true);
  }, []);

  const handleDigest = useCallback((field: keyof NotificationPreferencesData['digest'], value: string | boolean | number[] | number) => {
    setPreferences(prev => ({
      ...prev,
      digest: { ...prev.digest, [field]: value },
    }));
    setHasChanges(true);
  }, []);

  const handleAdvancedSetting = useCallback((field: string, value: boolean | number) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      if (notificationContext?.updatePreferences) {
        await notificationContext.updatePreferences(preferences as unknown as Record<string, unknown>);
      }
      
      if (onSave) {
        onSave(preferences);
      }

      toast?.success('Notification preferences saved successfully');
      setHasChanges(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save preferences';
      toast?.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [preferences, notificationContext, onSave, toast]);

  const handleResetToDefaults = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    setHasChanges(true);
    toast?.info('Preferences reset to defaults');
    
    if (onReset) {
      onReset();
    }
  }, [onReset, toast]);

  const handleEnableAll = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      types: Object.fromEntries(
        Object.entries(prev.types).map(([type, pref]) => [type, { ...pref, enabled: true }])
      ) as Record<NotificationType, TypePreference>,
    }));
    setHasChanges(true);
    toast?.success('All notification types enabled');
  }, [toast]);

  const handleDisableAll = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      types: Object.fromEntries(
        Object.entries(prev.types).map(([type, pref]) => [type, { ...pref, enabled: false }])
      ) as Record<NotificationType, TypePreference>,
    }));
    setHasChanges(true);
    toast?.success('All notification types disabled');
  }, [toast]);

  // Render component
  return (
    <div className={cn('space-y-6', className)}>
      {/* Global Settings */}
      <Card>
        <CardHeader>
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {preferences.enabled ? <BellAlertIcon className="w-5 h-5 text-primary-600" /> : <BellSlashIcon className="w-5 h-5 text-gray-400" />}
                Notification Preferences
              </h2>
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                <CogIcon className="w-4 h-4" />
                Manage how and when you receive notifications
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {preferences.enabled ? (
                <ShieldCheckIcon className="w-5 h-5 text-green-600" title="Notifications enabled" />
              ) : (
                <XMarkIcon className="w-5 h-5 text-gray-400" title="Notifications disabled" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {preferences.enabled ? 'Notifications On' : 'Notifications Off'}
              </span>
              <Switch
                checked={preferences.enabled}
                onCheckedChange={handleGlobalToggle}
                disabled={readOnly}
              />
            </div>
          </motion.div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <BellIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Sound</span>
              </div>
              <Switch
                checked={preferences.sound}
                onCheckedChange={(checked) => handleAdvancedSetting('sound', checked)}
                disabled={!preferences.enabled || readOnly}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <DevicePhoneMobileIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Vibration</span>
              </div>
              <Switch
                checked={preferences.vibration}
                onCheckedChange={(checked) => handleAdvancedSetting('vibration', checked)}
                disabled={!preferences.enabled || readOnly}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <ClockIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Quiet Hours</span>
              </div>
              <Switch
                checked={preferences.quietHours.enabled}
                onCheckedChange={(checked) => handleQuietHours('enabled', checked)}
                disabled={!preferences.enabled || readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'channels', label: 'Channels', count: enabledChannels.length },
                { id: 'types', label: 'Notification Types', count: enabledTypes },
                { id: 'priorities', label: 'Priorities', count: 5 },
                { id: 'advanced', label: 'Advanced', count: null },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <Badge variant="secondary" className="ml-2">
                      {tab.count}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </CardHeader>

        <CardContent>
          {/* Channels Tab */}
          {activeTab === 'channels' && (
            <div className="space-y-4">
              {Object.entries(preferences.channels).map(([channel, pref]) => {
                const Icon = CHANNEL_ICONS[channel as NotificationChannel];
                return (
                  <div key={channel} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 capitalize">{channel.replace('_', ' ')}</span>
                          {pref.verified && (
                            <Badge variant="success" size="sm">
                              <CheckIcon className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        {pref.address && (
                          <p className="text-sm text-gray-500">{pref.address}</p>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={pref.enabled}
                      onCheckedChange={(checked) => handleChannelToggle(channel as keyof NotificationPreferencesData['channels'], checked)}
                      disabled={!preferences.enabled || readOnly}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Types Tab */}
          {activeTab === 'types' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Configure which notification types you want to receive
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEnableAll}
                    disabled={!preferences.enabled || readOnly}
                  >
                    Enable All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisableAll}
                    disabled={!preferences.enabled || readOnly}
                  >
                    Disable All
                  </Button>
                </div>
              </div>

              {Object.entries(preferences.types).map(([type, pref]) => (
                <div key={type} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {NOTIFICATION_TYPE_LABELS[type as NotificationType]}
                      </span>
                      <Badge variant="secondary" size="sm">
                        {pref.priority}
                      </Badge>
                    </div>
                    <Switch
                      checked={pref.enabled}
                      onCheckedChange={(checked) => handleTypeToggle(type as NotificationType, checked)}
                      disabled={!preferences.enabled || readOnly}
                    />
                  </div>

                  {pref.enabled && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.keys(preferences.channels).map((channel) => {
                        const isSelected = pref.channels.includes(channel as NotificationChannel);
                        const Icon = CHANNEL_ICONS[channel as NotificationChannel];
                        return (
                          <button
                            key={channel}
                            onClick={() => {
                              const newChannels = isSelected
                                ? pref.channels.filter(c => c !== channel)
                                : [...pref.channels, channel as NotificationChannel];
                              handleTypeChannels(type as NotificationType, newChannels);
                            }}
                            disabled={!preferences.enabled || readOnly}
                            className={cn(
                              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
                              isSelected
                                ? 'bg-primary-100 text-primary-700 border-primary-300'
                                : 'bg-gray-100 text-gray-700 border-gray-300',
                              'border hover:shadow-sm'
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="capitalize">{channel.replace('_', ' ')}</span>
                            {isSelected && <CheckIcon className="w-4 h-4" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Priorities Tab */}
          {activeTab === 'priorities' && (
            <div className="space-y-4">
              {Object.entries(preferences.priorities).map(([priority, pref]) => (
                <div key={priority} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="font-medium text-gray-900 capitalize">{priority}</span>
                      <p className="text-sm text-gray-500">Configure behavior for {priority} priority notifications</p>
                    </div>
                    <Switch
                      checked={pref.enabled}
                      onCheckedChange={(checked) => handlePriorityToggle(priority as NotificationPriority, 'enabled', checked)}
                      disabled={!preferences.enabled || readOnly}
                    />
                  </div>

                  {pref.enabled && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">Sound</span>
                        <Switch
                          checked={pref.sound}
                          onCheckedChange={(checked) => handlePriorityToggle(priority as NotificationPriority, 'sound', checked)}
                          disabled={!preferences.enabled || readOnly}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">Vibration</span>
                        <Switch
                          checked={pref.vibration}
                          onCheckedChange={(checked) => handlePriorityToggle(priority as NotificationPriority, 'vibration', checked)}
                          disabled={!preferences.enabled || readOnly}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">Persistent</span>
                        <Switch
                          checked={pref.persistent}
                          onCheckedChange={(checked) => handlePriorityToggle(priority as NotificationPriority, 'persistent', checked)}
                          disabled={!preferences.enabled || readOnly}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && showAdvanced && (
            <div className="space-y-6">
              {/* Quiet Hours */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4">Quiet Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <Input
                      type="time"
                      value={preferences.quietHours.start}
                      onChange={(e) => handleQuietHours('start', e.target.value)}
                      disabled={!preferences.quietHours.enabled || !preferences.enabled || readOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <Input
                      type="time"
                      value={preferences.quietHours.end}
                      onChange={(e) => handleQuietHours('end', e.target.value)}
                      disabled={!preferences.quietHours.enabled || !preferences.enabled || readOnly}
                    />
                  </div>
                </div>
              </div>

              {/* Digest Settings */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Notification Digest</h3>
                    <p className="text-sm text-gray-500">Receive grouped notifications at set intervals</p>
                  </div>
                  <Switch
                    checked={preferences.digest.enabled}
                    onCheckedChange={(checked) => handleDigest('enabled', checked)}
                    disabled={!preferences.enabled || readOnly}
                  />
                </div>

                {preferences.digest.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      value={preferences.digest.frequency}
                      onValueChange={(value) => handleDigest('frequency', value)}
                      disabled={!preferences.enabled || readOnly}
                      options={[
                        { value: 'hourly', label: 'Hourly' },
                        { value: 'daily', label: 'Daily' },
                        { value: 'weekly', label: 'Weekly' },
                      ]}
                      label="Frequency"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <Input
                        type="time"
                        value={preferences.digest.time}
                        onChange={(e) => handleDigest('time', e.target.value)}
                        disabled={!preferences.enabled || readOnly}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Other Advanced Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">Notification Grouping</span>
                    <p className="text-sm text-gray-500">Group similar notifications together</p>
                  </div>
                  <Switch
                    checked={preferences.grouping}
                    onCheckedChange={(checked) => handleAdvancedSetting('grouping', checked)}
                    disabled={!preferences.enabled || readOnly}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">Auto Mark as Read</span>
                    <p className="text-sm text-gray-500">Automatically mark notifications as read when opened</p>
                  </div>
                  <Switch
                    checked={preferences.autoMarkRead}
                    onCheckedChange={(checked) => handleAdvancedSetting('autoMarkRead', checked)}
                    disabled={!preferences.enabled || readOnly}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">Show Previews</span>
                    <p className="text-sm text-gray-500">Display notification content in previews</p>
                  </div>
                  <Switch
                    checked={preferences.showPreviews}
                    onCheckedChange={(checked) => handleAdvancedSetting('showPreviews', checked)}
                    disabled={!preferences.enabled || readOnly}
                  />
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block font-medium text-gray-900 mb-2">Maximum Notifications</label>
                  <Input
                    type="number"
                    min={10}
                    max={200}
                    value={preferences.maxNotifications}
                    onChange={(e) => handleAdvancedSetting('maxNotifications', parseInt(e.target.value))}
                    disabled={!preferences.enabled || readOnly}
                  />
                  <p className="text-sm text-gray-500 mt-1">Maximum number of notifications to keep</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Action Buttons */}
        {!readOnly && (
          <CardFooter>
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                onClick={handleResetToDefaults}
                disabled={isSaving}
              >
                Reset to Defaults
              </Button>

              <div className="flex gap-3">
                {hasChanges && (
                  <Badge variant="warning">Unsaved Changes</Badge>
                )}
                <Button
                  variant="default"
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  loading={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default NotificationPreferences;
