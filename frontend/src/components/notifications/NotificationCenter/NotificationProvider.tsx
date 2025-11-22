'use client';

import React, { 
  createContext, 
  useContext, 
  useCallback, 
  useEffect, 
  useReducer, 
  useRef, 
  useMemo,
  useState 
} from 'react';
import { 
  type Notification,
  type NotificationChannel,
  type NotificationType,
  type NotificationPriority,
  type NotificationCategory,
  type NotificationStatus,
  type NotificationFilter,
  type NotificationSortOption,
  type NotificationPreferences,
  type NotificationTemplate,
  type NotificationQueue,
  type NotificationAnalytics
} from '@/types/notification.types';

// Channel preferences interface
interface ChannelPreferences {
  enabled: boolean;
  sound?: boolean;
  vibration?: boolean;
  digest?: boolean;
  frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

// Event metadata interface
interface EventMetadata {
  timestamp?: Date;
  userAgent?: string;
  source?: string;
  [key: string]: unknown;
}
import { useLocalStorage } from '@/hooks/localStorage/useLocalStorage';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useWebSocket } from '@/hooks/common/useWebSocket';
import { logger } from '@/lib/utils/logger';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  preferences: NotificationPreferences;
  templates: NotificationTemplate[];
  queue: NotificationQueue[];
  analytics: NotificationAnalytics;
  isConnected: boolean;
  lastSyncTime: Date | null;
  filter: NotificationFilter;
  sortBy: NotificationSortOption;
  selectedNotifications: Set<string>;
}

interface NotificationContextValue extends NotificationState {
  // Core notification methods
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  removeNotification: (notificationId: string) => Promise<void>;
  updateNotification: (notificationId: string, updates: Partial<Notification>) => Promise<void>;
  clearNotifications: () => Promise<void>;
  
  // Status management
  markAsRead: (notificationId: string) => Promise<void>;
  markAsUnread: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  restoreNotification: (notificationId: string) => Promise<void>;
  
  // Interaction methods
  bookmarkNotification: (notificationId: string) => Promise<void>;
  starNotification: (notificationId: string) => Promise<void>;
  shareNotification: (notificationId: string) => Promise<void>;
  snoozeNotification: (notificationId: string, until: Date) => Promise<void>;
  pinNotification: (notificationId: string) => Promise<void>;
  
  // Bulk operations
  bulkAction: (action: string, notificationIds: string[]) => Promise<void>;
  selectNotification: (notificationId: string, selected: boolean) => void;
  selectAll: () => void;
  clearSelection: () => void;
  
  // Filtering and sorting
  setFilter: (filter: NotificationFilter) => void;
  setSortBy: (sortBy: NotificationSortOption) => void;
  searchNotifications: (query: string) => Notification[];
  
  // Preferences
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  getChannelPreferences: (channel: NotificationChannel) => ChannelPreferences | undefined;
  updateChannelPreferences: (channel: NotificationChannel, preferences: Partial<ChannelPreferences>) => Promise<void>;
  
  // Templates
  createTemplate: (template: Omit<NotificationTemplate, 'id' | 'createdAt'>) => Promise<string>;
  updateTemplate: (templateId: string, updates: Partial<NotificationTemplate>) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  getTemplate: (templateId: string) => NotificationTemplate | null;
  
  // Queue management
  enqueueNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  processQueue: () => Promise<void>;
  clearQueue: () => Promise<void>;
  pauseQueue: () => void;
  resumeQueue: () => void;
  
  // Real-time features
  enableRealTime: () => void;
  disableRealTime: () => void;
  syncNotifications: () => Promise<void>;
  
  // Analytics
  trackNotificationEvent: (event: string, notificationId: string, metadata?: EventMetadata) => void;
  getAnalytics: () => NotificationAnalytics;
  resetAnalytics: () => void;
  
  // Utilities
  getNotification: (notificationId: string) => Notification | null;
  getNotificationsByType: (type: NotificationType) => Notification[];
  getNotificationsByPriority: (priority: NotificationPriority) => Notification[];
  getNotificationsByCategory: (category: NotificationCategory) => Notification[];
  getNotificationsByChannel: (channel: NotificationChannel) => Notification[];
  getUnreadNotifications: () => Notification[];
  getBookmarkedNotifications: () => Notification[];
  getStarredNotifications: () => Notification[];
  
  // Permission management
  requestPermissions: () => Promise<boolean>;
  hasPermission: (channel: NotificationChannel) => boolean;
  
  // Sound and vibration
  playSound: (soundType?: string) => Promise<void>;
  vibrate: (pattern?: number[]) => Promise<void>;
  
  // Export/Import
  exportNotifications: (format: 'json' | 'csv' | 'xml') => Promise<string>;
  importNotifications: (data: string, format: 'json' | 'csv' | 'xml') => Promise<void>;
}

