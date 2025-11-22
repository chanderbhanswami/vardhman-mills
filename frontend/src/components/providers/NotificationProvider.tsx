'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useAuth } from './AuthProvider';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  category?: 'order' | 'product' | 'account' | 'system' | 'promotion' | 'general';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  actions?: NotificationAction[];
  metadata?: Record<string, unknown>;
  isRead: boolean;
  isArchived: boolean;
  userId?: string;
  source?: 'system' | 'admin' | 'api' | 'user_action';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  imageUrl?: string;
  link?: string;
  channels: NotificationChannel[];
}

export interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: () => void | Promise<void>;
  icon?: string;
  disabled?: boolean;
}

export interface NotificationChannel {
  type: 'toast' | 'banner' | 'modal' | 'email' | 'sms' | 'push';
  enabled: boolean;
  delivered: boolean;
  deliveredAt?: string;
  error?: string;
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    categories: string[];
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  sms: {
    enabled: boolean;
    categories: string[];
    urgentOnly: boolean;
  };
  push: {
    enabled: boolean;
    categories: string[];
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  inApp: {
    enabled: boolean;
    showToasts: boolean;
    showBanners: boolean;
    autoArchive: boolean;
    maxVisible: number;
  };
}

export interface NotificationContextType {
  // Notifications State
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  settings: NotificationSettings;
  
  // Notification Actions
  add: (notification: Omit<Notification, 'id' | 'isRead' | 'isArchived' | 'createdAt' | 'updatedAt' | 'channels'>) => void;
  remove: (id: string) => void;
  clear: (category?: string) => void;
  
  // Toast Helpers
  success: (title: string, message?: string, options?: Partial<Notification>) => void;
  error: (title: string, message?: string, options?: Partial<Notification>) => void;
  warning: (title: string, message?: string, options?: Partial<Notification>) => void;
  info: (title: string, message?: string, options?: Partial<Notification>) => void;
  
  // Management
  markAsRead: (id: string) => Promise<{ success: boolean; error?: string }>;
  markAllAsRead: (category?: string) => Promise<{ success: boolean; error?: string }>;
  archive: (id: string) => Promise<{ success: boolean; error?: string }>;
  unarchive: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Bulk Operations
  markMultipleAsRead: (ids: string[]) => Promise<{ success: boolean; error?: string }>;
  archiveMultiple: (ids: string[]) => Promise<{ success: boolean; error?: string }>;
  deleteMultiple: (ids: string[]) => Promise<{ success: boolean; error?: string }>;
  
  // Settings
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<{ success: boolean; error?: string }>;
  testNotification: (channel: 'email' | 'sms' | 'push') => Promise<{ success: boolean; error?: string }>;
  
  // Fetch & Sync
  fetchNotifications: (filters?: {
    category?: string;
    isRead?: boolean;
    isArchived?: boolean;
    limit?: number;
    offset?: number;
  }) => Promise<void>;
  subscribeToUpdates: () => void;
  unsubscribeFromUpdates: () => void;
  
  // Permission Management
  requestNotificationPermission: () => Promise<boolean>;
  checkNotificationPermission: () => Promise<NotificationPermission>;
}

interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Context Creation
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook to use Notification Context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Default settings
const defaultSettings: NotificationSettings = {
  email: {
    enabled: true,
    categories: ['order', 'account', 'system'],
    frequency: 'immediate'
  },
  sms: {
    enabled: false,
    categories: ['order'],
    urgentOnly: true
  },
  push: {
    enabled: true,
    categories: ['order', 'promotion', 'system'],
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  },
  inApp: {
    enabled: true,
    showToasts: true,
    showBanners: true,
    autoArchive: false,
    maxVisible: 5
  }
};

// Notification Provider Component
interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  
  // Refs
  const eventSource = useRef<EventSource | null>(null);
  const notificationQueue = useRef<Notification[]>([]);
  const processingQueue = useRef(false);

  // Configuration
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const MAX_NOTIFICATIONS = 100;
  const QUEUE_PROCESS_INTERVAL = 1000; // 1 second

  // Utility Functions
  const apiRequest = useCallback(async (endpoint: string, options: AxiosRequestConfig = {}): Promise<ApiResponse> => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];

