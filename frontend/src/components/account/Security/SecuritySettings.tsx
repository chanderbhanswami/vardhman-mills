'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  BellAlertIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  ClockIcon,
  GlobeAltIcon,
  UserIcon,
  FingerPrintIcon,
  QrCodeIcon,
  EnvelopeIcon,
  PhoneIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Tooltip } from '@/components/ui/Tooltip';
import { Modal } from '@/components/ui/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { Slider } from '@/components/ui/Slider';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAuth } from '@/hooks/auth/useAuth';
import { useNotification } from '@/hooks/notification/useNotification';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SecuritySettings {
  // Password Settings
  passwordSettings: {
    requirePasswordChange: boolean;
    passwordChangeInterval: number; // days
    passwordStrengthRequired: 'weak' | 'medium' | 'strong' | 'very-strong';
    preventPasswordReuse: boolean;
    passwordHistoryCount: number;
    lastPasswordChange?: Date;
  };

  // Two-Factor Authentication
  twoFactorAuth: {
    enabled: boolean;
    method: 'email' | 'sms' | 'app' | 'hardware';
    backupCodesEnabled: boolean;
    backupCodesCount: number;
    lastUsed?: Date;
  };

  // Session Management
  sessionSettings: {
    sessionTimeout: number; // minutes
    maxConcurrentSessions: number;
    logoutOnClose: boolean;
    rememberDevice: boolean;
    trustedDevicesCount: number;
  };

  // Login Security
  loginSecurity: {
    requireEmailVerification: boolean;
    requirePhoneVerification: boolean;
    allowSocialLogin: boolean;
    enableBiometric: boolean;
    captchaEnabled: boolean;
    maxLoginAttempts: number;
    lockoutDuration: number; // minutes
  };

  // Notifications
  securityNotifications: {
    emailOnLogin: boolean;
    emailOnPasswordChange: boolean;
    emailOnSecurityEvent: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    notifyOnNewDevice: boolean;
    notifyOnSuspiciousActivity: boolean;
  };

  // Privacy
  privacySettings: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    allowLocationTracking: boolean;
    allowAnalytics: boolean;
    allowThirdPartyCookies: boolean;
    dataRetentionDays: number;
  };

  // API & Integrations
  apiSettings: {
    apiAccessEnabled: boolean;
    apiKeysCount: number;
    webhooksEnabled: boolean;
    oauthAppsCount: number;
  };
}

export interface SecuritySettingsProps {
  userId?: string;
  onSettingsUpdate?: (settings: Partial<SecuritySettings>) => void;
  className?: string;
}

// ============================================================================
// DEFAULT SETTINGS
// ============================================================================