type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<Notification> } }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_PREFERENCES'; payload: NotificationPreferences }
  | { type: 'SET_TEMPLATES'; payload: NotificationTemplate[] }
  | { type: 'ADD_TEMPLATE'; payload: NotificationTemplate }
  | { type: 'UPDATE_TEMPLATE'; payload: { id: string; updates: Partial<NotificationTemplate> } }
  | { type: 'REMOVE_TEMPLATE'; payload: string }
  | { type: 'SET_QUEUE'; payload: NotificationQueue[] }
  | { type: 'ADD_TO_QUEUE'; payload: NotificationQueue }
  | { type: 'REMOVE_FROM_QUEUE'; payload: string }
  | { type: 'CLEAR_QUEUE' }
  | { type: 'SET_ANALYTICS'; payload: NotificationAnalytics }
  | { type: 'UPDATE_ANALYTICS'; payload: Partial<NotificationAnalytics> }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'SET_LAST_SYNC_TIME'; payload: Date }
  | { type: 'SET_FILTER'; payload: NotificationFilter }
  | { type: 'SET_SORT_BY'; payload: NotificationSortOption }
  | { type: 'SELECT_NOTIFICATION'; payload: { id: string; selected: boolean } }
  | { type: 'SELECT_ALL' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'INCREMENT_UNREAD' }
  | { type: 'DECREMENT_UNREAD' }
  | { type: 'SET_UNREAD_COUNT'; payload: number };

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  preferences: {
    id: 'default-preferences',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'default-user',
    globalEnabled: true,
    globalQuietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
      timezone: 'UTC',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      exceptions: ['security', 'urgent']
    },
    channelPreferences: [
      {
        channel: 'push',
        enabled: true,
        priority: 1,
        emailEnabled: true
      },
      {
        channel: 'email',
        enabled: true,
        priority: 2,
        emailEnabled: true
      },
      {
        channel: 'in_app',
        enabled: true,
        priority: 3,
        emailEnabled: false
      }
    ],
    typePreferences: [],
    categoryPreferences: [],
    frequencyPreferences: [],
    devicePreferences: [],
    advancedSettings: {
      smartBundling: true,
      smartTiming: true,
      duplicateDetection: true,
      trackOpens: true,
      trackClicks: true,
      shareData: false,
      personalizedContent: true,
      locationBasedTiming: false,
      behaviorBasedFrequency: true,
      aiOptimization: false,
      predictiveTiming: true,
      contextualRelevance: true
    },
    enabled: true,
    channels: {
      push: { enabled: true, sound: true, vibration: true },
      email: { enabled: true, digest: true, frequency: 'immediate' },
      sms: { enabled: false },
      in_app: { enabled: true, sound: true, position: 'top-right' },
      whatsapp: { enabled: false },
      slack: { enabled: false },
      teams: { enabled: false },
      webhook: { enabled: false },
      browser: { enabled: true, sound: true },
      voice: { enabled: false },
      telegram: { enabled: false }
    },
    categories: {
      transactional: { enabled: true, priority: 'high', channels: ['push', 'email', 'in_app'] },
      marketing: { enabled: true, priority: 'normal', channels: ['email', 'push'] },
      operational: { enabled: true, priority: 'high', channels: ['push', 'email', 'in_app'] },
      security: { enabled: true, priority: 'urgent', channels: ['push', 'email', 'sms', 'in_app'] },
      social: { enabled: true, priority: 'normal', channels: ['push', 'in_app'] },
      system: { enabled: true, priority: 'high', channels: ['push', 'email', 'in_app'] },
      informational: { enabled: true, priority: 'normal', channels: ['email', 'in_app'] },
      urgent: { enabled: true, priority: 'urgent', channels: ['push', 'email', 'sms', 'in_app'] },
      promotional: { enabled: false, priority: 'low', channels: ['email'] },
      educational: { enabled: true, priority: 'normal', channels: ['email', 'in_app'] }
    },
    doNotDisturb: {
      enabled: false,
      schedule: {
        startTime: '22:00',
        endTime: '08:00',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
      }
    },
    grouping: {
      enabled: false,
      maxGroupSize: 5,
      groupByType: true,
      groupBySender: false
    },
    sounds: {
      enabled: true,
      volume: 0.7,
      defaultSound: 'default',
      customSounds: {}
    },
    appearance: {
      theme: 'auto',
      position: 'top-right',
      animation: 'slide',
      duration: 5000,
      maxVisible: 5
    }
  },
  templates: [],
  queue: [],
  analytics: {
    totalSent: 0,
    totalDelivered: 0,
    totalRead: 0,
    totalClicked: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    byChannel: {},
    byType: {},
    byPriority: {},
    trends: []
  },
  isConnected: false,
  lastSyncTime: null,
  filter: 'all',
  sortBy: 'newest',
  selectedNotifications: new Set()
};

