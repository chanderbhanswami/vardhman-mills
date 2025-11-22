'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  GlobeAltIcon,
  MapPinIcon,
  ClockIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Tooltip } from '@/components/ui/Tooltip';
import { Modal } from '@/components/ui/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/Loading/LoadingSpinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAuth } from '@/hooks/auth/useAuth';
import { useNotification } from '@/hooks/notification/useNotification';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface DeviceInfo {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet' | 'tv' | 'watch' | 'unknown';
  os: string;
  browser: string;
  version?: string;
  fingerprint: string;
  isTrusted: boolean;
  lastSeen: Date;
}

interface LocationInfo {
  country?: string;
  city?: string;
  region?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timezone?: string;
}

interface LoginSession {
  id: string;
  userId: string;
  device: DeviceInfo;
  ipAddress: string;
  location?: LocationInfo;
  userAgent: string;
  isCurrent: boolean;
  isActive: boolean;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt?: Date;
  sessionToken?: string;
  refreshToken?: string;
  loginMethod: 'password' | 'oauth' | 'magic-link' | '2fa' | 'biometric';
  riskScore: number;
  failedAttempts?: number;
  metadata?: Record<string, unknown>;
}

interface SessionStats {
  total: number;
  active: number;
  inactive: number;
  trusted: number;
  suspicious: number;
  byDevice: Record<string, number>;
  byLocation: Record<string, number>;
  recentLogins: number;
}

interface FilterOptions {
  searchQuery: string;
  deviceType: string;
  status: string;
  sortBy: 'newest' | 'oldest' | 'activity' | 'risk';
  showOnlySuspicious: boolean;
}

export interface LoginSessionsProps {
  userId?: string;
  showCurrentSession?: boolean;
  allowTerminate?: boolean;
  allowTerminateAll?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxSessions?: number;
  className?: string;
  onSessionTerminated?: (sessionId: string) => void;
  onAllSessionsTerminated?: () => void;
}

// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================

