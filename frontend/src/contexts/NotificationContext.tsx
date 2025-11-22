/**
 * Notification Context - Vardhman Mills Frontend
 * Manages notifications, alerts, and messaging system
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

// Types
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'order' | 'promotion' | 'security' | 'social';
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  archived: boolean;
  actionUrl?: string;
  actionText?: string;
  imageUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
  push: boolean;
  categories: {
    system: boolean;
    order: boolean;
    promotion: boolean;
    security: boolean;
    social: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface NotificationState {
  notifications: Notification[];
  settings: NotificationSettings;
  loading: boolean;
  error: string | null;
  unreadCount: number;
  lastUpdated: Date | null;
  permission: 'default' | 'granted' | 'denied';
  serviceWorkerRegistered: boolean;
}

type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<Notification> } }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'ARCHIVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<NotificationSettings> }
  | { type: 'SET_PERMISSION'; payload: 'default' | 'granted' | 'denied' }
  | { type: 'SET_SERVICE_WORKER'; payload: boolean };

interface NotificationContextType {
  state: NotificationState;
  
  // Notification operations
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read' | 'archived'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  archiveNotification: (id: string) => void;
  clearAll: () => void;
  
  // Settings
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  
  // Permission
  requestPermission: () => Promise<void>;
  
  // Service Worker
  registerServiceWorker: () => Promise<void>;
  
  // Utility
  getUnreadCount: () => number;
  getNotificationsByCategory: (category: string) => Notification[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  showDesktopNotification: (title: string, options?: NotificationOptions) => void;
  
  // Subscription
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<boolean>;
}

// Default settings
const defaultSettings: NotificationSettings = {
  enabled: true,
  sound: true,
  desktop: true,
  email: true,
  push: true,
  categories: {
    system: true,
    order: true,
    promotion: true,
    security: true,
    social: false,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

// Initial state
const initialState: NotificationState = {
  notifications: [],
  settings: defaultSettings,
  loading: false,
  error: null,
  unreadCount: 0,
  lastUpdated: null,
  permission: 'default',
  serviceWorkerRegistered: false,
};

// Utility functions
const generateNotificationId = (): string => {
  return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const isInQuietHours = (settings: NotificationSettings): boolean => {
  if (!settings.quietHours.enabled) return false;
  
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  
  return currentTime >= settings.quietHours.start || currentTime <= settings.quietHours.end;
};

// Reducer
const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_NOTIFICATIONS': {
      const unreadCount = action.payload.filter(n => !n.read && !n.archived).length;
      return {
        ...state,
        notifications: action.payload,
        unreadCount,
        lastUpdated: new Date(),
      };
    }
    
    case 'ADD_NOTIFICATION': {
      const newNotifications = [action.payload, ...state.notifications];
      const unreadCount = newNotifications.filter(n => !n.read && !n.archived).length;
      
      return {
        ...state,
        notifications: newNotifications,
        unreadCount,
        lastUpdated: new Date(),
      };
    }
    
    case 'UPDATE_NOTIFICATION': {
      const notifications = state.notifications.map(n =>
        n.id === action.payload.id ? { ...n, ...action.payload.updates } : n
      );
      const unreadCount = notifications.filter(n => !n.read && !n.archived).length;
      
      return {
        ...state,
        notifications,
        unreadCount,
        lastUpdated: new Date(),
      };
    }
    
    case 'REMOVE_NOTIFICATION': {
      const notifications = state.notifications.filter(n => n.id !== action.payload);
      const unreadCount = notifications.filter(n => !n.read && !n.archived).length;
      
      return {
        ...state,
        notifications,
        unreadCount,
        lastUpdated: new Date(),
      };
    }
    
    case 'MARK_AS_READ': {
      const notifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      const unreadCount = notifications.filter(n => !n.read && !n.archived).length;
      
      return {
        ...state,
        notifications,
        unreadCount,
      };
    }
    
    case 'MARK_ALL_AS_READ': {
      const notifications = state.notifications.map(n => ({ ...n, read: true }));
      
      return {
        ...state,
        notifications,
        unreadCount: 0,
      };
    }
    
    case 'ARCHIVE_NOTIFICATION': {
      const notifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, archived: true, read: true } : n
      );
      const unreadCount = notifications.filter(n => !n.read && !n.archived).length;
      
      return {
        ...state,
        notifications,
        unreadCount,
      };
    }
    
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    
    case 'SET_PERMISSION':
      return { ...state, permission: action.payload };
    
    case 'SET_SERVICE_WORKER':
      return { ...state, serviceWorkerRegistered: action.payload };
    
    default:
      return state;
  }
};

// Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component
interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  
  // Load notifications and settings on mount
  useEffect(() => {
    loadNotifications();
    loadSettings();
    checkPermission();
  }, []);
  
  // Auto-remove expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const validNotifications = state.notifications.filter(n => 
        !n.expiresAt || new Date(n.expiresAt) > now
      );
      
      if (validNotifications.length !== state.notifications.length) {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: validNotifications });
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [state.notifications]);
  
  const loadNotifications = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_NOTIFICATIONS', payload: data.notifications || [] });
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load notifications' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const loadSettings = (): void => {
    try {
      const savedSettings = localStorage.getItem('notification_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };
  
  const checkPermission = (): void => {
    if ('Notification' in window) {
      dispatch({ type: 'SET_PERMISSION', payload: Notification.permission });
    }
  };
  
  // Context methods
  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read' | 'archived'>): void => {
    const newNotification: Notification = {
      ...notification,
      id: generateNotificationId(),
      createdAt: new Date(),
      read: false,
      archived: false,
    };
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
    
    // Show toast if not in quiet hours and category is enabled
    if (state.settings.enabled && 
        state.settings.categories[notification.category] && 
        !isInQuietHours(state.settings)) {
      
      showToast(notification.message, notification.type === 'error' ? 'error' : 'success');
      
      // Show desktop notification if permission granted
      if (state.settings.desktop && state.permission === 'granted') {
        showDesktopNotification(notification.title, {
          body: notification.message,
          icon: '/icons/notification-icon.png',
          tag: newNotification.id,
        });
      }
    }
  };
  
  const removeNotification = (id: string): void => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };
  
  const markAsRead = (id: string): void => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  };
  
  const markAllAsRead = (): void => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };
  
  const archiveNotification = (id: string): void => {
    dispatch({ type: 'ARCHIVE_NOTIFICATION', payload: id });
  };
  
  const clearAll = (): void => {
    dispatch({ type: 'CLEAR_ALL' });
    toast.success('All notifications cleared');
  };
  
  const updateSettings = async (settings: Partial<NotificationSettings>): Promise<void> => {
    try {
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      
      // Save to localStorage
      const newSettings = { ...state.settings, ...settings };
      localStorage.setItem('notification_settings', JSON.stringify(newSettings));
      
      // Sync with server
      await fetch('/api/notifications/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      toast.success('Notification settings updated');
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      toast.error('Failed to update settings');
    }
  };
  
  const requestPermission = async (): Promise<void> => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      dispatch({ type: 'SET_PERMISSION', payload: permission });
      
      if (permission === 'granted') {
        toast.success('Desktop notifications enabled');
      }
    }
  };
  
  const registerServiceWorker = async (): Promise<void> => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        dispatch({ type: 'SET_SERVICE_WORKER', payload: true });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  };
  
  const getUnreadCount = (): number => state.unreadCount;
  
  const getNotificationsByCategory = (category: string): Notification[] => {
    return state.notifications.filter(n => n.category === category && !n.archived);
  };
  
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info'): void => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      default:
        toast(message);
    }
  };
  
  const showDesktopNotification = (title: string, options?: NotificationOptions): void => {
    if ('Notification' in window && state.permission === 'granted') {
      new Notification(title, options);
    }
  };
  
  const subscribeToPush = async (): Promise<boolean> => {
    try {
      if (!state.serviceWorkerRegistered) {
        await registerServiceWorker();
      }
      
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY,
      });
      
      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
      
      toast.success('Push notifications enabled');
      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      toast.error('Failed to enable push notifications');
      return false;
    }
  };
  
  const unsubscribeFromPush = async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove subscription from server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }
      
      toast.success('Push notifications disabled');
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      toast.error('Failed to disable push notifications');
      return false;
    }
  };
  
  const contextValue: NotificationContextType = {
    state,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    clearAll,
    updateSettings,
    requestPermission,
    registerServiceWorker,
    getUnreadCount,
    getNotificationsByCategory,
    showToast,
    showDesktopNotification,
    subscribeToPush,
    unsubscribeFromPush,
  };
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
export type { Notification, NotificationSettings, NotificationState };