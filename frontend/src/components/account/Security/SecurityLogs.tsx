'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
  LockOpenIcon,
  KeyIcon,
  UserIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  MapPinIcon,
  ClockIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  InformationCircleIcon,
  BellAlertIcon,
  CreditCardIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
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
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAuth } from '@/hooks/auth/useAuth';
import { useNotification } from '@/hooks/notification/useNotification';
import { formatDistanceToNow, format, startOfDay, endOfDay, subDays, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type SecurityEventType = 
  | 'login_success' 
  | 'login_failed' 
  | 'logout' 
  | 'password_change' 
  | 'password_reset' 
  | '2fa_enabled' 
  | '2fa_disabled' 
  | '2fa_verified' 
  | '2fa_failed'
  | 'email_change' 
  | 'email_verified' 
  | 'phone_change' 
  | 'phone_verified'
  | 'profile_updated' 
  | 'avatar_changed'
  | 'session_created' 
  | 'session_terminated'
  | 'device_added' 
  | 'device_removed' 
  | 'device_trusted'
  | 'suspicious_activity' 
  | 'account_locked' 
  | 'account_unlocked'
  | 'permission_changed' 
  | 'role_changed'
  | 'api_key_created' 
  | 'api_key_revoked'
  | 'payment_method_added' 
  | 'payment_method_removed'
  | 'privacy_settings_changed'
  | 'notification_settings_changed'
  | 'gdpr_request'
  | 'data_export'
  | 'data_deletion';

type SecurityEventSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

interface SecurityEvent {
  id: string;
  userId: string;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  title: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  device: {
    type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    name: string;
    os: string;
    browser: string;
  };
  metadata?: Record<string, unknown>;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  requiresAction: boolean;
  actionTaken?: boolean;
  actionTakenAt?: Date;
  relatedEventIds?: string[];
}

interface SecurityStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  bySeverity: Record<SecurityEventSeverity, number>;
  byType: Record<string, number>;
  criticalUnacknowledged: number;
  suspiciousActivities: number;
  failedLogins: number;
}

interface FilterOptions {
  searchQuery: string;
  severity: SecurityEventSeverity | 'all';
  eventType: SecurityEventType | 'all';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  customStartDate?: Date;
  customEndDate?: Date;
  showOnlyUnacknowledged: boolean;
  showOnlyRequiringAction: boolean;
  sortBy: 'newest' | 'oldest' | 'severity';
}

export interface SecurityLogsProps {
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  itemsPerPage?: number;
  showFilters?: boolean;
  showExport?: boolean;
  showStats?: boolean;
  allowAcknowledge?: boolean;
  allowExport?: boolean;
  className?: string;
  onEventAcknowledged?: (eventId: string) => void;
  onExportRequested?: (events: SecurityEvent[]) => void;
}

// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================

