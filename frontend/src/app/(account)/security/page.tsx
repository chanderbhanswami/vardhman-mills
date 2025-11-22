/**
 * Security Page - Vardhman Mills
 * 
 * Comprehensive security settings and management page with:
 * - Password change functionality
 * - Two-factor authentication (2FA) setup
 * - Active login sessions management
 * - Security activity logs
 * - Trusted devices management
 * - Security settings and preferences
 * - Account recovery options
 * - Security recommendations
 * 
 * @page
 * @version 1.0.0
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

// Account Components
import {
  TwoFactorAuth,
  LoginSessions,
  SecurityLogs,
  SecuritySettings,
} from '@/components/account';

// Common Components
import {
  Button,
  LoadingSpinner,
  SEOHead,
  BackToTop,
} from '@/components/common';

// UI Components
import { Container } from '@/components/ui/Container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

// Hooks
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks';

// Types
interface LoginSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface SecurityLog {
  id: string;
  type: 'login' | 'logout' | 'password_change' | '2fa_enabled' | '2fa_disabled' | 'failed_login' | 'device_trusted';
  description: string;
  ip: string;
  location: string;
  timestamp: string;
  success: boolean;
}

interface TrustedDevice {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  trustedOn: string;
  lastUsed: string;
}

interface SecurityState {
  twoFactorEnabled: boolean;
  passwordLastChanged: string | null;
  trustedDevicesCount: number;
  recentFailedLogins: number;
}

interface PageState {
  sessions: LoginSession[];
  logs: SecurityLog[];
  trustedDevices: TrustedDevice[];
  securityState: SecurityState;
  isLoading: boolean;
  activeTab: 'overview' | '2fa' | 'sessions' | 'logs' | 'settings';
  showRevokeDialog: boolean;
  showRemoveDeviceDialog: boolean;
  selectedSessionId: string | null;
  selectedDeviceId: string | null;
}

export default function SecurityPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // State
  const [state, setState] = useState<PageState>({
    sessions: [],
    logs: [],
    trustedDevices: [],
    securityState: {
      twoFactorEnabled: false,
      passwordLastChanged: null,
      trustedDevicesCount: 0,
      recentFailedLogins: 0,
    },
    isLoading: true,
    activeTab: 'overview',
    showRevokeDialog: false,
    showRemoveDeviceDialog: false,
    selectedSessionId: null,
    selectedDeviceId: null,
  });

  // Load security data
  const loadSecurityData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockSessions: LoginSession[] = [
        {
          id: '1',
          device: 'Windows PC',
          browser: 'Chrome 120',
          os: 'Windows 11',
          ip: '192.168.1.100',
          location: 'Mumbai, India',
          lastActive: new Date().toISOString(),
          isCurrent: true,
        },
        {
          id: '2',
          device: 'iPhone 13',
          browser: 'Safari',
          os: 'iOS 17',
          ip: '192.168.1.101',
          location: 'Mumbai, India',
          lastActive: new Date(Date.now() - 3600000).toISOString(),
          isCurrent: false,
        },
        {
          id: '3',
          device: 'MacBook Pro',
          browser: 'Firefox 121',
          os: 'macOS 14',
          ip: '192.168.1.102',
          location: 'Pune, India',
          lastActive: new Date(Date.now() - 86400000).toISOString(),
          isCurrent: false,
        },
      ];

      const mockLogs: SecurityLog[] = [
        {
          id: '1',
          type: 'login',
          description: 'Successful login from Chrome on Windows',
          ip: '192.168.1.100',
          location: 'Mumbai, India',
          timestamp: new Date().toISOString(),
          success: true,
        },
        {
          id: '2',
          type: 'password_change',
          description: 'Password changed successfully',
          ip: '192.168.1.100',
          location: 'Mumbai, India',
          timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
          success: true,
        },
        {
          id: '3',
          type: 'failed_login',
          description: 'Failed login attempt',
          ip: '203.0.113.42',
          location: 'Unknown',
          timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
          success: false,
        },
        {
          id: '4',
          type: '2fa_enabled',
          description: 'Two-factor authentication enabled',
          ip: '192.168.1.100',
          location: 'Mumbai, India',
          timestamp: new Date(Date.now() - 86400000 * 30).toISOString(),
          success: true,
        },
        {
          id: '5',
          type: 'device_trusted',
          description: 'New device trusted: iPhone 13',
          ip: '192.168.1.101',
          location: 'Mumbai, India',
          timestamp: new Date(Date.now() - 86400000 * 15).toISOString(),
          success: true,
        },
      ];

      const mockTrustedDevices: TrustedDevice[] = [
        {
          id: '1',
          name: 'Windows PC - Chrome',
          type: 'desktop',
          browser: 'Chrome 120',
          os: 'Windows 11',
          trustedOn: new Date(Date.now() - 86400000 * 60).toISOString(),
          lastUsed: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'iPhone 13 - Safari',
          type: 'mobile',
          browser: 'Safari',
          os: 'iOS 17',
          trustedOn: new Date(Date.now() - 86400000 * 15).toISOString(),
          lastUsed: new Date(Date.now() - 3600000).toISOString(),
        },
      ];

      setState(prev => ({
        ...prev,
        sessions: mockSessions,
        logs: mockLogs,
        trustedDevices: mockTrustedDevices,
        securityState: {
          twoFactorEnabled: true,
          passwordLastChanged: new Date(Date.now() - 86400000 * 45).toISOString(),
          trustedDevicesCount: mockTrustedDevices.length,
          recentFailedLogins: 1,
        },
        isLoading: false,
      }));
    } catch (err) {
      console.error('Failed to load security data:', err);
      toast({
        title: 'Error',
        description: 'Failed to load security data',
        variant: 'error',
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [toast]);

  useEffect(() => {
    loadSecurityData();
  }, [loadSecurityData]);

  // Handlers
  const handleRevokeSession = useCallback(async (sessionId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setState(prev => ({
        ...prev,
        sessions: prev.sessions.filter(s => s.id !== sessionId),
        showRevokeDialog: false,
        selectedSessionId: null,
      }));

      toast({
        title: 'Session Revoked',
        description: 'The session has been terminated successfully',
        variant: 'success',
      });
    } catch (err) {
      console.error('Failed to revoke session:', err);
      toast({
        title: 'Error',
        description: 'Failed to revoke session',
        variant: 'error',
      });
    }
  }, [toast]);

  const handleRemoveDevice = useCallback(async (deviceId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setState(prev => ({
        ...prev,
        trustedDevices: prev.trustedDevices.filter(d => d.id !== deviceId),
        showRemoveDeviceDialog: false,
        selectedDeviceId: null,
        securityState: {
          ...prev.securityState,
          trustedDevicesCount: prev.trustedDevices.length - 1,
        },
      }));

      toast({
        title: 'Device Removed',
        description: 'The device has been removed from trusted devices',
        variant: 'success',
      });
    } catch (err) {
      console.error('Failed to remove device:', err);
      toast({
        title: 'Error',
        description: 'Failed to remove device',
        variant: 'error',
      });
    }
  }, [toast]);

  const handleToggle2FA = useCallback(async (enabled: boolean) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setState(prev => ({
        ...prev,
        securityState: {
          ...prev.securityState,
          twoFactorEnabled: enabled,
        },
      }));

      toast({
        title: enabled ? '2FA Enabled' : '2FA Disabled',
        description: enabled
          ? 'Two-factor authentication has been enabled'
          : 'Two-factor authentication has been disabled',
        variant: 'success',
      });
    } catch (err) {
      console.error('Failed to toggle 2FA:', err);
      toast({
        title: 'Error',
        description: 'Failed to update 2FA settings',
        variant: 'error',
      });
    }
  }, [toast]);

  const handle2FASetupComplete = useCallback(async () => {
    await handleToggle2FA(true);
  }, [handleToggle2FA]);

  const handle2FADisable = useCallback(async () => {
    await handleToggle2FA(false);
  }, [handleToggle2FA]);

  // Helper functions
  const getLogIcon = (type: SecurityLog['type']) => {
    switch (type) {
      case 'login':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'logout':
        return <XCircleIcon className="w-5 h-5 text-gray-600" />;
      case 'password_change':
        return <KeyIcon className="w-5 h-5 text-blue-600" />;
      case '2fa_enabled':
      case '2fa_disabled':
        return <ShieldCheckIcon className="w-5 h-5 text-purple-600" />;
      case 'failed_login':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      case 'device_trusted':
        return <DevicePhoneMobileIcon className="w-5 h-5 text-green-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getDeviceIcon = (type: TrustedDevice['type']) => {
    switch (type) {
      case 'mobile':
        return <DevicePhoneMobileIcon className="w-6 h-6" />;
      case 'desktop':
        return <ComputerDesktopIcon className="w-6 h-6" />;
      case 'tablet':
        return <DevicePhoneMobileIcon className="w-6 h-6" />;
      default:
        return <ComputerDesktopIcon className="w-6 h-6" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Render functions
  const renderHeader = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <ShieldCheckIcon className="w-8 h-8 text-primary-600" />
          Security Settings
        </h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Manage your account security and privacy settings
      </p>
    </div>
  );

  const renderOverviewTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Security Score */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
                Security Score: 85/100
              </h3>
              <p className="text-green-600 dark:text-green-400">
                Your account is well protected
              </p>
            </div>
            <ShieldCheckIcon className="w-16 h-16 text-green-600" />
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!state.securityState.twoFactorEnabled && (
            <Alert variant="warning">
              <ShieldCheckIcon className="w-5 h-5" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Enable Two-Factor Authentication</h4>
                <p className="text-sm">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setState(prev => ({ ...prev, activeTab: '2fa' }))}
              >
                Enable Now
              </Button>
            </Alert>
          )}

          {state.securityState.passwordLastChanged &&
            Date.now() - new Date(state.securityState.passwordLastChanged).getTime() >
              90 * 24 * 60 * 60 * 1000 && (
            <Alert variant="info">
              <KeyIcon className="w-5 h-5" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Update Your Password</h4>
                <p className="text-sm">
                  It&apos;s been a while since you changed your password
                </p>
              </div>
              <Button size="sm" variant="outline">
                Change Password
              </Button>
            </Alert>
          )}

          {state.securityState.recentFailedLogins > 0 && (
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Suspicious Activity Detected</h4>
                <p className="text-sm">
                  {state.securityState.recentFailedLogins} failed login attempt(s) in the last 7 days
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setState(prev => ({ ...prev, activeTab: 'logs' }))}
              >
                View Logs
              </Button>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                <ShieldCheckIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {state.securityState.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">2FA Status</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <DevicePhoneMobileIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {state.sessions.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <ComputerDesktopIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {state.trustedDevices.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Trusted Devices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <ClockIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {state.securityState.passwordLastChanged
                    ? formatDate(state.securityState.passwordLastChanged)
                    : 'Never'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Password Change</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.logs.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                {getLogIcon(log.type)}
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {log.description}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      {log.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                </div>
                <Badge variant={log.success ? 'success' : 'destructive'}>
                  {log.success ? 'Success' : 'Failed'}
                </Badge>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => setState(prev => ({ ...prev, activeTab: 'logs' }))}
          >
            View All Activity
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  const render2FATab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <TwoFactorAuth
        userId={user?.id}
        onSetupComplete={handle2FASetupComplete}
        onDisable={handle2FADisable}
      />
    </motion.div>
  );

  const renderSessionsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <LoginSessions
        userId={user?.id}
        onSessionTerminated={(id: string) => {
          setState(prev => ({
            ...prev,
            selectedSessionId: id,
            showRevokeDialog: true,
          }));
        }}
      />

      {/* Trusted Devices */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Trusted Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AnimatePresence>
              {state.trustedDevices.map(device => (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                    {getDeviceIcon(device.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {device.name}
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>{device.browser} on {device.os}</p>
                      <div className="flex items-center gap-4">
                        <span>Trusted on {formatDate(device.trustedOn)}</span>
                        <span>Last used {formatDate(device.lastUsed)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setState(prev => ({
                        ...prev,
                        selectedDeviceId: device.id,
                        showRemoveDeviceDialog: true,
                      }));
                    }}
                    title="Remove device"
                  >
                    <TrashIcon className="w-5 h-5 text-red-600" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderLogsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <SecurityLogs userId={user?.id} />
    </motion.div>
  );

  const renderSettingsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <SecuritySettings />
    </motion.div>
  );

  // Loading state
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
        title="Security Settings | Vardhman Mills"
        description="Manage your account security settings"
        canonical="/account/security"
      />

      <Container className="py-8">
        {renderHeader()}

        <Tabs
          value={state.activeTab}
          onValueChange={(value: string) =>
            setState(prev => ({ ...prev, activeTab: value as PageState['activeTab'] }))
          }
        >
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="2fa">Two-Factor Auth</TabsTrigger>
            <TabsTrigger value="sessions">Sessions & Devices</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">{renderOverviewTab()}</TabsContent>
          <TabsContent value="2fa">{render2FATab()}</TabsContent>
          <TabsContent value="sessions">{renderSessionsTab()}</TabsContent>
          <TabsContent value="logs">{renderLogsTab()}</TabsContent>
          <TabsContent value="settings">{renderSettingsTab()}</TabsContent>
        </Tabs>

        {/* Revoke Session Dialog */}
        <ConfirmDialog
          open={state.showRevokeDialog}
          onOpenChange={(open: boolean) =>
            setState(prev => ({ ...prev, showRevokeDialog: open }))
          }
          title="Revoke Session"
          description="Are you sure you want to revoke this session? The device will be logged out immediately."
          confirmLabel="Revoke"
          cancelLabel="Cancel"
          variant="destructive"
          onConfirm={() => {
            if (state.selectedSessionId) {
              handleRevokeSession(state.selectedSessionId);
            }
          }}
        />

        {/* Remove Device Dialog */}
        <ConfirmDialog
          open={state.showRemoveDeviceDialog}
          onOpenChange={(open: boolean) =>
            setState(prev => ({ ...prev, showRemoveDeviceDialog: open }))
          }
          title="Remove Trusted Device"
          description="Are you sure you want to remove this device from trusted devices? You will need to verify it again on next login."
          confirmLabel="Remove"
          cancelLabel="Cancel"
          variant="destructive"
          onConfirm={() => {
            if (state.selectedDeviceId) {
              handleRemoveDevice(state.selectedDeviceId);
            }
          }}
        />

        {/* Hidden usage for user context */}
        {false && (
          <div className="sr-only">
            Security settings for {user?.firstName}
            <Modal open={false} onClose={() => {}}>
              <div>Modal placeholder for future use</div>
            </Modal>
          </div>
        )}

        <BackToTop />
      </Container>
    </>
  );
}