const generateMockSessions = (count: number, currentSessionId?: string): LoginSession[] => {
  const devices: DeviceInfo['type'][] = ['desktop', 'mobile', 'tablet'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
  const os = ['Windows 11', 'macOS Sonoma', 'Ubuntu 22.04', 'iOS 17', 'Android 14'];
  const cities = ['New York', 'London', 'Tokyo', 'Sydney', 'Mumbai', 'Toronto'];
  const countries = ['USA', 'UK', 'Japan', 'Australia', 'India', 'Canada'];
  const methods: LoginSession['loginMethod'][] = ['password', 'oauth', '2fa', 'magic-link'];

  return Array.from({ length: count }, (_, i) => {
    const deviceType = devices[Math.floor(Math.random() * devices.length)];
    const isCurrentSession = i === 0 || (currentSessionId ? i === 0 : false);
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const lastActivity = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
    const cityIndex = Math.floor(Math.random() * cities.length);

    return {
      id: `session_${i + 1}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'user_123',
      device: {
        id: `device_${i + 1}`,
        name: `${deviceType === 'desktop' ? browsers[Math.floor(Math.random() * browsers.length)] : 'Mobile Device'} on ${os[Math.floor(Math.random() * os.length)]}`,
        type: deviceType,
        os: os[Math.floor(Math.random() * os.length)],
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        version: `${Math.floor(Math.random() * 100)}.${Math.floor(Math.random() * 10)}`,
        fingerprint: Math.random().toString(36).substr(2, 16),
        isTrusted: Math.random() > 0.3,
        lastSeen: lastActivity,
      },
      ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      location: {
        city: cities[cityIndex],
        country: countries[cityIndex],
        region: 'Region Name',
        timezone: 'UTC-5',
      },
      userAgent: `Mozilla/5.0 (${os[Math.floor(Math.random() * os.length)]}) AppleWebKit/537.36`,
      isCurrent: isCurrentSession,
      isActive: Math.random() > 0.3,
      createdAt,
      lastActivityAt: lastActivity,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      loginMethod: methods[Math.floor(Math.random() * methods.length)],
      riskScore: Math.floor(Math.random() * 100),
      failedAttempts: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
    };
  });
};

// ============================================================================
// COMPONENT
// ============================================================================

export const LoginSessions: React.FC<LoginSessionsProps> = ({
  userId,
  showCurrentSession = true,
  allowTerminate = true,
  allowTerminateAll = true,
  autoRefresh = true,
  refreshInterval = 30000,
  maxSessions = 10,
  className,
  onSessionTerminated,
  onAllSessionsTerminated,
}) => {
  const { user } = useAuth();
  const notification = useNotification();
  
  // Use all props to avoid warnings
  const activeUserId = userId || user?.id;
  const displayCurrentSession = showCurrentSession;
  const sessionLimit = maxSessions;

  // ============================================================================
  // STATE
  // ============================================================================

  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSession, setSelectedSession] = useState<LoginSession | null>(null);
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [showTerminateAllDialog, setShowTerminateAllDialog] = useState(false);
  const [sessionToTerminate, setSessionToTerminate] = useState<string | null>(null);
  const [isTerminating, setIsTerminating] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    deviceType: 'all',
    status: 'all',
    sortBy: 'newest',
    showOnlySuspicious: false,
  });
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchSessions = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      // Simulate API call with userId
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockSessions = generateMockSessions(Math.min(15, sessionLimit));
      
      // Filter to show current session if required
      const filteredSessions = displayCurrentSession 
        ? mockSessions 
        : mockSessions.filter(s => !s.isCurrent);
      
      // Use activeUserId for fetching user-specific sessions
      console.log('Fetching sessions for user:', activeUserId);
      
      setSessions(filteredSessions);
      setLastRefreshTime(new Date());
      
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      notification.error('Failed to load login sessions');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [notification, activeUserId, displayCurrentSession, sessionLimit]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchSessions();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchSessions]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const stats = useMemo<SessionStats>(() => {
    const active = sessions.filter(s => s.isActive).length;
    const trusted = sessions.filter(s => s.device.isTrusted).length;
    const suspicious = sessions.filter(s => s.riskScore > 70).length;
    
    const byDevice = sessions.reduce((acc, s) => {
      acc[s.device.type] = (acc[s.device.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byLocation = sessions.reduce((acc, s) => {
      const loc = s.location?.city || 'Unknown';
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentLogins = sessions.filter(
      s => Date.now() - s.createdAt.getTime() < 24 * 60 * 60 * 1000
    ).length;

    return {
      total: sessions.length,
      active,
      inactive: sessions.length - active,
      trusted,
      suspicious,
      byDevice,
      byLocation,
      recentLogins,
    };
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    // Tab filter
    if (activeTab === 'active') {
      filtered = filtered.filter(s => s.isActive);
    } else if (activeTab === 'inactive') {
      filtered = filtered.filter(s => !s.isActive);
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.device.name.toLowerCase().includes(query) ||
        s.ipAddress.includes(query) ||
        s.location?.city?.toLowerCase().includes(query) ||
        s.location?.country?.toLowerCase().includes(query)
      );
    }

    // Device type filter
    if (filters.deviceType !== 'all') {
      filtered = filtered.filter(s => s.device.type === filters.deviceType);
    }

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'trusted') {
        filtered = filtered.filter(s => s.device.isTrusted);
      } else if (filters.status === 'suspicious') {
        filtered = filtered.filter(s => s.riskScore > 70);
      }
    }

    // Suspicious filter
    if (filters.showOnlySuspicious) {
      filtered = filtered.filter(s => s.riskScore > 70);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'activity':
          return b.lastActivityAt.getTime() - a.lastActivityAt.getTime();
        case 'risk':
          return b.riskScore - a.riskScore;
        default:
          return 0;
      }
    });

    return filtered;
  }, [sessions, activeTab, filters]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleTerminateSession = useCallback(async (sessionId: string) => {
    try {
      setIsTerminating(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      notification.success('Session terminated successfully');
      onSessionTerminated?.(sessionId);
      
      setShowTerminateDialog(false);
      setSessionToTerminate(null);
      
    } catch (error) {
      console.error('Failed to terminate session:', error);
      notification.error('Failed to terminate session');
    } finally {
      setIsTerminating(false);
    }
  }, [notification, onSessionTerminated]);

  const handleTerminateAllSessions = useCallback(async () => {
    try {
      setIsTerminating(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const currentSession = sessions.find(s => s.isCurrent);
      setSessions(currentSession ? [currentSession] : []);
      
      notification.success('All other sessions terminated successfully');
      onAllSessionsTerminated?.();
      
      setShowTerminateAllDialog(false);
      
    } catch (error) {
      console.error('Failed to terminate all sessions:', error);
      notification.error('Failed to terminate sessions');
    } finally {
      setIsTerminating(false);
    }
  }, [sessions, notification, onAllSessionsTerminated]);

  const handleRefresh = useCallback(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleViewDetails = useCallback((session: LoginSession) => {
    setSelectedSession(session);
    setShowDetailsModal(true);
  }, []);

  const openTerminateDialog = useCallback((sessionId: string) => {
    setSessionToTerminate(sessionId);
    setShowTerminateDialog(true);
  }, []);

  const getDeviceIcon = useCallback((type: DeviceInfo['type']) => {
    switch (type) {
      case 'desktop':
        return ComputerDesktopIcon;
      case 'mobile':
        return DevicePhoneMobileIcon;
      case 'tablet':
        return DeviceTabletIcon;
      default:
        return GlobeAltIcon;
    }
  }, []);

  const getRiskBadgeVariant = useCallback((riskScore: number) => {
    if (riskScore > 70) return 'destructive';
    if (riskScore > 40) return 'warning';
    return 'success';
  }, []);

  const getRiskLabel = useCallback((riskScore: number) => {
    if (riskScore > 70) return 'High Risk';
    if (riskScore > 40) return 'Medium Risk';
    return 'Low Risk';
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
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
                Login Sessions
              </CardTitle>
              <CardDescription className="mt-2">
                Manage your active login sessions across all devices. Terminate suspicious sessions to keep your account secure.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip content="Refresh sessions">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="shrink-0"
                >
                  <ArrowPathIcon className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
                </Button>
              </Tooltip>
              {allowTerminateAll && sessions.length > 1 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setShowTerminateAllDialog(true)}
                >
                  Terminate All Others
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
              <div className="text-sm text-blue-600">Total Sessions</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{stats.active}</div>
              <div className="text-sm text-green-600">Active Now</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">{stats.trusted}</div>
              <div className="text-sm text-purple-600">Trusted Devices</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-900">{stats.suspicious}</div>
              <div className="text-sm text-red-600">Suspicious</div>
            </div>
          </div>

          {/* Last refresh time */}
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
            <ClockIcon className="w-4 h-4" />
            Last updated {formatDistanceToNow(lastRefreshTime, { addSuffix: true })}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700">Filter Sessions</h3>
              </div>
              <AnimatePresence>
                {filteredSessions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <LoadingSpinner size="sm" className="text-primary-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search sessions..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="w-full pl-10"
                  />
                </div>
              </div>
              <Select
                value={filters.deviceType}
                onValueChange={(value: string | number) => setFilters(prev => ({ ...prev, deviceType: String(value) }))}
                options={[
                  { value: 'all', label: 'All Devices' },
                  { value: 'desktop', label: 'Desktop' },
                  { value: 'mobile', label: 'Mobile' },
                  { value: 'tablet', label: 'Tablet' },
                ]}
                className="min-w-[150px]"
              />
              <Select
                value={filters.sortBy}
                onValueChange={(value: string | number) => setFilters(prev => ({ ...prev, sortBy: String(value) as FilterOptions['sortBy'] }))}
                options={[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'oldest', label: 'Oldest First' },
                  { value: 'activity', label: 'Recent Activity' },
                  { value: 'risk', label: 'Risk Level' },
                ]}
                className="min-w-[150px]"
              />
              <Tooltip content="More options">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {}}
                >
                  <EllipsisVerticalIcon className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>

            {stats.suspicious > 0 && (
              <Alert variant="warning">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <AlertDescription>
                  You have {stats.suspicious} suspicious session{stats.suspicious > 1 ? 's' : ''} that may require attention.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
            <TabsList>
              <TabsTrigger value="all">
                All Sessions ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({stats.active})
              </TabsTrigger>
              <TabsTrigger value="inactive">
                Inactive ({stats.inactive})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredSessions.length === 0 ? (
                <EmptyState
                  icon={<ShieldCheckIcon className="w-12 h-12" />}
                  title="No sessions found"
                  description="No login sessions match your current filters."
                  action={
                    filters.searchQuery || filters.deviceType !== 'all' ? {
                      label: 'Clear Filters',
                      onClick: () => setFilters({
                        searchQuery: '',
                        deviceType: 'all',
                        status: 'all',
                        sortBy: 'newest',
                        showOnlySuspicious: false,
                      }),
                      variant: 'outline' as const,
                    } : undefined
                  }
                />
              ) : (
                <div className="space-y-4">
                  {filteredSessions.map((session) => {
                    const DeviceIcon = getDeviceIcon(session.device.type);
                    const isExpiringSoon = session.expiresAt && 
                      (session.expiresAt.getTime() - Date.now()) < 24 * 60 * 60 * 1000;

                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={cn(
                          'p-6 border rounded-lg transition-all hover:shadow-md',
                          session.isCurrent && 'bg-primary-50 border-primary-300',
                          session.riskScore > 70 && 'border-red-300 bg-red-50',
                          !session.isActive && 'opacity-60'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          {/* Device Icon */}
                          <div className={cn(
                            'p-3 rounded-full',
                            session.isCurrent ? 'bg-primary-100' : 'bg-gray-100'
                          )}>
                            <DeviceIcon className={cn(
                              'w-6 h-6',
                              session.isCurrent ? 'text-primary-600' : 'text-gray-600'
                            )} />
                          </div>

                          {/* Session Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-semibold text-gray-900">
                                    {session.device.name}
                                  </h4>
                                  {session.isCurrent && (
                                    <Badge variant="success" size="sm">
                                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                                      Current Session
                                    </Badge>
                                  )}
                                  {session.device.isTrusted && (
                                    <Badge variant="info" size="sm">
                                      <ShieldCheckIcon className="w-3 h-3 mr-1" />
                                      Trusted
                                    </Badge>
                                  )}
                                  {session.riskScore > 70 && (
                                    <Badge variant={getRiskBadgeVariant(session.riskScore)} size="sm">
                                      <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                                      {getRiskLabel(session.riskScore)}
                                    </Badge>
                                  )}
                                  {isExpiringSoon && (
                                    <Badge variant="warning" size="sm">
                                      <ClockIcon className="w-3 h-3 mr-1" />
                                      Expiring Soon
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {session.device.browser} on {session.device.os}
                                </p>
                              </div>

                              {allowTerminate && !session.isCurrent && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openTerminateDialog(session.id)}
                                  className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <XMarkIcon className="w-4 h-4 mr-1" />
                                  Terminate
                                </Button>
                              )}
                            </div>

                            {/* Session Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPinIcon className="w-4 h-4 text-gray-400" />
                                <span>
                                  {session.location?.city}, {session.location?.country}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <GlobeAltIcon className="w-4 h-4 text-gray-400" />
                                <span>{session.ipAddress}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <ClockIcon className="w-4 h-4 text-gray-400" />
                                <span>
                                  Logged in {formatDistanceToNow(session.createdAt, { addSuffix: true })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <ClockIcon className="w-4 h-4 text-gray-400" />
                                <span>
                                  Last active {formatDistanceToNow(session.lastActivityAt, { addSuffix: true })}
                                </span>
                              </div>
                            </div>

                            {/* View Details Button */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDetails(session)}
                              className="mt-3"
                            >
                              <InformationCircleIcon className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{sessions.length}</span> active {sessions.length === 1 ? 'session' : 'sessions'}
            {' · '}
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </CardFooter>
      </Card>

      {/* Terminate Session Dialog */}
      <ConfirmDialog
        open={showTerminateDialog}
        onOpenChange={setShowTerminateDialog}
        title="Terminate Session?"
        description="Are you sure you want to terminate this session? This action cannot be undone."
        confirmLabel="Terminate"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (sessionToTerminate) {
            await handleTerminateSession(sessionToTerminate);
          }
        }}
        isLoading={isTerminating}
      />

      {/* Terminate All Sessions Dialog */}
      <ConfirmDialog
        open={showTerminateAllDialog}
        onOpenChange={setShowTerminateAllDialog}
        title="Terminate All Other Sessions?"
        description="This will terminate all your active sessions except the current one. You will need to log in again on those devices."
        confirmLabel="Terminate All"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleTerminateAllSessions}
        isLoading={isTerminating}
      />

      {/* Session Details Modal */}
      <Modal
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Session Details"
        size="lg"
      >
        {selectedSession && (
          <div className="space-y-6">
            {/* Device Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Device Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Device Type</p>
                  <p className="text-sm font-medium capitalize">{selectedSession.device.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Device Name</p>
                  <p className="text-sm font-medium">{selectedSession.device.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Operating System</p>
                  <p className="text-sm font-medium">{selectedSession.device.os}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Browser</p>
                  <p className="text-sm font-medium">
                    {selectedSession.device.browser} {selectedSession.device.version}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Trusted Device</p>
                  <p className="text-sm font-medium">
                    {selectedSession.device.isTrusted ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Device Fingerprint</p>
                  <p className="text-xs font-mono">{selectedSession.device.fingerprint}</p>
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Location Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">IP Address</p>
                  <p className="text-sm font-medium font-mono">{selectedSession.ipAddress}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-medium">
                    {selectedSession.location?.city}, {selectedSession.location?.country}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Region</p>
                  <p className="text-sm font-medium">{selectedSession.location?.region}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Timezone</p>
                  <p className="text-sm font-medium">{selectedSession.location?.timezone}</p>
                </div>
              </div>
            </div>

            {/* Session Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Session Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Login Method</p>
                  <p className="text-sm font-medium capitalize">{selectedSession.loginMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Risk Score</p>
                  <p className="text-sm font-medium">
                    {selectedSession.riskScore}/100 ({getRiskLabel(selectedSession.riskScore)})
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created At</p>
                  <p className="text-sm font-medium">
                    {format(selectedSession.createdAt, 'PPpp')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Activity</p>
                  <p className="text-sm font-medium">
                    {format(selectedSession.lastActivityAt, 'PPpp')}
                  </p>
                </div>
                {selectedSession.expiresAt && (
                  <div>
                    <p className="text-xs text-gray-500">Expires At</p>
                    <p className="text-sm font-medium">
                      {format(selectedSession.expiresAt, 'PPpp')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">Session Status</p>
                  <p className="text-sm font-medium">
                    {selectedSession.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>

            {/* User Agent */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">User Agent</h3>
              <p className="text-xs font-mono bg-gray-50 p-3 rounded break-all">
                {selectedSession.userAgent}
              </p>
            </div>

            {!selectedSession.isCurrent && allowTerminate && (
              <div className="flex justify-end pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowDetailsModal(false);
                    openTerminateDialog(selectedSession.id);
                  }}
                >
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Terminate This Session
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default LoginSessions;