      const config: AxiosRequestConfig = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      };

      const response = await axios(`${API_BASE_URL}${endpoint}`, config);
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error('Notification API Request failed:', axiosError);
      
      return {
        success: false,
        error: axiosError.response?.data?.message || axiosError.message || 'An error occurred'
      };
    }
  }, [API_BASE_URL]);

  const generateId = useCallback((): string => {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const createNotificationChannels = useCallback((notification: Partial<Notification>): NotificationChannel[] => {
    const channels: NotificationChannel[] = [];
    
    // Always add in-app channel
    channels.push({
      type: 'toast',
      enabled: settings.inApp.showToasts,
      delivered: false
    });
    
    if (settings.inApp.showBanners && (notification.priority === 'high' || notification.priority === 'urgent')) {
      channels.push({
        type: 'banner',
        enabled: true,
        delivered: false
      });
    }
    
    if (notification.priority === 'urgent') {
      channels.push({
        type: 'modal',
        enabled: true,
        delivered: false
      });
    }
    
    return channels;
  }, [settings]);

  const shouldShowNotification = useCallback((notification: Notification): boolean => {
    if (!settings.inApp.enabled) return false;
    
    // Check quiet hours for push notifications
    if (settings.push.quietHours.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTime >= settings.push.quietHours.start || currentTime <= settings.push.quietHours.end) {
        if (notification.priority !== 'urgent') {
          return false;
        }
      }
    }
    
    return true;
  }, [settings]);

  const processNotificationQueue = useCallback(async () => {
    if (processingQueue.current || notificationQueue.current.length === 0) return;
    
    processingQueue.current = true;
    
    while (notificationQueue.current.length > 0) {
      const notification = notificationQueue.current.shift();
      if (notification && shouldShowNotification(notification)) {
        // Show toast if enabled
        if (settings.inApp.showToasts) {
          const toastFn = {
            success: toast.success,
            error: toast.error,
            warning: (msg: string) => toast(msg, { icon: '⚠️' }),
            info: (msg: string) => toast(msg, { icon: 'ℹ️' })
          }[notification.type];
          
          toastFn(`${notification.title}${notification.message ? `: ${notification.message}` : ''}`);
          // Note: toast options removed as they're not expected by the function signature
        }
      }
      
      // Small delay between notifications
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    processingQueue.current = false;
  }, [shouldShowNotification, settings.inApp.showToasts]);

  // Notification Actions
  const add = useCallback((notification: Omit<Notification, 'id' | 'isRead' | 'isArchived' | 'createdAt' | 'updatedAt' | 'channels'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      isRead: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      channels: createNotificationChannels(notification),
      userId: user?.id
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      
      // Limit notifications
      if (updated.length > MAX_NOTIFICATIONS) {
        return updated.slice(0, MAX_NOTIFICATIONS);
      }
      
      return updated;
    });

    // Add to queue for processing
    notificationQueue.current.push(newNotification);
    processNotificationQueue();
  }, [generateId, createNotificationChannels, user?.id, processNotificationQueue]);

  const remove = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast.dismiss(id);
  }, []);

  const clear = useCallback((category?: string) => {
    if (category) {
      setNotifications(prev => prev.filter(notif => notif.category !== category));
    } else {
      setNotifications([]);
      toast.dismiss();
    }
  }, []);

  // Toast Helpers
  const success = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    add({
      type: 'success',
      title,
      message: message || '',
      category: 'general',
      priority: 'medium',
      duration: 4000,
      ...options
    });
  }, [add]);

  const error = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    add({
      type: 'error',
      title,
      message: message || '',
      category: 'general',
      priority: 'high',
      persistent: true,
      ...options
    });
  }, [add]);

  const warning = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    add({
      type: 'warning',
      title,
      message: message || '',
      category: 'general',
      priority: 'medium',
      duration: 6000,
      ...options
    });
  }, [add]);

  const info = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    add({
      type: 'info',
      title,
      message: message || '',
      category: 'general',
      priority: 'low',
      duration: 4000,
      ...options
    });
  }, [add]);

  // Management
  const markAsRead = async (id: string) => {
    try {
      const result = await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
      
      if (result.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id 
              ? { ...notif, isRead: true, updatedAt: new Date().toISOString() }
              : notif
          )
        );
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Mark as read error:', error);
      return { success: false, error: 'Failed to mark notification as read' };
    }
  };

  const markAllAsRead = async (category?: string) => {
    try {
      const result = await apiRequest('/notifications/mark-all-read', {
        method: 'PATCH',
        data: { category }
      });
      
      if (result.success) {
        setNotifications(prev => 
          prev.map(notif => 
            (!category || notif.category === category)
              ? { ...notif, isRead: true, updatedAt: new Date().toISOString() }
              : notif
          )
        );
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Mark all as read error:', error);
      return { success: false, error: 'Failed to mark notifications as read' };
    }
  };

  const archive = async (id: string) => {
    try {
      const result = await apiRequest(`/notifications/${id}/archive`, { method: 'PATCH' });
      
      if (result.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id 
              ? { ...notif, isArchived: true, updatedAt: new Date().toISOString() }
              : notif
          )
        );
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Archive error:', error);
      return { success: false, error: 'Failed to archive notification' };
    }
  };

  const unarchive = async (id: string) => {
    try {
      const result = await apiRequest(`/notifications/${id}/unarchive`, { method: 'PATCH' });
      
      if (result.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id 
              ? { ...notif, isArchived: false, updatedAt: new Date().toISOString() }
              : notif
          )
        );
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Unarchive error:', error);
      return { success: false, error: 'Failed to unarchive notification' };
    }
  };

  // Bulk Operations
  const markMultipleAsRead = async (ids: string[]) => {
    try {
      const result = await apiRequest('/notifications/bulk-read', {
        method: 'PATCH',
        data: { ids }
      });
      
      if (result.success) {
        setNotifications(prev => 
          prev.map(notif => 
            ids.includes(notif.id)
              ? { ...notif, isRead: true, updatedAt: new Date().toISOString() }
              : notif
          )
        );
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Bulk mark as read error:', error);
      return { success: false, error: 'Failed to mark notifications as read' };
    }
  };

  const archiveMultiple = async (ids: string[]) => {
    try {
      const result = await apiRequest('/notifications/bulk-archive', {
        method: 'PATCH',
        data: { ids }
      });
      
      if (result.success) {
        setNotifications(prev => 
          prev.map(notif => 
            ids.includes(notif.id)
              ? { ...notif, isArchived: true, updatedAt: new Date().toISOString() }
              : notif
          )
        );
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Bulk archive error:', error);
      return { success: false, error: 'Failed to archive notifications' };
    }
  };

  const deleteMultiple = async (ids: string[]) => {
    try {
      const result = await apiRequest('/notifications/bulk-delete', {
        method: 'DELETE',
        data: { ids }
      });
      
      if (result.success) {
        setNotifications(prev => prev.filter(notif => !ids.includes(notif.id)));
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Bulk delete error:', error);
      return { success: false, error: 'Failed to delete notifications' };
    }
  };

  // Settings
  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const result = await apiRequest('/notifications/settings', {
        method: 'PATCH',
        data: newSettings
      });
      
      if (result.success) {
        setSettings(prev => ({ ...prev, ...newSettings }));
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Update settings error:', error);
      return { success: false, error: 'Failed to update notification settings' };
    }
  };

  const testNotification = async (channel: 'email' | 'sms' | 'push') => {
    try {
      const result = await apiRequest('/notifications/test', {
        method: 'POST',
        data: { channel }
      });
      
      if (result.success) {
        success('Test Notification', `Test ${channel} notification sent successfully`);
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Test notification error:', error);
      return { success: false, error: 'Failed to send test notification' };
    }
  };

  // Fetch & Sync
  const fetchNotifications = useCallback(async (filters?: {
    category?: string;
    isRead?: boolean;
    isArchived?: boolean;
    limit?: number;
    offset?: number;
  }) => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      
      const result = await apiRequest('/notifications', {
        method: 'GET',
        params: filters
      });
      
      if (result.success) {
        const { notifications: fetchedNotifications, settings: userSettings } = result.data as {
          notifications: Notification[];
          settings?: NotificationSettings;
        };
        
        setNotifications(fetchedNotifications);
        
        if (userSettings) {
          setSettings(userSettings);
        }
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, apiRequest]);

  const subscribeToUpdates = useCallback(() => {
    if (!isAuthenticated || eventSource.current) return;
    
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];
      
      eventSource.current = new EventSource(`${API_BASE_URL}/notifications/stream?token=${token}`);
      
      eventSource.current.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data) as Notification;
          add(notification);
        } catch (error) {
          console.error('Failed to parse notification:', error);
        }
      };
      
      eventSource.current.onerror = (error) => {
        console.error('EventSource error:', error);
        // Reconnect after 5 seconds
        setTimeout(() => {
          if (eventSource.current) {
            eventSource.current.close();
            eventSource.current = null;
            subscribeToUpdates();
          }
        }, 5000);
      };
    } catch (error) {
      console.error('Subscribe to updates error:', error);
    }
  }, [isAuthenticated, API_BASE_URL, add]);

  const unsubscribeFromUpdates = useCallback(() => {
    if (eventSource.current) {
      eventSource.current.close();
      eventSource.current = null;
    }
  }, []);

  // Permission Management
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission === 'denied') {
      return false;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const checkNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied';
    }
    
    return Notification.permission;
  };

  // Initialize notifications
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      subscribeToUpdates();
    } else {
      unsubscribeFromUpdates();
      setNotifications([]);
    }
    
    return unsubscribeFromUpdates;
  }, [isAuthenticated, fetchNotifications, subscribeToUpdates, unsubscribeFromUpdates]);

  // Process notification queue periodically
  useEffect(() => {
    const interval = setInterval(processNotificationQueue, QUEUE_PROCESS_INTERVAL);
    return () => clearInterval(interval);
  }, [processNotificationQueue]);

  // Calculate unread count
  const unreadCount = notifications.filter(notif => !notif.isRead && !notif.isArchived).length;

  // Context value
  const contextValue: NotificationContextType = {
    // Notifications State
    notifications,
    unreadCount,
    isLoading,
    settings,
    
    // Notification Actions
    add,
    remove,
    clear,
    
    // Toast Helpers
    success,
    error,
    warning,
    info,
    
    // Management
    markAsRead,
    markAllAsRead,
    archive,
    unarchive,
    
    // Bulk Operations
    markMultipleAsRead,
    archiveMultiple,
    deleteMultiple,
    
    // Settings
    updateSettings,
    testNotification,
    
    // Fetch & Sync
    fetchNotifications,
    subscribeToUpdates,
    unsubscribeFromUpdates,
    
    // Permission Management
    requestNotificationPermission,
    checkNotificationPermission,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'notification-toast',
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            border: '1px solid #444',
            fontSize: '14px',
            maxWidth: '400px'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff'
            }
          }
        }}
      />
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