// ============================================================================
// REDUCER
// ============================================================================

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
      
    case 'SET_NOTIFICATIONS':
      const unreadCount = action.payload.filter(n => !n.tracking.readAt).length;
      return { 
        ...state, 
        notifications: action.payload, 
        unreadCount,
        loading: false,
        error: null 
      };
      
    case 'ADD_NOTIFICATION':
      const newUnreadCount = action.payload.tracking.readAt ? state.unreadCount : state.unreadCount + 1;
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: newUnreadCount
      };
      
    case 'REMOVE_NOTIFICATION':
      const removedNotification = state.notifications.find(n => n.id === action.payload);
      const updatedNotifications = state.notifications.filter(n => n.id !== action.payload);
      const updatedUnreadCount = removedNotification && !removedNotification.tracking.readAt 
        ? state.unreadCount - 1 
        : state.unreadCount;
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: Math.max(0, updatedUnreadCount),
        selectedNotifications: new Set(Array.from(state.selectedNotifications).filter(id => id !== action.payload))
      };
      
    case 'UPDATE_NOTIFICATION':
      const updatedNotifs = state.notifications.map(notification => 
        notification.id === action.payload.id 
          ? { ...notification, ...action.payload.updates, updatedAt: new Date() }
          : notification
      );
      
      // Recalculate unread count
      const currentUnreadCount = updatedNotifs.filter(n => !n.tracking.readAt).length;
      
      return {
        ...state,
        notifications: updatedNotifs,
        unreadCount: currentUnreadCount
      };
      
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
        selectedNotifications: new Set()
      };
      
    case 'SET_PREFERENCES':
      return { ...state, preferences: action.payload };
      
    case 'SET_TEMPLATES':
      return { ...state, templates: action.payload };
      
    case 'ADD_TEMPLATE':
      return { 
        ...state, 
        templates: [...state.templates, action.payload] 
      };
      
    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.map(template => 
          template.id === action.payload.id 
            ? { ...template, ...action.payload.updates }
            : template
        )
      };
      
    case 'REMOVE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.filter(template => template.id !== action.payload)
      };
      
    case 'SET_QUEUE':
      return { ...state, queue: action.payload };
      
    case 'ADD_TO_QUEUE':
      return { 
        ...state, 
        queue: [...state.queue, action.payload] 
      };
      
    case 'REMOVE_FROM_QUEUE':
      return {
        ...state,
        queue: state.queue.filter(item => item.id !== action.payload)
      };
      
    case 'CLEAR_QUEUE':
      return { ...state, queue: [] };
      
    case 'SET_ANALYTICS':
      return { ...state, analytics: action.payload };
      
    case 'UPDATE_ANALYTICS':
      return { 
        ...state, 
        analytics: { ...state.analytics, ...action.payload } 
      };
      
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };
      
    case 'SET_LAST_SYNC_TIME':
      return { ...state, lastSyncTime: action.payload };
      
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
      
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };
      
    case 'SELECT_NOTIFICATION':
      const newSelection = new Set(state.selectedNotifications);
      if (action.payload.selected) {
        newSelection.add(action.payload.id);
      } else {
        newSelection.delete(action.payload.id);
      }
      return { ...state, selectedNotifications: newSelection };
      
    case 'SELECT_ALL':
      return {
        ...state,
        selectedNotifications: new Set(state.notifications.map(n => n.id))
      };
      
    case 'CLEAR_SELECTION':
      return { ...state, selectedNotifications: new Set() };
      
    case 'INCREMENT_UNREAD':
      return { ...state, unreadCount: state.unreadCount + 1 };
      
    case 'DECREMENT_UNREAD':
      return { ...state, unreadCount: Math.max(0, state.unreadCount - 1) };
      
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: Math.max(0, action.payload) };
      
    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface NotificationProviderProps {
  children: React.ReactNode;
  apiEndpoint?: string;
  wsEndpoint?: string;
  enablePersistence?: boolean;
  enableRealTime?: boolean;
  enableAnalytics?: boolean;
  maxNotifications?: number;
  autoCleanup?: boolean;
  cleanupInterval?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  apiEndpoint = '/api/notifications',
  wsEndpoint,
  enablePersistence = true,
  enableRealTime = true,
  enableAnalytics = true,
  maxNotifications = 1000,
  autoCleanup = true,
  cleanupInterval = 24 * 60 * 60 * 1000 // 24 hours
}) => {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const [isQueuePaused, setIsQueuePaused] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(enableRealTime);
  
  // ============================================================================
  // REFS
  // ============================================================================
  
  const queueProcessingRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<HTMLAudioElement | null>(null);
  
  // ============================================================================
  // HOOKS
  // ============================================================================
  
  const { value: persistedPreferences, setValue: setPersistedPreferences } = useLocalStorage<NotificationPreferences>(
    'notification-preferences',
    { defaultValue: initialState.preferences }
  );
  
  const { value: persistedTemplates, setValue: setPersistedTemplates } = useLocalStorage<NotificationTemplate[]>(
    'notification-templates',
    { defaultValue: [] }
  );
  
  const { 
    permission, 
    requestPermission, 
    sendNotification: sendPushNotification 
  } = usePushNotifications();
  
  const { 
    reconnect: connectWebSocket, 
    close: disconnectWebSocket, 
    sendMessage,
    isConnected: wsConnected 
  } = useWebSocket(wsEndpoint || '', {
    onMessage: (event: MessageEvent) => {
      handleWebSocketMessage(event.data);
    },
    onOpen: () => {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
      // Send initial sync message when connected
      sendMessage(JSON.stringify({ type: 'sync_request', timestamp: new Date() }));
    },
    onClose: () => dispatch({ type: 'SET_CONNECTION_STATUS', payload: false }),
    reconnect: true
  });
  
  // Update connection status based on WebSocket state
  useEffect(() => {
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: wsConnected });
  }, [wsConnected]);
  
  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Initialize preferences and templates from localStorage
  useEffect(() => {
    if (enablePersistence) {
      dispatch({ type: 'SET_PREFERENCES', payload: persistedPreferences });
      dispatch({ type: 'SET_TEMPLATES', payload: persistedTemplates });
    }
  }, [persistedPreferences, persistedTemplates, enablePersistence]);
  
  // Setup real-time connection
  useEffect(() => {
    if (realTimeEnabled && wsEndpoint) {
      connectWebSocket();
    }
    
    return () => {
      if (wsEndpoint) {
        disconnectWebSocket();
      }
    };
  }, [realTimeEnabled, wsEndpoint, connectWebSocket, disconnectWebSocket]);
  
  // Add notification function
  const addNotification = useCallback(async (
    notificationData: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const notification: Notification = {
        ...notificationData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        tracking: {
          ...notificationData.tracking,
          deliveredAt: new Date(),
          readAt: undefined,
          clickedAt: undefined,
          archivedAt: undefined,
          deletedAt: undefined,
          bookmarkedAt: undefined,
          starredAt: undefined,
          snoozedUntil: undefined,
          pinnedAt: undefined
        }
      };
      
      // Check if notifications are at max limit
      if (state.notifications.length >= maxNotifications) {
        // Remove oldest read notification
        const oldestRead = state.notifications
          .filter(n => n.tracking.readAt)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
        
        if (oldestRead) {
          dispatch({ type: 'REMOVE_NOTIFICATION', payload: oldestRead.id });
        }
      }
      
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      
      // Send to API
      if (apiEndpoint) {
        await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notification)
        });
      }
      
      // Handle push notification
      if (notification.channels.includes('push') && state.preferences.channels.push?.enabled) {
        await sendPushNotification(notification.title, {
          body: notification.message,
          icon: notification.metadata?.avatar,
          tag: notification.id,
          data: notification
        });
      }
      
      // Play sound
      if (state.preferences.sounds?.enabled && state.preferences.channels.in_app?.sound) {
        await playSound();
      }
      
      // Update analytics
      updateAnalytics('sent', notification.id);
      updateAnalytics('delivered', notification.id);
      
      dispatch({ type: 'SET_LOADING', payload: false });
      
      logger.info('Notification added successfully', { id: notification.id });
      return notification.id;
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: `Failed to add notification: ${error}` });
      logger.error('Error adding notification', error);
      throw error;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEndpoint, maxNotifications, state.notifications, state.preferences.channels.in_app?.sound, state.preferences.channels.push?.enabled, state.preferences.sounds?.enabled]);

  // Memoize processQueue to include in dependencies
  const memoizedProcessQueue = useCallback(async (): Promise<void> => {
    if (isQueuePaused || state.queue.length === 0) return;
    
    const now = new Date();
    const readyItems = state.queue.filter(item => 
      item.status === 'pending' && new Date(item.scheduledFor) <= now
    );
    
    for (const item of readyItems) {
      try {
        await addNotification(item.notification);
        dispatch({ type: 'REMOVE_FROM_QUEUE', payload: item.id });
      } catch (error) {
        logger.error('Error processing queue item', error);
        // Mark as failed and potentially retry
        // Implementation depends on retry strategy
      }
    }
  }, [isQueuePaused, state.queue, addNotification]);
  
  // Setup queue processing
  useEffect(() => {
    if (!isQueuePaused) {
      queueProcessingRef.current = setInterval(() => {
        if (state.queue.length > 0) {
          memoizedProcessQueue();
        }
      }, 1000);
    }
    
    return () => {
      if (queueProcessingRef.current) {
        clearInterval(queueProcessingRef.current);
      }
    };
  }, [isQueuePaused, state.queue.length, memoizedProcessQueue]);
  
  // Setup auto cleanup
  useEffect(() => {
    if (autoCleanup) {
      cleanupIntervalRef.current = setInterval(() => {
        performCleanup();
      }, cleanupInterval);
    }
    
    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCleanup, cleanupInterval]);
  
  // Initialize sound
  useEffect(() => {
    if (typeof window !== 'undefined') {
      soundRef.current = new Audio();
    }
  }, []);
  
  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  
  const generateId = (): string => {
    return `notification_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };
  
  const performCleanup = useCallback(() => {
    const cutoffDate = new Date(Date.now() - cleanupInterval);
    const filteredNotifications = state.notifications.filter(notification => {
      const notificationDate = new Date(notification.createdAt);
      return notificationDate > cutoffDate || !notification.tracking.readAt;
    });
    
    if (filteredNotifications.length !== state.notifications.length) {
      dispatch({ type: 'SET_NOTIFICATIONS', payload: filteredNotifications });
      logger.info('Performed notification cleanup', {
        removed: state.notifications.length - filteredNotifications.length,
        remaining: filteredNotifications.length
      });
    }
  }, [state.notifications, cleanupInterval]);
  
  function handleWebSocketMessage(data: string | ArrayBuffer | Blob) {
    try {
      let message;
      if (typeof data === 'string') {
        message = JSON.parse(data);
      } else if (data instanceof ArrayBuffer) {
        message = JSON.parse(new TextDecoder().decode(data));
      } else if (data instanceof Blob) {
        // For Blob, we need to handle this asynchronously, but for now just return
        data.text().then(text => {
          // Handle blob message same way as above
          handleWebSocketMessage(text);
        });
        return;
      }
      
      switch (message.type) {
        case 'notification_new':
          addNotification(message.payload);
          break;
        case 'notification_update':
          updateNotification(message.payload.id, message.payload.updates);
          break;
        case 'notification_delete':
          removeNotification(message.payload.id);
          break;
        case 'preferences_update':
          dispatch({ type: 'SET_PREFERENCES', payload: message.payload });
          break;
        default:
          logger.warn('Unknown WebSocket message type', message.type);
      }
    } catch (error) {
      logger.error('Error parsing WebSocket message', error);
    }
  }
  
  const updateAnalytics = useCallback((event: string, notificationId?: string, metadata?: EventMetadata) => {
    if (!enableAnalytics) return;
    
    // Use NotificationStatus for status tracking
    const currentStatus: NotificationStatus = 'delivered';
    logger.info('Analytics update', { event, notificationId, metadata, status: currentStatus });
    
    const updates: Partial<NotificationAnalytics> = {};
    
    switch (event) {
      case 'sent':
        updates.totalSent = (state.analytics.totalSent || 0) + 1;
        break;
      case 'delivered':
        updates.totalDelivered = (state.analytics.totalDelivered || 0) + 1;
        break;
      case 'read':
        updates.totalRead = (state.analytics.totalRead || 0) + 1;
        break;
      case 'clicked':
        updates.totalClicked = (state.analytics.totalClicked || 0) + 1;
        break;
    }
    
    // Calculate rates
    if (updates.totalSent || updates.totalDelivered || updates.totalRead) {
      const totalSent = updates.totalSent || state.analytics.totalSent || 1;
      const totalDelivered = updates.totalDelivered || state.analytics.totalDelivered || 0;
      const totalRead = updates.totalRead || state.analytics.totalRead || 0;
      const totalClicked = updates.totalClicked || state.analytics.totalClicked || 0;
      
      updates.deliveryRate = (totalDelivered / totalSent) * 100;
      updates.openRate = (totalRead / totalDelivered) * 100;
      updates.clickRate = (totalClicked / totalRead) * 100;
    }
    
    dispatch({ type: 'UPDATE_ANALYTICS', payload: updates });
  }, [enableAnalytics, state.analytics]);
  
  // ============================================================================
  // CORE NOTIFICATION METHODS
  // ============================================================================
  
  
  const removeNotification = useCallback(async (notificationId: string): Promise<void> => {
    try {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
      
      if (apiEndpoint) {
        await fetch(`${apiEndpoint}/${notificationId}`, {
          method: 'DELETE'
        });
      }
      
      logger.info('Notification removed successfully', { id: notificationId });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: `Failed to remove notification: ${error}` });
      logger.error('Error removing notification', error);
      throw error;
    }
  }, [apiEndpoint]);
  
  const updateNotification = useCallback(async (
    notificationId: string, 
    updates: Partial<Notification>
  ): Promise<void> => {
    try {
      dispatch({ 
        type: 'UPDATE_NOTIFICATION', 
        payload: { id: notificationId, updates } 
      });
      
      if (apiEndpoint) {
        await fetch(`${apiEndpoint}/${notificationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
      }
      
      logger.info('Notification updated successfully', { id: notificationId, updates });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: `Failed to update notification: ${error}` });
      logger.error('Error updating notification', error);
      throw error;
    }
  }, [apiEndpoint]);
  
  const clearNotifications = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'CLEAR_NOTIFICATIONS' });
      
      if (apiEndpoint) {
        await fetch(apiEndpoint, {
          method: 'DELETE'
        });
      }
      
      logger.info('All notifications cleared');
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: `Failed to clear notifications: ${error}` });
      logger.error('Error clearing notifications', error);
      throw error;
    }
  }, [apiEndpoint]);
  
  // ============================================================================
  // STATUS MANAGEMENT METHODS
  // ============================================================================
  
  const markAsRead = useCallback(async (notificationId: string): Promise<void> => {
    const notification = state.notifications.find(n => n.id === notificationId);
    if (!notification || notification.tracking.readAt) return;
    
    await updateNotification(notificationId, {
      tracking: {
        ...notification.tracking,
        readAt: new Date()
      }
    });
    
    updateAnalytics('read', notificationId);
  }, [state.notifications, updateNotification, updateAnalytics]);
  
  const markAsUnread = useCallback(async (notificationId: string): Promise<void> => {
    const notification = state.notifications.find(n => n.id === notificationId);
    if (!notification || !notification.tracking.readAt) return;
    
    await updateNotification(notificationId, {
      tracking: {
        ...notification.tracking,
        readAt: undefined
      }
    });
  }, [state.notifications, updateNotification]);
  
  const markAllAsRead = useCallback(async (): Promise<void> => {
    const unreadNotifications = state.notifications.filter(n => !n.tracking.readAt);
    
    await Promise.all(
      unreadNotifications.map(notification => 
        updateNotification(notification.id, {
          tracking: {
            ...notification.tracking,
            readAt: new Date()
          }
        })
      )
    );
    
    // Update analytics for all marked as read
    unreadNotifications.forEach(notification => {
      updateAnalytics('read', notification.id);
    });
  }, [state.notifications, updateNotification, updateAnalytics]);
  
  const archiveNotification = useCallback(async (notificationId: string): Promise<void> => {
    const notification = state.notifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    await updateNotification(notificationId, {
      tracking: {
        ...notification.tracking,
        archivedAt: new Date()
      }
    });
  }, [state.notifications, updateNotification]);
  
  const deleteNotification = useCallback(async (notificationId: string): Promise<void> => {
    await removeNotification(notificationId);
  }, [removeNotification]);
  
  const restoreNotification = useCallback(async (notificationId: string): Promise<void> => {
    const notification = state.notifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    await updateNotification(notificationId, {
      tracking: {
        ...notification.tracking,
        archivedAt: undefined,
        deletedAt: undefined
      }
    });
  }, [state.notifications, updateNotification]);
  
  // ============================================================================
  // INTERACTION METHODS
  // ============================================================================
  
  const bookmarkNotification = useCallback(async (notificationId: string): Promise<void> => {
    const notification = state.notifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    const isBookmarked = !!notification.tracking.bookmarkedAt;
    
    await updateNotification(notificationId, {
      tracking: {
        ...notification.tracking,
        bookmarkedAt: isBookmarked ? undefined : new Date()
      }
    });
  }, [state.notifications, updateNotification]);
  
  const starNotification = useCallback(async (notificationId: string): Promise<void> => {
    const notification = state.notifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    const isStarred = !!notification.tracking.starredAt;
    
    await updateNotification(notificationId, {
      tracking: {
        ...notification.tracking,
        starredAt: isStarred ? undefined : new Date()
      }
    });
  }, [state.notifications, updateNotification]);
  
  const shareNotification = useCallback(async (notificationId: string): Promise<void> => {
    const notification = state.notifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    if (navigator.share) {
      await navigator.share({
        title: notification.title,
        text: notification.message,
        url: window.location.href
      });
    } else {
      // Fallback to clipboard
      const shareText = `${notification.title}\n${notification.message}`;
      await navigator.clipboard.writeText(shareText);
    }
    
    updateAnalytics('shared', notificationId);
  }, [state.notifications, updateAnalytics]);
  
  const snoozeNotification = useCallback(async (notificationId: string, until: Date): Promise<void> => {
    const notification = state.notifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    await updateNotification(notificationId, {
      tracking: {
        ...notification.tracking,
        snoozedUntil: until
      }
    });
  }, [state.notifications, updateNotification]);
  
  const pinNotification = useCallback(async (notificationId: string): Promise<void> => {
    const notification = state.notifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    const isPinned = !!notification.tracking.pinnedAt;
    
    await updateNotification(notificationId, {
      tracking: {
        ...notification.tracking,
        pinnedAt: isPinned ? undefined : new Date()
      }
    });
  }, [state.notifications, updateNotification]);
  
  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================
  
  const bulkAction = useCallback(async (action: string, notificationIds: string[]): Promise<void> => {
    const actions = {
      'mark_read': async (ids: string[]) => {
        await Promise.all(ids.map(id => markAsRead(id)));
      },
      'mark_unread': async (ids: string[]) => {
        await Promise.all(ids.map(id => markAsUnread(id)));
      },
      'archive': async (ids: string[]) => {
        await Promise.all(ids.map(id => archiveNotification(id)));
      },
      'delete': async (ids: string[]) => {
        await Promise.all(ids.map(id => deleteNotification(id)));
      },
      'bookmark': async (ids: string[]) => {
        await Promise.all(ids.map(id => bookmarkNotification(id)));
      },
      'star': async (ids: string[]) => {
        await Promise.all(ids.map(id => starNotification(id)));
      }
    };
    
    const actionFn = actions[action as keyof typeof actions];
    if (actionFn) {
      await actionFn(notificationIds);
    }
  }, [markAsRead, markAsUnread, archiveNotification, deleteNotification, bookmarkNotification, starNotification]);
  
  const selectNotification = useCallback((notificationId: string, selected: boolean): void => {
    dispatch({ type: 'SELECT_NOTIFICATION', payload: { id: notificationId, selected } });
  }, []);
  
  const selectAll = useCallback((): void => {
    dispatch({ type: 'SELECT_ALL' });
  }, []);
  
  const clearSelection = useCallback((): void => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);
  
  // ============================================================================
  // FILTERING AND SORTING
  // ============================================================================
  
  const setFilter = useCallback((filter: NotificationFilter): void => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  }, []);
  
  const setSortBy = useCallback((sortBy: NotificationSortOption): void => {
    dispatch({ type: 'SET_SORT_BY', payload: sortBy });
  }, []);
  
  const searchNotifications = useCallback((query: string): Notification[] => {
    if (!query.trim()) return state.notifications;
    
    const searchTerms = query.toLowerCase().trim().split(' ');
    
    return state.notifications.filter(notification => {
      const searchableText = [
        notification.title,
        notification.message,
        notification.type,
        notification.category,
        notification.priority,
        notification.source,
        ...(notification.tags || []),
        notification.metadata?.sender
      ].filter(Boolean).join(' ').toLowerCase();
      
      return searchTerms.every(term => searchableText.includes(term));
    });
  }, [state.notifications]);
  
  // ============================================================================
  // PREFERENCES
  // ============================================================================
  
  const updatePreferences = useCallback(async (preferences: Partial<NotificationPreferences>): Promise<void> => {
    const updatedPreferences = { ...state.preferences, ...preferences };
    dispatch({ type: 'SET_PREFERENCES', payload: updatedPreferences });
    
    if (enablePersistence) {
      setPersistedPreferences(updatedPreferences);
    }
    
    if (apiEndpoint) {
      await fetch(`${apiEndpoint}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPreferences)
      });
    }
  }, [state.preferences, enablePersistence, setPersistedPreferences, apiEndpoint]);
  
  const getChannelPreferences = useCallback((channel: NotificationChannel) => {
    return state.preferences.channels[channel];
  }, [state.preferences.channels]);
  
  const updateChannelPreferences = useCallback(async (
    channel: NotificationChannel, 
    preferences: Partial<ChannelPreferences>
  ): Promise<void> => {
    await updatePreferences({
      channels: {
        ...state.preferences.channels,
        [channel]: { ...state.preferences.channels[channel], ...preferences }
      }
    });
  }, [state.preferences.channels, updatePreferences]);
  
  // ============================================================================
  // TEMPLATES
  // ============================================================================
  
  const createTemplate = useCallback(async (
    templateData: Omit<NotificationTemplate, 'id' | 'createdAt'>
  ): Promise<string> => {
    const template: NotificationTemplate = {
      ...templateData,
      id: generateId(),
      createdAt: new Date()
    };
    
    dispatch({ type: 'ADD_TEMPLATE', payload: template });
    
    if (enablePersistence) {
      const updatedTemplates = [...state.templates, template];
      setPersistedTemplates(updatedTemplates);
    }
    
    return template.id;
  }, [state.templates, enablePersistence, setPersistedTemplates]);
  
  const updateTemplate = useCallback(async (
    templateId: string, 
    updates: Partial<NotificationTemplate>
  ): Promise<void> => {
    dispatch({ type: 'UPDATE_TEMPLATE', payload: { id: templateId, updates } });
    
    if (enablePersistence) {
      const updatedTemplates = state.templates.map(template =>
        template.id === templateId ? { ...template, ...updates } : template
      );
      setPersistedTemplates(updatedTemplates);
    }
  }, [state.templates, enablePersistence, setPersistedTemplates]);
  
  const deleteTemplate = useCallback(async (templateId: string): Promise<void> => {
    dispatch({ type: 'REMOVE_TEMPLATE', payload: templateId });
    
    if (enablePersistence) {
      const updatedTemplates = state.templates.filter(template => template.id !== templateId);
      setPersistedTemplates(updatedTemplates);
    }
  }, [state.templates, enablePersistence, setPersistedTemplates]);
  
  const getTemplate = useCallback((templateId: string): NotificationTemplate | null => {
    return state.templates.find(template => template.id === templateId) || null;
  }, [state.templates]);
  
  // ============================================================================
  // QUEUE MANAGEMENT
  // ============================================================================
  
  const enqueueNotification = useCallback(async (
    notificationData: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> => {
    const notification: Notification = {
      ...notificationData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const queueItem: NotificationQueue = {
      id: generateId(),
      notification,
      priority: notification.priority,
      retryCount: 0,
      maxRetries: 3,
      scheduledFor: notificationData.scheduledFor ? new Date(notificationData.scheduledFor) : new Date(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    dispatch({ type: 'ADD_TO_QUEUE', payload: queueItem });
  }, []);
  
  const processQueue = useCallback(async (): Promise<void> => {
    if (isQueuePaused || state.queue.length === 0) return;
    
    const now = new Date();
    const readyItems = state.queue.filter(item => 
      item.status === 'pending' && new Date(item.scheduledFor) <= now
    );
    
    for (const item of readyItems) {
      try {
        await addNotification(item.notification);
        dispatch({ type: 'REMOVE_FROM_QUEUE', payload: item.id });
      } catch (error) {
        logger.error('Error processing queue item', error);
        // Mark as failed and potentially retry
        // Implementation depends on retry strategy
      }
    }
  }, [isQueuePaused, state.queue, addNotification]);
  
  const clearQueue = useCallback(async (): Promise<void> => {
    dispatch({ type: 'CLEAR_QUEUE' });
  }, []);
  
  const pauseQueue = useCallback((): void => {
    setIsQueuePaused(true);
  }, []);
  
  const resumeQueue = useCallback((): void => {
    setIsQueuePaused(false);
  }, []);
  
  // ============================================================================
  // REAL-TIME FEATURES
  // ============================================================================
  
  const enableRealTimeConnection = useCallback((): void => {
    setRealTimeEnabled(true);
  }, []);
  
  const disableRealTime = useCallback((): void => {
    setRealTimeEnabled(false);
  }, []);
  
  const syncNotifications = useCallback(async (): Promise<void> => {
    if (!apiEndpoint) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch(apiEndpoint);
      const notifications = await response.json();
      
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
      dispatch({ type: 'SET_LAST_SYNC_TIME', payload: new Date() });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: `Failed to sync notifications: ${error}` });
      logger.error('Error syncing notifications', error);
    }
  }, [apiEndpoint]);
  
  // ============================================================================
  // ANALYTICS
  // ============================================================================
  
  const trackNotificationEvent = useCallback((
    event: string, 
    notificationId: string, 
    metadata?: EventMetadata
  ): void => {
    updateAnalytics(event, notificationId, metadata);
    
    logger.info('Notification event tracked', {
      event,
      notificationId,
      metadata
    });
  }, [updateAnalytics]);
  
  const getAnalytics = useCallback((): NotificationAnalytics => {
    return state.analytics;
  }, [state.analytics]);
  
  const resetAnalytics = useCallback((): void => {
    dispatch({ type: 'SET_ANALYTICS', payload: initialState.analytics });
  }, []);
  
  // ============================================================================
  // UTILITIES
  // ============================================================================
  
  const getNotification = useCallback((notificationId: string): Notification | null => {
    return state.notifications.find(n => n.id === notificationId) || null;
  }, [state.notifications]);
  
  const getNotificationsByType = useCallback((type: NotificationType): Notification[] => {
    return state.notifications.filter(n => n.type === type);
  }, [state.notifications]);
  
  const getNotificationsByPriority = useCallback((priority: NotificationPriority): Notification[] => {
    return state.notifications.filter(n => n.priority === priority);
  }, [state.notifications]);
  
  const getNotificationsByCategory = useCallback((category: NotificationCategory): Notification[] => {
    return state.notifications.filter(n => n.category === category);
  }, [state.notifications]);
  
  const getNotificationsByChannel = useCallback((channel: NotificationChannel): Notification[] => {
    return state.notifications.filter(n => n.channels.includes(channel));
  }, [state.notifications]);
  
  const getUnreadNotifications = useCallback((): Notification[] => {
    return state.notifications.filter(n => !n.tracking.readAt);
  }, [state.notifications]);
  
  const getBookmarkedNotifications = useCallback((): Notification[] => {
    return state.notifications.filter(n => n.tracking.bookmarkedAt);
  }, [state.notifications]);
  
  const getStarredNotifications = useCallback((): Notification[] => {
    return state.notifications.filter(n => n.tracking.starredAt);
  }, [state.notifications]);
  
  // ============================================================================
  // PERMISSION MANAGEMENT
  // ============================================================================
  
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const pushPermission = await requestPermission();
      
      // Request other permissions as needed
      // For example, if using service worker for background sync
      
      return pushPermission === 'granted';
    } catch (error) {
      logger.error('Error requesting permissions', error);
      return false;
    }
  }, [requestPermission]);
  
  const hasPermission = useCallback((channel: NotificationChannel): boolean => {
    switch (channel) {
      case 'push':
      case 'browser':
        return permission === 'granted';
      case 'in_app':
        return true;
      default:
        return false;
    }
  }, [permission]);
  
  // ============================================================================
  // SOUND AND VIBRATION
  // ============================================================================
  
  const playSound = useCallback(async (soundType = 'default'): Promise<void> => {
    if (!state.preferences.sounds?.enabled || !soundRef.current) return;
    
    try {
      const soundUrl = state.preferences.sounds.customSounds?.[soundType] || '/sounds/notification.mp3';
      soundRef.current.src = soundUrl;
      soundRef.current.volume = state.preferences.sounds.volume || 0.7;
      await soundRef.current.play();
    } catch (error) {
      logger.error('Error playing notification sound', error);
    }
  }, [state.preferences.sounds]);
  
  const vibrate = useCallback(async (pattern = [200, 100, 200]): Promise<void> => {
    if ('vibrate' in navigator && state.preferences.channels.push?.vibration) {
      navigator.vibrate(pattern);
    }
  }, [state.preferences.channels.push?.vibration]);
  
  // ============================================================================
  // EXPORT/IMPORT
  // ============================================================================
  
  const exportNotifications = useCallback(async (format: 'json' | 'csv' | 'xml'): Promise<string> => {
    switch (format) {
      case 'json':
        return JSON.stringify(state.notifications, null, 2);
      
      case 'csv':
        const headers = ['ID', 'Title', 'Message', 'Type', 'Priority', 'Created At', 'Read At'];
        const csvRows = [
          headers.join(','),
          ...state.notifications.map(n => [
            n.id,
            `"${n.title.replace(/"/g, '""')}"`,
            `"${n.message?.replace(/"/g, '""') || ''}"`,
            n.type,
            n.priority,
            new Date(n.createdAt).toISOString(),
            n.tracking.readAt ? new Date(n.tracking.readAt).toISOString() : ''
          ].join(','))
        ];
        return csvRows.join('\n');
      
      case 'xml':
        const xmlNotifications = state.notifications
          .map(n => `
            <notification id="${n.id}">
              <title><![CDATA[${n.title}]]></title>
              <message><![CDATA[${n.message || ''}]]></message>
              <type>${n.type}</type>
              <priority>${n.priority}</priority>
              <createdAt>${new Date(n.createdAt).toISOString()}</createdAt>
              <readAt>${n.tracking.readAt ? new Date(n.tracking.readAt).toISOString() : ''}</readAt>
            </notification>
          `).join('');
        return `<?xml version="1.0" encoding="UTF-8"?><notifications>${xmlNotifications}</notifications>`;
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }, [state.notifications]);
  
  const importNotifications = useCallback(async (
    data: string, 
    format: 'json' | 'csv' | 'xml'
  ): Promise<void> => {
    try {
      let notifications: Notification[] = [];
      
      switch (format) {
        case 'json':
          notifications = JSON.parse(data);
          break;
        
        case 'csv':
          // Simple CSV parsing - in production, use a proper CSV parser
          const lines = data.split('\n');
          const headers = lines[0].split(',');
          
          // Validate headers
          const expectedHeaders = ['ID', 'Title', 'Message', 'Type', 'Priority', 'Created At', 'Read At'];
          const isValidFormat = expectedHeaders.every(header => headers.includes(header));
          
          if (!isValidFormat) {
            throw new Error('Invalid CSV format. Expected headers: ' + expectedHeaders.join(', '));
          }
          
          notifications = lines.slice(1).map(line => {
            const values = line.split(',');
            // Basic parsing - would need more robust implementation
            return {
              id: values[0],
              title: values[1].replace(/"/g, ''),
              message: values[2].replace(/"/g, ''),
              type: values[3] as NotificationType,
              priority: values[4] as NotificationPriority,
              createdAt: new Date(values[5]),
              tracking: {
                readAt: values[6] ? new Date(values[6]) : undefined,
                deliveredAt: new Date(),
                clickedAt: undefined,
                archivedAt: undefined,
                deletedAt: undefined,
                bookmarkedAt: undefined,
                starredAt: undefined,
                snoozedUntil: undefined,
                pinnedAt: undefined,
                opened: false,
                clicked: false,
                actionsPerformed: [],
                engagement: {
                  views: 0,
                  clicks: 0,
                  shares: 0,
                  timeSpent: 0
                }
              },
              // Set required fields with defaults
              category: 'informational' as NotificationCategory,
              channels: ['in_app'] as NotificationChannel[],
              content: { 
                title: values[1].replace(/"/g, ''),
                body: values[2].replace(/"/g, ''),
                actions: []
              },
              deliveryConfig: {
                channels: [{ channel: 'in_app', enabled: true, priority: 1 }],
                timing: { immediate: true },
                retryPolicy: {
                  enabled: false,
                  maxAttempts: 3,
                  initialDelay: 1,
                  backoffMultiplier: 2,
                  maxDelay: 60
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
                    telegram: []
                  }
                },
                deduplication: {
                  enabled: false,
                  window: 3600,
                  keyFields: ['type', 'userId'],
                  strategy: 'skip'
                },
                fallbackChannels: []
              },
              status: 'delivered' as NotificationStatus,
              deliveryStatus: {
                overall: 'delivered' as NotificationStatus,
                channels: [],
                attempts: 1,
                lastAttempt: new Date()
              },
              source: 'import',
              tags: [],
              personalized: false,
              updatedAt: new Date()
            } as Notification;
          });
          break;
        
        case 'xml':
          // Basic XML parsing - in production, use DOMParser or xml2js
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data, 'text/xml');
          const notificationNodes = xmlDoc.querySelectorAll('notification');
          notifications = Array.from(notificationNodes).map(node => ({
            id: node.getAttribute('id') || '',
            title: node.querySelector('title')?.textContent || '',
            message: node.querySelector('message')?.textContent || '',
            type: node.querySelector('type')?.textContent as NotificationType,
            priority: node.querySelector('priority')?.textContent as NotificationPriority,
            // ... other fields
          } as Notification));
          break;
      }
      
      // Validate and add notifications
      for (const notification of notifications) {
        if (notification.id && notification.title) {
          await addNotification(notification);
        }
      }
      
    } catch (error) {
      logger.error('Error importing notifications', error);
      throw error;
    }
  }, [addNotification]);
  
  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================
  
  const contextValue = useMemo<NotificationContextValue>(() => ({
    // State
    ...state,
    
    // Core notification methods
    addNotification,
    removeNotification,
    updateNotification,
    clearNotifications,
    
    // Status management
    markAsRead,
    markAsUnread,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    restoreNotification,
    
    // Interaction methods
    bookmarkNotification,
    starNotification,
    shareNotification,
    snoozeNotification,
    pinNotification,
    
    // Bulk operations
    bulkAction,
    selectNotification,
    selectAll,
    clearSelection,
    
    // Filtering and sorting
    setFilter,
    setSortBy,
    searchNotifications,
    
    // Preferences
    updatePreferences,
    getChannelPreferences,
    updateChannelPreferences,
    
    // Templates
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
    
    // Queue management
    enqueueNotification,
    processQueue,
    clearQueue,
    pauseQueue,
    resumeQueue,
    
    // Real-time features
    enableRealTime: enableRealTimeConnection,
    disableRealTime,
    syncNotifications,
    
    // Analytics
    trackNotificationEvent,
    getAnalytics,
    resetAnalytics,
    
    // Utilities
    getNotification,
    getNotificationsByType,
    getNotificationsByPriority,
    getNotificationsByCategory,
    getNotificationsByChannel,
    getUnreadNotifications,
    getBookmarkedNotifications,
    getStarredNotifications,
    
    // Permission management
    requestPermissions,
    hasPermission,
    
    // Sound and vibration
    playSound,
    vibrate,
    
    // Export/Import
    exportNotifications,
    importNotifications
  }), [
    state,
    addNotification,
    removeNotification,
    updateNotification,
    clearNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    restoreNotification,
    bookmarkNotification,
    starNotification,
    shareNotification,
    snoozeNotification,
    pinNotification,
    bulkAction,
    selectNotification,
    selectAll,
    clearSelection,
    setFilter,
    setSortBy,
    searchNotifications,
    updatePreferences,
    getChannelPreferences,
    updateChannelPreferences,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
    enqueueNotification,
    processQueue,
    clearQueue,
    pauseQueue,
    resumeQueue,
    enableRealTimeConnection,
    disableRealTime,
    syncNotifications,
    trackNotificationEvent,
    getAnalytics,
    resetAnalytics,
    getNotification,
    getNotificationsByType,
    getNotificationsByPriority,
    getNotificationsByCategory,
    getNotificationsByChannel,
    getUnreadNotifications,
    getBookmarkedNotifications,
    getStarredNotifications,
    requestPermissions,
    hasPermission,
    playSound,
    vibrate,
    exportNotifications,
    importNotifications
  ]);
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// ============================================================================
// HOOKS
// ============================================================================

export const useNotificationContext = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

// ============================================================================
// EXPORT
// ============================================================================

export default NotificationProvider;