const generateMockSecurityEvents = (count: number): SecurityEvent[] => {
  const types: SecurityEventType[] = [
    'login_success', 'login_failed', 'logout', 'password_change', '2fa_enabled',
    '2fa_verified', 'email_change', 'profile_updated', 'session_created',
    'session_terminated', 'device_added', 'suspicious_activity', 'account_locked',
    'permission_changed', 'api_key_created', 'payment_method_added',
    'privacy_settings_changed', 'data_export'
  ];

  const severities: SecurityEventSeverity[] = ['info', 'low', 'medium', 'high', 'critical'];
  const devices = ['desktop', 'mobile', 'tablet'] as const;
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const os = ['Windows 11', 'macOS Sonoma', 'iOS 17', 'Android 14'];
  const cities = ['New York', 'London', 'Tokyo', 'Sydney', 'Mumbai'];
  const countries = ['USA', 'UK', 'Japan', 'Australia', 'India'];

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const deviceType = devices[Math.floor(Math.random() * devices.length)];
    const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const cityIndex = Math.floor(Math.random() * cities.length);

    return {
      id: `event_${i + 1}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'user_123',
      type,
      severity,
      title: type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: `Security event: ${type.replace(/_/g, ' ')}`,
      ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: `Mozilla/5.0 (${os[Math.floor(Math.random() * os.length)]}) AppleWebKit/537.36`,
      location: {
        city: cities[cityIndex],
        country: countries[cityIndex],
        region: 'Region Name',
      },
      device: {
        type: deviceType,
        name: `${browsers[Math.floor(Math.random() * browsers.length)]} on ${os[Math.floor(Math.random() * os.length)]}`,
        os: os[Math.floor(Math.random() * os.length)],
        browser: browsers[Math.floor(Math.random() * browsers.length)],
      },
      metadata: {
        source: 'web',
        version: '1.0.0',
      },
      timestamp,
      acknowledged: Math.random() > 0.6,
      acknowledgedAt: Math.random() > 0.6 ? new Date(timestamp.getTime() + 1000 * 60 * 30) : undefined,
      requiresAction: severity === 'critical' || severity === 'high',
      actionTaken: Math.random() > 0.7,
      actionTakenAt: Math.random() > 0.7 ? new Date(timestamp.getTime() + 1000 * 60 * 60) : undefined,
    };
  });
};

// ============================================================================
// COMPONENT
// ============================================================================

export const SecurityLogs: React.FC<SecurityLogsProps> = ({
  userId,
  autoRefresh = true,
  refreshInterval = 60000,
  itemsPerPage = 20,
  showFilters = true,
  showExport = true,
  showStats = true,
  allowAcknowledge = true,
  allowExport = true,
  className,
  onEventAcknowledged,
  onExportRequested,
}) => {
  const { user } = useAuth();
  const notification = useNotification();
  
  // Use userId with fallback to authenticated user
  const activeUserId = userId || user?.id;

  // ============================================================================
  // STATE
  // ============================================================================

  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    severity: 'all',
    eventType: 'all',
    dateRange: 'all',
    showOnlyUnacknowledged: false,
    showOnlyRequiringAction: false,
    sortBy: 'newest',
  });
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'unacknowledged'>('all');

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchSecurityEvents = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      // Simulate API call - Use activeUserId for fetching user-specific events
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockEvents = generateMockSecurityEvents(100);
      // Filter by userId if provided
      const userEvents = activeUserId ? mockEvents.map(e => ({ ...e, userId: activeUserId })) : mockEvents;
      setEvents(userEvents);
      setLastRefreshTime(new Date());
      
    } catch (error) {
      console.error('Failed to fetch security events:', error);
      notification.error('Failed to load security logs');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [notification, activeUserId]);

  useEffect(() => {
    fetchSecurityEvents();
  }, [fetchSecurityEvents]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchSecurityEvents();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchSecurityEvents]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const stats = useMemo<SecurityStats>(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekAgo = subDays(now, 7);
    const monthAgo = subDays(now, 30);

    const bySeverity = events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<SecurityEventSeverity, number>);

    const byType = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: events.length,
      today: events.filter(e => e.timestamp >= todayStart).length,
      thisWeek: events.filter(e => e.timestamp >= weekAgo).length,
      thisMonth: events.filter(e => e.timestamp >= monthAgo).length,
      bySeverity,
      byType,
      criticalUnacknowledged: events.filter(e => e.severity === 'critical' && !e.acknowledged).length,
      suspiciousActivities: events.filter(e => e.type === 'suspicious_activity').length,
      failedLogins: events.filter(e => e.type === 'login_failed').length,
    };
  }, [events]);

  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Tab filter
    if (activeTab === 'critical') {
      filtered = filtered.filter(e => e.severity === 'critical' || e.severity === 'high');
    } else if (activeTab === 'unacknowledged') {
      filtered = filtered.filter(e => !e.acknowledged);
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.ipAddress.includes(query) ||
        e.location?.city?.toLowerCase().includes(query)
      );
    }

    // Severity filter
    if (filters.severity !== 'all') {
      filtered = filtered.filter(e => e.severity === filters.severity);
    }

    // Event type filter
    if (filters.eventType !== 'all') {
      filtered = filtered.filter(e => e.type === filters.eventType);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      let endDate: Date = now;

      switch (filters.dateRange) {
        case 'today':
          startDate = startOfDay(now);
          endDate = endOfDay(now);
          break;
        case 'week':
          startDate = subDays(now, 7);
          break;
        case 'month':
          startDate = subDays(now, 30);
          break;
        case 'custom':
          if (filters.customStartDate && filters.customEndDate) {
            startDate = filters.customStartDate;
            endDate = filters.customEndDate;
          } else {
            startDate = subDays(now, 30);
          }
          break;
        default:
          startDate = subDays(now, 30);
      }

      filtered = filtered.filter(e =>
        isWithinInterval(e.timestamp, { start: startDate, end: endDate })
      );
    }

    // Unacknowledged filter
    if (filters.showOnlyUnacknowledged) {
      filtered = filtered.filter(e => !e.acknowledged);
    }

    // Requires action filter
    if (filters.showOnlyRequiringAction) {
      filtered = filtered.filter(e => e.requiresAction && !e.actionTaken);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return b.timestamp.getTime() - a.timestamp.getTime();
        case 'oldest':
          return a.timestamp.getTime() - b.timestamp.getTime();
        case 'severity':
          const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, activeTab, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAcknowledgeEvent = useCallback(async (eventId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, acknowledged: true, acknowledgedAt: new Date() }
          : e
      ));
      
      notification.success('Event acknowledged');
      onEventAcknowledged?.(eventId);
      
    } catch (error) {
      console.error('Failed to acknowledge event:', error);
      notification.error('Failed to acknowledge event');
    }
  }, [notification, onEventAcknowledged]);

  const handleAcknowledgeAll = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEvents(prev => prev.map(e => ({ 
        ...e, 
        acknowledged: true, 
        acknowledgedAt: new Date() 
      })));
      
      notification.success('All events acknowledged');
      
    } catch (error) {
      console.error('Failed to acknowledge all events:', error);
      notification.error('Failed to acknowledge events');
    }
  }, [notification]);

  const handleExportLogs = useCallback(async () => {
    try {
      setIsExporting(true);
      
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const exportData = filteredEvents.map(e => ({
        timestamp: format(e.timestamp, 'yyyy-MM-dd HH:mm:ss'),
        type: e.type,
        severity: e.severity,
        title: e.title,
        description: e.description,
        ipAddress: e.ipAddress,
        location: `${e.location?.city}, ${e.location?.country}`,
        device: e.device.name,
        acknowledged: e.acknowledged,
      }));

      // Create CSV
      const csv = [
        Object.keys(exportData[0]).join(','),
        ...exportData.map(row => Object.values(row).join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      
      notification.success('Security logs exported successfully');
      onExportRequested?.(filteredEvents);
      setShowExportDialog(false);
      
    } catch (error) {
      console.error('Failed to export logs:', error);
      notification.error('Failed to export security logs');
    } finally {
      setIsExporting(false);
    }
  }, [filteredEvents, notification, onExportRequested]);

  const handleRefresh = useCallback(() => {
    fetchSecurityEvents();
  }, [fetchSecurityEvents]);

  const handleViewDetails = useCallback((event: SecurityEvent) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  }, []);

  const getSeverityIcon = useCallback((severity: SecurityEventSeverity) => {
    switch (severity) {
      case 'critical':
        return ShieldExclamationIcon;
      case 'high':
        return ExclamationTriangleIcon;
      case 'medium':
        return InformationCircleIcon;
      case 'low':
        return CheckCircleIcon;
      default:
        return ShieldCheckIcon;
    }
  }, []);

  const getSeverityColor = useCallback((severity: SecurityEventSeverity) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }, []);

  const getEventIcon = useCallback((type: SecurityEventType) => {
    switch (type) {
      case 'login_success':
      case 'login_failed':
        return LockOpenIcon;
      case 'logout':
        return LockClosedIcon;
      case 'password_change':
      case 'password_reset':
        return KeyIcon;
      case '2fa_enabled':
      case '2fa_disabled':
      case '2fa_verified':
      case '2fa_failed':
        return ShieldCheckIcon;
      case 'email_change':
      case 'email_verified':
        return EnvelopeIcon;
      case 'phone_change':
      case 'phone_verified':
        return PhoneIcon;
      case 'device_added':
      case 'device_removed':
      case 'device_trusted':
        return DevicePhoneMobileIcon;
      case 'payment_method_added':
      case 'payment_method_removed':
        return CreditCardIcon;
      case 'suspicious_activity':
      case 'account_locked':
        return ShieldExclamationIcon;
      case 'account_unlocked':
        return LockOpenIcon;
      default:
        return UserIcon;
    }
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
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
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
                Security Activity Logs
              </CardTitle>
              <CardDescription className="mt-2">
                Monitor all security-related activities and events for your account. Review suspicious activities and take necessary actions.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {showFilters && (
                <Tooltip content="Toggle filters">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                    className={cn(showFiltersPanel && 'bg-primary-50 border-primary-300')}
                  >
                    <FunnelIcon className="w-4 h-4" />
                  </Button>
                </Tooltip>
              )}
              <Tooltip content="Refresh logs">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <ArrowPathIcon className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
                </Button>
              </Tooltip>
              {showExport && allowExport && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowExportDialog(true)}
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          {showStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                <div className="text-sm text-blue-600">Total Events</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-900">{stats.today}</div>
                <div className="text-sm text-green-600">Today</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-900">{stats.criticalUnacknowledged}</div>
                <div className="text-sm text-red-600">Critical Unacknowledged</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-900">{stats.suspiciousActivities}</div>
                <div className="text-sm text-orange-600">Suspicious</div>
              </div>
            </div>
          )}

          {/* Last refresh time */}
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
            <ClockIcon className="w-4 h-4" />
            Last updated {formatDistanceToNow(lastRefreshTime, { addSuffix: true })}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Critical Alerts */}
          {stats.criticalUnacknowledged > 0 && (
            <Alert variant="destructive">
              <BellAlertIcon className="w-5 h-5" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  You have {stats.criticalUnacknowledged} critical unacknowledged event{stats.criticalUnacknowledged > 1 ? 's' : ''} requiring immediate attention.
                </span>
                {allowAcknowledge && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAcknowledgeAll}
                    className="ml-4"
                  >
                    Acknowledge All
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Filters Panel */}
          <AnimatePresence>
            {showFiltersPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-4 bg-gray-50 rounded-lg border"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    type="text"
                    placeholder="Search events..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                    leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
                  />
                  <Select
                    value={filters.severity}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value as FilterOptions['severity'] }))}
                    options={[
                      { value: 'all', label: 'All Severities' },
                      { value: 'critical', label: 'Critical' },
                      { value: 'high', label: 'High' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'low', label: 'Low' },
                      { value: 'info', label: 'Info' },
                    ]}
                  />
                  <Select
                    value={filters.dateRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value as FilterOptions['dateRange'] }))}
                    options={[
                      { value: 'all', label: 'All Time' },
                      { value: 'today', label: 'Today' },
                      { value: 'week', label: 'Last 7 Days' },
                      { value: 'month', label: 'Last 30 Days' },
                      { value: 'custom', label: 'Custom Range' },
                    ]}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      searchQuery: '',
                      dateRange: 'all',
                      severity: 'all',
                      eventType: 'all',
                      showOnlyUnacknowledged: false,
                      showOnlyRequiringAction: false,
                    }))}
                    className="flex items-center gap-2"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    Clear Filters
                  </Button>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.showOnlyUnacknowledged}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        showOnlyUnacknowledged: e.target.checked 
                      }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Unacknowledged only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.showOnlyRequiringAction}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        showOnlyRequiringAction: e.target.checked 
                      }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Requires action only</span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
            <TabsList>
              <TabsTrigger value="all">
                All Events ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="critical">
                Critical ({stats.bySeverity.critical || 0})
              </TabsTrigger>
              <TabsTrigger value="unacknowledged">
                Unacknowledged ({events.filter(e => !e.acknowledged).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {paginatedEvents.length === 0 ? (
                <EmptyState
                  icon={<ShieldCheckIcon className="w-12 h-12" />}
                  title="No security events found"
                  description="No security events match your current filters."
                  action={
                    filters.searchQuery || filters.severity !== 'all' ? {
                      label: 'Clear Filters',
                      onClick: () => setFilters({
                        searchQuery: '',
                        severity: 'all',
                        eventType: 'all',
                        dateRange: 'all',
                        showOnlyUnacknowledged: false,
                        showOnlyRequiringAction: false,
                        sortBy: 'newest',
                      }),
                      variant: 'outline' as const,
                    } : undefined
                  }
                />
              ) : (
                <div className="space-y-3">
                  {paginatedEvents.map((event) => {
                    const SeverityIcon = getSeverityIcon(event.severity);
                    const EventIcon = getEventIcon(event.type);
                    const severityColor = getSeverityColor(event.severity);

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'p-4 border rounded-lg transition-all hover:shadow-sm',
                          event.acknowledged && 'opacity-75',
                          event.severity === 'critical' && 'border-l-4 border-l-red-500',
                          event.severity === 'high' && 'border-l-4 border-l-orange-500'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Severity Badge */}
                          <div className={cn('p-2 rounded-lg border', severityColor)}>
                            <SeverityIcon className="w-5 h-5" />
                          </div>

                          {/* Event Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <EventIcon className="w-4 h-4 text-gray-500" />
                                  <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                  <Badge
                                    variant={
                                      event.severity === 'critical' ? 'destructive' :
                                      event.severity === 'high' ? 'warning' :
                                      event.severity === 'medium' ? 'default' :
                                      'success'
                                    }
                                    size="sm"
                                  >
                                    {event.severity.toUpperCase()}
                                  </Badge>
                                  {event.requiresAction && !event.actionTaken && (
                                    <Badge variant="warning" size="sm">
                                      Action Required
                                    </Badge>
                                  )}
                                  {event.acknowledged && (
                                    <Badge variant="success" size="sm">
                                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                                      Acknowledged
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <ClockIcon className="w-3 h-3" />
                                    {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPinIcon className="w-3 h-3" />
                                    {event.location?.city}, {event.location?.country}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <GlobeAltIcon className="w-3 h-3" />
                                    {event.ipAddress}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <ComputerDesktopIcon className="w-3 h-3" />
                                    {event.device.type}
                                  </span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2 shrink-0">
                                <Tooltip content="View details">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleViewDetails(event)}
                                  >
                                    <EyeIcon className="w-4 h-4" />
                                  </Button>
                                </Tooltip>
                                {allowAcknowledge && !event.acknowledged && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAcknowledgeEvent(event.id)}
                                  >
                                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                                    Acknowledge
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    showFirstLast
                    showPageNumbers
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <ConfirmDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        title="Export Security Logs"
        description={`Export ${filteredEvents.length} security events to CSV file?`}
        confirmLabel="Export"
        cancelLabel="Cancel"
        onConfirm={handleExportLogs}
        isLoading={isExporting}
      />

      {/* Event Details Modal */}
      <Modal
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Security Event Details"
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-6">
            {/* Event Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Event Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Event Type</p>
                  <p className="text-sm font-medium">{selectedEvent.title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Severity</p>
                  <Badge variant={
                    selectedEvent.severity === 'critical' ? 'destructive' :
                    selectedEvent.severity === 'high' ? 'warning' :
                    'default'
                  }>
                    {selectedEvent.severity.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Timestamp</p>
                  <p className="text-sm font-medium">{format(selectedEvent.timestamp, 'PPpp')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-medium">
                    {selectedEvent.acknowledged ? 'Acknowledged' : 'Unacknowledged'}
                  </p>
                </div>
              </div>
            </div>

            {/* Device & Location */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Device & Location</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Device</p>
                  <p className="text-sm font-medium">{selectedEvent.device.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">IP Address</p>
                  <p className="text-sm font-mono">{selectedEvent.ipAddress}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-medium">
                    {selectedEvent.location?.city}, {selectedEvent.location?.country}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">User Agent</p>
                  <p className="text-xs font-mono break-all">{selectedEvent.userAgent}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Description</h3>
              <p className="text-sm text-gray-600">{selectedEvent.description}</p>
            </div>

            {/* Actions */}
            {allowAcknowledge && !selectedEvent.acknowledged && (
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={() => {
                    handleAcknowledgeEvent(selectedEvent.id);
                    setShowDetailsModal(false);
                  }}
                >
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Acknowledge Event
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default SecurityLogs;