const defaultSecuritySettings: SecuritySettings = {
  passwordSettings: {
    requirePasswordChange: true,
    passwordChangeInterval: 90,
    passwordStrengthRequired: 'strong',
    preventPasswordReuse: true,
    passwordHistoryCount: 5,
  },
  twoFactorAuth: {
    enabled: false,
    method: 'app',
    backupCodesEnabled: false,
    backupCodesCount: 0,
  },
  sessionSettings: {
    sessionTimeout: 30,
    maxConcurrentSessions: 5,
    logoutOnClose: false,
    rememberDevice: true,
    trustedDevicesCount: 0,
  },
  loginSecurity: {
    requireEmailVerification: true,
    requirePhoneVerification: false,
    allowSocialLogin: true,
    enableBiometric: false,
    captchaEnabled: true,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
  },
  securityNotifications: {
    emailOnLogin: true,
    emailOnPasswordChange: true,
    emailOnSecurityEvent: true,
    pushNotifications: false,
    smsNotifications: false,
    notifyOnNewDevice: true,
    notifyOnSuspiciousActivity: true,
  },
  privacySettings: {
    showOnlineStatus: true,
    showLastSeen: true,
    allowLocationTracking: false,
    allowAnalytics: true,
    allowThirdPartyCookies: false,
    dataRetentionDays: 365,
  },
  apiSettings: {
    apiAccessEnabled: false,
    apiKeysCount: 0,
    webhooksEnabled: false,
    oauthAppsCount: 0,
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  userId,
  onSettingsUpdate,
  className,
}) => {
  const { user } = useAuth();
  const notification = useNotification();
  
  // Use userId with fallback to authenticated user
  const activeUserId = userId || user?.id;

  // ============================================================================
  // STATE
  // ============================================================================

  const [settings, setSettings] = useState<SecuritySettings>(defaultSecuritySettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'security' | 'privacy' | 'notifications' | 'advanced'>('security');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call - Use activeUserId for fetching user-specific settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data with some realistic values for the specific user
      const mockSettings: SecuritySettings = {
        ...defaultSecuritySettings,
        twoFactorAuth: {
          enabled: true,
          method: 'app',
          backupCodesEnabled: true,
          backupCodesCount: 8,
          lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        sessionSettings: {
          ...defaultSecuritySettings.sessionSettings,
          trustedDevicesCount: 3,
        },
        passwordSettings: {
          ...defaultSecuritySettings.passwordSettings,
          lastPasswordChange: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        },
      };
      
      // Log user ID for debugging
      if (activeUserId) {
        console.log('Fetching settings for user:', activeUserId);
      }
      
      setSettings(mockSettings);
      
    } catch (error) {
      console.error('Failed to fetch security settings:', error);
      notification.error('Failed to load security settings');
    } finally {
      setIsLoading(false);
    }
  }, [notification, activeUserId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSettingChange = useCallback(<K extends keyof SecuritySettings>(
    category: K,
    key: keyof SecuritySettings[K],
    value: unknown
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
    setHasChanges(true);
  }, []);

  const handleSaveSettings = useCallback(async () => {
    try {
      setIsSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      notification.success('Security settings updated successfully');
      onSettingsUpdate?.(settings);
      setHasChanges(false);
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      notification.error('Failed to save security settings');
    } finally {
      setIsSaving(false);
    }
  }, [settings, notification, onSettingsUpdate]);

  const handleResetSettings = useCallback(async () => {
    try {
      setIsSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSettings(defaultSecuritySettings);
      setHasChanges(false);
      setShowResetDialog(false);
      
      notification.success('Settings reset to defaults');
      
    } catch (error) {
      console.error('Failed to reset settings:', error);
      notification.error('Failed to reset settings');
    } finally {
      setIsSaving(false);
    }
  }, [notification]);

  const calculatePasswordStrength = useCallback((password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 20;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15;
    setPasswordStrength(strength);
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const securityScore = useMemo(() => {
    let score = 0;
    
    // Password settings
    if (settings.passwordSettings.requirePasswordChange) score += 10;
    if (settings.passwordSettings.preventPasswordReuse) score += 10;
    if (settings.passwordSettings.passwordStrengthRequired === 'very-strong') score += 15;
    else if (settings.passwordSettings.passwordStrengthRequired === 'strong') score += 10;
    
    // 2FA
    if (settings.twoFactorAuth.enabled) score += 20;
    if (settings.twoFactorAuth.backupCodesEnabled) score += 5;
    
    // Session security
    if (settings.sessionSettings.sessionTimeout <= 30) score += 10;
    if (settings.sessionSettings.maxConcurrentSessions <= 3) score += 5;
    
    // Login security
    if (settings.loginSecurity.requireEmailVerification) score += 10;
    if (settings.loginSecurity.captchaEnabled) score += 5;
    if (settings.loginSecurity.maxLoginAttempts <= 5) score += 5;
    
    // Notifications
    if (settings.securityNotifications.notifyOnNewDevice) score += 5;
    if (settings.securityNotifications.notifyOnSuspiciousActivity) score += 5;
    
    return Math.min(score, 100);
  }, [settings]);

  const securityLevel = useMemo(() => {
    if (securityScore >= 80) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (securityScore >= 60) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (securityScore >= 40) return { level: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { level: 'Poor', color: 'text-red-600', bgColor: 'bg-red-50' };
  }, [securityScore]);

  const recommendations = useMemo(() => {
    const recs: string[] = [];
    
    if (!settings.twoFactorAuth.enabled) {
      recs.push('Enable two-factor authentication for enhanced security');
    }
    if (settings.passwordSettings.passwordChangeInterval > 90) {
      recs.push('Consider changing your password more frequently');
    }
    if (settings.sessionSettings.sessionTimeout > 60) {
      recs.push('Reduce session timeout for better security');
    }
    if (!settings.loginSecurity.requireEmailVerification) {
      recs.push('Enable email verification for login attempts');
    }
    if (!settings.securityNotifications.notifyOnNewDevice) {
      recs.push('Enable notifications for new device logins');
    }
    
    return recs;
  }, [settings]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
                Security Settings
              </CardTitle>
              <CardDescription className="mt-2">
                Manage your account security preferences, authentication methods, and privacy settings.
              </CardDescription>
            </div>
            {hasChanges && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={fetchSettings}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>

          {/* Security Score */}
          <div className={cn('p-6 rounded-lg mt-6', securityLevel.bgColor)}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-700">Security Score</h3>
                  <Tooltip content="Your overall security score based on enabled features">
                    <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help" />
                  </Tooltip>
                </div>
                <p className={cn('text-3xl font-bold', securityLevel.color)}>{securityScore}/100</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-600">{securityLevel.level}</p>
                  <Badge 
                    variant={
                      securityLevel.level === 'Excellent' ? 'success' : 
                      securityLevel.level === 'Good' ? 'default' : 
                      securityLevel.level === 'Fair' ? 'warning' : 
                      'destructive'
                    }
                  >
                    {securityLevel.level}
                  </Badge>
                </div>
              </div>
              <ShieldCheckIcon className={cn('w-16 h-16', securityLevel.color)} />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              {/* Dynamic width requires inline style - CSS variables used for runtime calculation */}
              <div
                className={cn(
                  'h-3 rounded-full transition-all duration-500',
                  securityScore >= 80 ? 'bg-green-500' :
                  securityScore >= 60 ? 'bg-blue-500' :
                  securityScore >= 40 ? 'bg-yellow-500' :
                  'bg-red-500'
                )}
                style={{ width: `${securityScore}%` } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Alert variant="warning" className="mt-4">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <AlertDescription>
                <p className="font-semibold mb-2">Security Recommendations:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
            <TabsList>
              <TabsTrigger value="security">
                <LockClosedIcon className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="privacy">
                <EyeIcon className="w-4 h-4 mr-2" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <BellAlertIcon className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <Cog6ToothIcon className="w-4 h-4 mr-2" />
                Advanced
              </TabsTrigger>
            </TabsList>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6 mt-6">
              {/* Password Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <KeyIcon className="w-5 h-5" />
                    Password Settings
                  </CardTitle>
                  <CardDescription>
                    Configure password requirements and change intervals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm">Require Regular Password Changes</label>
                      <p className="text-xs text-gray-500">Enforce periodic password updates</p>
                    </div>
                    <Switch
                      checked={settings.passwordSettings.requirePasswordChange}
                      onCheckedChange={(checked) => handleSettingChange('passwordSettings', 'requirePasswordChange', checked)}
                    />
                  </div>

                  {settings.passwordSettings.requirePasswordChange && (
                    <div>
                      <label className="font-medium text-sm block mb-2">
                        Password Change Interval: {settings.passwordSettings.passwordChangeInterval} days
                      </label>
                      <Slider
                        min={30}
                        max={365}
                        step={15}
                        value={[settings.passwordSettings.passwordChangeInterval]}
                        onValueChange={([value]) => handleSettingChange('passwordSettings', 'passwordChangeInterval', value)}
                      />
                    </div>
                  )}

                  <div>
                    <label className="font-medium text-sm block mb-2">Required Password Strength</label>
                    <Select
                      value={settings.passwordSettings.passwordStrengthRequired}
                      onValueChange={(value) => handleSettingChange('passwordSettings', 'passwordStrengthRequired', value)}
                      options={[
                        { value: 'weak', label: 'Weak (minimum 6 characters)' },
                        { value: 'medium', label: 'Medium (8+ characters, mixed case)' },
                        { value: 'strong', label: 'Strong (12+ characters, mixed case, numbers)' },
                        { value: 'very-strong', label: 'Very Strong (16+ characters, special chars)' },
                      ]}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm">Prevent Password Reuse</label>
                      <p className="text-xs text-gray-500">Don&apos;t allow previously used passwords</p>
                    </div>
                    <Switch
                      checked={settings.passwordSettings.preventPasswordReuse}
                      onCheckedChange={(checked) => handleSettingChange('passwordSettings', 'preventPasswordReuse', checked)}
                    />
                  </div>

                  {settings.passwordSettings.preventPasswordReuse && (
                    <div>
                      <label className="font-medium text-sm block mb-2">
                        Remember last {settings.passwordSettings.passwordHistoryCount} passwords
                      </label>
                      <Slider
                        min={1}
                        max={24}
                        step={1}
                        value={[settings.passwordSettings.passwordHistoryCount]}
                        onValueChange={([value]) => handleSettingChange('passwordSettings', 'passwordHistoryCount', value)}
                      />
                    </div>
                  )}

                  {settings.passwordSettings.lastPasswordChange && (
                    <Alert variant="info">
                      <InformationCircleIcon className="w-5 h-5" />
                      <AlertDescription>
                        Last password change: {formatDistanceToNow(settings.passwordSettings.lastPasswordChange, { addSuffix: true })}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full"
                  >
                    <KeyIcon className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DevicePhoneMobileIcon className="w-5 h-5" />
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm">Enable Two-Factor Authentication</label>
                      <p className="text-xs text-gray-500">Require a second verification method when logging in</p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth.enabled}
                      onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', 'enabled', checked)}
                    />
                  </div>

                  {settings.twoFactorAuth.enabled && (
                    <>
                      <div>
                        <label className="font-medium text-sm block mb-2">Authentication Method</label>
                        <Select
                          value={settings.twoFactorAuth.method}
                          onValueChange={(value) => handleSettingChange('twoFactorAuth', 'method', value)}
                          options={[
                            { value: 'app', label: 'Authenticator App (Recommended)' },
                            { value: 'sms', label: 'SMS Text Message' },
                            { value: 'email', label: 'Email Code' },
                            { value: 'hardware', label: 'Hardware Security Key' },
                          ]}
                        />
                        {settings.twoFactorAuth.method === 'app' && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                            <QrCodeIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-700">
                              Use an authenticator app like Google Authenticator or Authy to scan the QR code
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="font-medium text-sm">Backup Codes</label>
                          <p className="text-xs text-gray-500">Generate backup codes for account recovery</p>
                        </div>
                        <Switch
                          checked={settings.twoFactorAuth.backupCodesEnabled}
                          onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', 'backupCodesEnabled', checked)}
                        />
                      </div>

                      {settings.twoFactorAuth.backupCodesEnabled && (
                        <Alert variant="success">
                          <CheckCircleIcon className="w-5 h-5" />
                          <AlertDescription>
                            You have {settings.twoFactorAuth.backupCodesCount} backup codes available
                          </AlertDescription>
                        </Alert>
                      )}

                      {settings.twoFactorAuth.lastUsed && (
                        <Alert variant="info">
                          <InformationCircleIcon className="w-5 h-5" />
                          <AlertDescription>
                            Last used: {formatDistanceToNow(settings.twoFactorAuth.lastUsed, { addSuffix: true })}
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Session Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClockIcon className="w-5 h-5" />
                    Session Management
                  </CardTitle>
                  <CardDescription>
                    Control session timeouts and concurrent logins
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="font-medium text-sm block mb-2">
                      Session Timeout: {settings.sessionSettings.sessionTimeout} minutes
                    </label>
                    <Slider
                      min={5}
                      max={120}
                      step={5}
                      value={[settings.sessionSettings.sessionTimeout]}
                      onValueChange={([value]) => handleSettingChange('sessionSettings', 'sessionTimeout', value)}
                    />
                  </div>

                  <div>
                    <label className="font-medium text-sm block mb-2">
                      Max Concurrent Sessions: {settings.sessionSettings.maxConcurrentSessions}
                    </label>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[settings.sessionSettings.maxConcurrentSessions]}
                      onValueChange={([value]) => handleSettingChange('sessionSettings', 'maxConcurrentSessions', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm">Logout on Browser Close</label>
                      <p className="text-xs text-gray-500">End session when closing browser</p>
                    </div>
                    <Switch
                      checked={settings.sessionSettings.logoutOnClose}
                      onCheckedChange={(checked) => handleSettingChange('sessionSettings', 'logoutOnClose', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm">Remember Device</label>
                      <p className="text-xs text-gray-500">Skip 2FA on trusted devices</p>
                    </div>
                    <Switch
                      checked={settings.sessionSettings.rememberDevice}
                      onCheckedChange={(checked) => handleSettingChange('sessionSettings', 'rememberDevice', checked)}
                    />
                  </div>

                  <Alert variant="info">
                    <ComputerDesktopIcon className="w-5 h-5" />
                    <AlertDescription>
                      You have {settings.sessionSettings.trustedDevicesCount} trusted device{settings.sessionSettings.trustedDevicesCount !== 1 ? 's' : ''}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Login Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LockClosedIcon className="w-5 h-5" />
                    Login Security
                  </CardTitle>
                  <CardDescription>
                    Configure login verification and security measures
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm">Require Email Verification</label>
                      <p className="text-xs text-gray-500">Verify new login attempts via email</p>
                    </div>
                    <Switch
                      checked={settings.loginSecurity.requireEmailVerification}
                      onCheckedChange={(checked) => handleSettingChange('loginSecurity', 'requireEmailVerification', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm">Require Phone Verification</label>
                      <p className="text-xs text-gray-500">Verify new login attempts via SMS</p>
                    </div>
                    <Switch
                      checked={settings.loginSecurity.requirePhoneVerification}
                      onCheckedChange={(checked) => handleSettingChange('loginSecurity', 'requirePhoneVerification', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm">Allow Social Login</label>
                      <p className="text-xs text-gray-500">Enable login via Google, Facebook, etc.</p>
                    </div>
                    <Switch
                      checked={settings.loginSecurity.allowSocialLogin}
                      onCheckedChange={(checked) => handleSettingChange('loginSecurity', 'allowSocialLogin', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm">Enable Biometric Authentication</label>
                      <p className="text-xs text-gray-500">Use fingerprint or face recognition</p>
                    </div>
                    <Switch
                      checked={settings.loginSecurity.enableBiometric}
                      onCheckedChange={(checked) => handleSettingChange('loginSecurity', 'enableBiometric', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm">Enable CAPTCHA</label>
                      <p className="text-xs text-gray-500">Prevent automated login attempts</p>
                    </div>
                    <Switch
                      checked={settings.loginSecurity.captchaEnabled}
                      onCheckedChange={(checked) => handleSettingChange('loginSecurity', 'captchaEnabled', checked)}
                    />
                  </div>

                  <div>
                    <label className="font-medium text-sm block mb-2">
                      Max Login Attempts: {settings.loginSecurity.maxLoginAttempts}
                    </label>
                    <Slider
                      min={3}
                      max={10}
                      step={1}
                      value={[settings.loginSecurity.maxLoginAttempts]}
                      onValueChange={([value]) => handleSettingChange('loginSecurity', 'maxLoginAttempts', value)}
                    />
                  </div>

                  <div>
                    <label className="font-medium text-sm block mb-2">
                      Account Lockout Duration: {settings.loginSecurity.lockoutDuration} minutes
                    </label>
                    <Slider
                      min={5}
                      max={120}
                      step={5}
                      value={[settings.loginSecurity.lockoutDuration]}
                      onValueChange={([value]) => handleSettingChange('loginSecurity', 'lockoutDuration', value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <EyeIcon className="w-5 h-5" />
                    Privacy & Visibility
                  </CardTitle>
                  <CardDescription>
                    Control what information is visible to others
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm">Show Online Status</label>
                      <p className="text-xs text-gray-500">Let others see when you&apos;re online</p>
                    </div>
                    <Switch
                      checked={settings.privacySettings.showOnlineStatus}
                      onCheckedChange={(checked) => handleSettingChange('privacySettings', 'showOnlineStatus', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex items-center gap-2">
                      <label className="font-medium text-sm">Show Last Seen</label>
                      {!settings.privacySettings.showLastSeen && (
                        <EyeSlashIcon className="w-4 h-4 text-gray-400" title="Hidden" />
                      )}
                      <p className="text-xs text-gray-500">Display your last activity time</p>
                    </div>
                    <Switch
                      checked={settings.privacySettings.showLastSeen}
                      onCheckedChange={(checked) => handleSettingChange('privacySettings', 'showLastSeen', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm">Allow Location Tracking</label>
                      <p className="text-xs text-gray-500">Share your approximate location</p>
                    </div>
                    <Switch
                      checked={settings.privacySettings.allowLocationTracking}
                      onCheckedChange={(checked) => handleSettingChange('privacySettings', 'allowLocationTracking', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm">Allow Analytics</label>
                      <p className="text-xs text-gray-500">Help improve our services with usage data</p>
                    </div>
                    <Switch
                      checked={settings.privacySettings.allowAnalytics}
                      onCheckedChange={(checked) => handleSettingChange('privacySettings', 'allowAnalytics', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm">Allow Third-Party Cookies</label>
                      <p className="text-xs text-gray-500">Enable cookies from external services</p>
                    </div>
                    <Switch
                      checked={settings.privacySettings.allowThirdPartyCookies}
                      onCheckedChange={(checked) => handleSettingChange('privacySettings', 'allowThirdPartyCookies', checked)}
                    />
                  </div>

                  <div>
                    <label className="font-medium text-sm block mb-2">
                      Data Retention: {settings.privacySettings.dataRetentionDays} days
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      How long to keep your activity data
                    </p>
                    <Slider
                      min={30}
                      max={1095}
                      step={30}
                      value={[settings.privacySettings.dataRetentionDays]}
                      onValueChange={([value]) => handleSettingChange('privacySettings', 'dataRetentionDays', value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BellAlertIcon className="w-5 h-5" />
                    Security Notifications
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about security events
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm flex items-center gap-2">
                        <EnvelopeIcon className="w-4 h-4" />
                        Email on Login
                      </label>
                      <p className="text-xs text-gray-500">Get notified when you log in</p>
                    </div>
                    <Switch
                      checked={settings.securityNotifications.emailOnLogin}
                      onCheckedChange={(checked) => handleSettingChange('securityNotifications', 'emailOnLogin', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm flex items-center gap-2">
                        <EnvelopeIcon className="w-4 h-4" />
                        Email on Password Change
                      </label>
                      <p className="text-xs text-gray-500">Alert when password is changed</p>
                    </div>
                    <Switch
                      checked={settings.securityNotifications.emailOnPasswordChange}
                      onCheckedChange={(checked) => handleSettingChange('securityNotifications', 'emailOnPasswordChange', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm flex items-center gap-2">
                        <EnvelopeIcon className="w-4 h-4" />
                        Email on Security Event
                      </label>
                      <p className="text-xs text-gray-500">Notify about important security events</p>
                    </div>
                    <Switch
                      checked={settings.securityNotifications.emailOnSecurityEvent}
                      onCheckedChange={(checked) => handleSettingChange('securityNotifications', 'emailOnSecurityEvent', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm flex items-center gap-2">
                        <BellAlertIcon className="w-4 h-4" />
                        Push Notifications
                      </label>
                      <p className="text-xs text-gray-500">Browser push notifications</p>
                    </div>
                    <Switch
                      checked={settings.securityNotifications.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange('securityNotifications', 'pushNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4" />
                        SMS Notifications
                      </label>
                      <p className="text-xs text-gray-500">Text message alerts</p>
                    </div>
                    <Switch
                      checked={settings.securityNotifications.smsNotifications}
                      onCheckedChange={(checked) => handleSettingChange('securityNotifications', 'smsNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm flex items-center gap-2">
                        <DevicePhoneMobileIcon className="w-4 h-4" />
                        Notify on New Device
                      </label>
                      <p className="text-xs text-gray-500">Alert when logging in from new device</p>
                    </div>
                    <Switch
                      checked={settings.securityNotifications.notifyOnNewDevice}
                      onCheckedChange={(checked) => handleSettingChange('securityNotifications', 'notifyOnNewDevice', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        Notify on Suspicious Activity
                      </label>
                      <p className="text-xs text-gray-500">Alert about unusual account activity</p>
                    </div>
                    <Switch
                      checked={settings.securityNotifications.notifyOnSuspiciousActivity}
                      onCheckedChange={(checked) => handleSettingChange('securityNotifications', 'notifyOnSuspiciousActivity', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Cog6ToothIcon className="w-5 h-5" />
                    API & Integrations
                  </CardTitle>
                  <CardDescription>
                    Manage API access and third-party integrations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="font-medium text-sm">Enable API Access</label>
                      <p className="text-xs text-gray-500">Allow programmatic access to your account</p>
                    </div>
                    <Switch
                      checked={settings.apiSettings.apiAccessEnabled}
                      onCheckedChange={(checked) => handleSettingChange('apiSettings', 'apiAccessEnabled', checked)}
                    />
                  </div>

                  {settings.apiSettings.apiAccessEnabled && (
                    <>
                      <Alert variant="info">
                        <InformationCircleIcon className="w-5 h-5" />
                        <AlertDescription>
                          <p className="font-semibold">API Keys: {settings.apiSettings.apiKeysCount}</p>
                          <p className="text-xs mt-1">Manage your API keys in the developer settings</p>
                        </AlertDescription>
                      </Alert>

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="font-medium text-sm">Enable Webhooks</label>
                          <p className="text-xs text-gray-500">Receive real-time event notifications</p>
                        </div>
                        <Switch
                          checked={settings.apiSettings.webhooksEnabled}
                          onCheckedChange={(checked) => handleSettingChange('apiSettings', 'webhooksEnabled', checked)}
                        />
                      </div>
                    </>
                  )}

                  <Alert variant="info">
                    <GlobeAltIcon className="w-5 h-5" />
                    <AlertDescription>
                      You have {settings.apiSettings.oauthAppsCount} connected OAuth applications
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowResetDialog(true)}
                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Reset All Security Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Password Change Modal */}
      <Modal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="lg"
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg mb-4">
              <UserIcon className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-700">Update your password to keep your account secure</p>
            </div>

            <Input
              type="password"
              label="Current Password"
              placeholder="Enter current password"
              required
            />
            <Input
              type="password"
              label="New Password"
              placeholder="Enter new password"
              onChange={(e) => calculatePasswordStrength(e.target.value)}
              required
            />
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Password Strength</span>
              <span>{passwordStrength}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              {/* Dynamic width requires inline style - CSS variables used for runtime calculation */}
              <div
                className={cn(
                  'h-2 rounded-full transition-all',
                  passwordStrength >= 80 ? 'bg-green-500' :
                  passwordStrength >= 60 ? 'bg-blue-500' :
                  passwordStrength >= 40 ? 'bg-yellow-500' :
                  'bg-red-500'
                )}
                style={{ width: `${passwordStrength}%` }}
              />
            </div>
          </div>
          <Input
            type="password"
            label="Confirm New Password"
            placeholder="Confirm new password"
            required
          />
          
          <Button
            onClick={() => setShowPasswordRequirements(!showPasswordRequirements)}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            <InformationCircleIcon className="w-4 h-4 mr-2" />
            Password Requirements
          </Button>

          {showPasswordRequirements && (
            <Alert variant="info">
              <AlertDescription>
                <p className="font-semibold mb-2">Password must contain:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>At least 12 characters</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one lowercase letter</li>
                  <li>At least one number</li>
                  <li>At least one special character</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowPasswordModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1">
              <FingerPrintIcon className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </div>
          </motion.div>
        </AnimatePresence>
      </Modal>

      {/* Reset Settings Dialog */}
      <ConfirmDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        title="Reset Security Settings?"
        description="This will reset all security settings to their default values. This action cannot be undone."
        confirmLabel="Reset Settings"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleResetSettings}
        isLoading={isSaving}
        icon={<XCircleIcon className="w-6 h-6" />}
      />
    </>
  );
};

export default SecuritySettings;

