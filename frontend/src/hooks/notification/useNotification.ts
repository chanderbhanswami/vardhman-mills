import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast, ToastOptions, Toaster } from 'react-hot-toast';
import {
  requestNotificationPermission,
  onMessageListener,
  subscribeTopic as firebaseSubscribeTopic,
  unsubscribeTopic as firebaseUnsubscribeTopic,
  isNotificationSupported as checkFirebaseSupport,
  removeFCMToken,
  getCurrentToken,
} from '@/lib/firebase/client';
import {
  saveNotificationToken,
  removeNotificationToken,
  getNotificationHistory,
  markNotificationAsRead as apiMarkAsRead,
  getUnreadCount as apiGetUnreadCount,
} from '@/services/notification.service';

export interface NotificationOptions extends Omit<ToastOptions, 'id'> {
  id?: string;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading' | 'custom';
  persistent?: boolean;
  actions?: NotificationAction[];
  onShow?: () => void;
  onHide?: () => void;
  onClick?: () => void;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, unknown>;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export interface NotificationState {
  notifications: StoredNotification[];
  activeCount: number;
  totalCount: number;
  unreadCount: number;
  categories: string[];
}

export interface StoredNotification extends NotificationOptions {
  id: string;
  createdAt: Date;
  readAt?: Date;
  dismissedAt?: Date;
  isActive: boolean;
  isRead: boolean;
  isDismissed: boolean;
}

export interface NotificationConfig {
  maxNotifications?: number;
  defaultDuration?: number;
  enableSound?: boolean;
  enableBadge?: boolean;
  enableBrowserNotifications?: boolean;
  persistToStorage?: boolean;
  storageKey?: string;
  position?: ToastOptions['position'];
  enableQueue?: boolean;
  queueLimit?: number;
  enableFirebase?: boolean; // Enable Firebase Cloud Messaging
  autoSyncWithBackend?: boolean; // Automatically sync notifications with backend
}

export const useNotification = (config: NotificationConfig = {}) => {
  const {
    maxNotifications = 50,
    defaultDuration = 4000,
    enableSound = false,
    enableBadge = false,
    enableBrowserNotifications = false,
    persistToStorage = true,
    storageKey = 'notifications',
    position = 'top-right',
    enableQueue = true,
    queueLimit = 5,
    enableFirebase = true,
    autoSyncWithBackend = true,
  } = config;

  // Firebase state
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [firebasePermission, setFirebasePermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [isFirebaseSupported, setIsFirebaseSupported] = useState<boolean>(false);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState<boolean>(false);

  const [state, setState] = useState<NotificationState>(() => {
    let initialNotifications: StoredNotification[] = [];

    // Load from localStorage if enabled
    if (persistToStorage && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsedNotifications = JSON.parse(stored);
          initialNotifications = parsedNotifications.map((notif: StoredNotification) => ({
            ...notif,
            createdAt: new Date(notif.createdAt),
            readAt: notif.readAt ? new Date(notif.readAt) : undefined,
            dismissedAt: notif.dismissedAt ? new Date(notif.dismissedAt) : undefined,
          }));
        }
      } catch (error) {
        console.warn('Failed to load notifications from storage:', error);
      }
    }

    return {
      notifications: initialNotifications,
      activeCount: initialNotifications.filter(n => n.isActive).length,
      totalCount: initialNotifications.length,
      unreadCount: initialNotifications.filter(n => !n.isRead).length,
      categories: Array.from(new Set(initialNotifications.map(n => n.category).filter(Boolean) as string[])),
    };
  });

  const [queue, setQueue] = useState<NotificationOptions[]>([]);

  // Persist notifications to localStorage
  const persistNotifications = useCallback((notifications: StoredNotification[]) => {
    if (persistToStorage && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(notifications));
      } catch (error) {
        console.warn('Failed to persist notifications:', error);
      }
    }
  }, [persistToStorage, storageKey]);

  // Update state and persist
  const updateState = useCallback((notifications: StoredNotification[]) => {
    const newState: NotificationState = {
      notifications,
      activeCount: notifications.filter(n => n.isActive).length,
      totalCount: notifications.length,
      unreadCount: notifications.filter(n => !n.isRead).length,
      categories: Array.from(new Set(notifications.map(n => n.category).filter(Boolean) as string[])),
    };

    setState(newState);
    persistNotifications(notifications);

    // Update document title badge
    if (enableBadge && typeof document !== 'undefined') {
      const originalTitle = document.title.replace(/ \(\d+\)$/, '');
      document.title = newState.unreadCount > 0 
        ? `${originalTitle} (${newState.unreadCount})`
        : originalTitle;
    }

    return newState;
  }, [persistNotifications, enableBadge]);

  // Play notification sound
  const playSound = useCallback(() => {
    if (enableSound && typeof window !== 'undefined') {
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore autoplay restrictions
        });
      } catch (error) {
        console.warn('Failed to play notification sound:', error);
      }
    }
  }, [enableSound]);

  // Show browser notification
  const showBrowserNotification = useCallback(async (options: NotificationOptions) => {
    if (!enableBrowserNotifications || typeof window === 'undefined') return;

    try {
      // Request permission if needed
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      if (Notification.permission === 'granted') {
        const notification = new Notification(options.title || 'Notification', {
          body: options.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: options.id || 'default',
          requireInteraction: options.persistent,
        });

        if (options.onClick) {
          notification.onclick = options.onClick;
        }

        // Auto close after duration
        if (!options.persistent && options.duration !== Infinity) {
          setTimeout(() => {
            notification.close();
          }, options.duration || defaultDuration);
        }
      }
    } catch (error) {
      console.warn('Failed to show browser notification:', error);
    }
  }, [enableBrowserNotifications, defaultDuration]);

  // Process notification queue
  const processQueue = useCallback(() => {
    if (!enableQueue || queue.length === 0) return;

    setQueue(prevQueue => {
      const newQueue = [...prevQueue];
      const toProcess = newQueue.splice(0, queueLimit);
      
      toProcess.forEach(options => {
        // Show toast immediately without re-queueing
        const toastId = toast(options.message, {
          ...options,
          duration: options.duration || defaultDuration,
        });

        // Create stored notification
        const storedNotification: StoredNotification = {
          ...options,
          id: options.id || toastId,
          createdAt: new Date(),
          isActive: true,
          isRead: false,
          isDismissed: false,
        };

        setState(prevState => {
          const newNotifications = [storedNotification, ...prevState.notifications];
          // Limit total notifications
          if (newNotifications.length > maxNotifications) {
            newNotifications.splice(maxNotifications);
          }

          return updateState(newNotifications);
        });
      });

      return newQueue;
    });
  }, [enableQueue, queue, queueLimit, defaultDuration, maxNotifications, updateState]);

  // Show notification
  const show = useCallback((options: NotificationOptions) => {
    const notificationId = options.id || Date.now().toString();
    
    const notificationOptions: NotificationOptions = {
      ...options,
      id: notificationId,
      duration: options.duration || defaultDuration,
      position,
    };

    // Add to queue if enabled and we have too many active notifications
    if (enableQueue && state.activeCount >= queueLimit) {
      setQueue(prevQueue => [...prevQueue, notificationOptions]);
      return notificationId;
    }

    // Show toast
    let toastId: string;
    
    switch (options.type) {
      case 'success':
        toastId = toast.success(options.message, notificationOptions);
        break;
      case 'error':
        toastId = toast.error(options.message, notificationOptions);
        break;
      case 'loading':
        toastId = toast.loading(options.message, notificationOptions);
        break;
      case 'custom':
        toastId = toast.custom(options.message, notificationOptions);
        break;
      default:
        toastId = toast(options.message, notificationOptions);
    }

    const storedNotification: StoredNotification = {
      ...notificationOptions,
      id: toastId,
      createdAt: new Date(),
      isActive: true,
      isRead: false,
      isDismissed: false,
    };

    setState(prevState => {
      const newNotifications = [storedNotification, ...prevState.notifications];
      
      // Limit total notifications
      if (newNotifications.length > maxNotifications) {
        newNotifications.splice(maxNotifications);
      }

      return updateState(newNotifications);
    });

    // Call lifecycle methods
    if (options.onShow) options.onShow();
    
    // Play sound and show browser notification
    playSound();
    showBrowserNotification(notificationOptions);

    return toastId;
  }, [
    defaultDuration,
    position,
    enableQueue,
    state.activeCount,
    queueLimit,
    maxNotifications,
    updateState,
    playSound,
    showBrowserNotification,
  ]);

  // Convenience methods for different types
  const success = useCallback((message: string, options?: Partial<NotificationOptions>) => {
    return show({ ...options, message, type: 'success' });
  }, [show]);

  const error = useCallback((message: string, options?: Partial<NotificationOptions>) => {
    return show({ ...options, message, type: 'error' });
  }, [show]);

  const warning = useCallback((message: string, options?: Partial<NotificationOptions>) => {
    return show({ ...options, message, type: 'warning' });
  }, [show]);

  const info = useCallback((message: string, options?: Partial<NotificationOptions>) => {
    return show({ ...options, message, type: 'info' });
  }, [show]);

  const loading = useCallback((message: string, options?: Partial<NotificationOptions>) => {
    return show({ ...options, message, type: 'loading' });
  }, [show]);

  // Dismiss notification
  const dismiss = useCallback((id: string) => {
    toast.dismiss(id);
    
    setState(prevState => {
      const newNotifications = prevState.notifications.map(notification =>
        notification.id === id
          ? { 
              ...notification, 
              isActive: false, 
              isDismissed: true, 
              dismissedAt: new Date() 
            }
          : notification
      );

      const dismissed = prevState.notifications.find(n => n.id === id);
      if (dismissed?.onHide) dismissed.onHide();

      return updateState(newNotifications);
    });

    // Process queue after dismissing
    processQueue();
  }, [updateState, processQueue]);

  // Dismiss all notifications
  const dismissAll = useCallback(() => {
    toast.dismiss();
    
    setState(prevState => {
      const newNotifications = prevState.notifications.map(notification => ({
        ...notification,
        isActive: false,
        isDismissed: true,
        dismissedAt: new Date(),
      }));

      return updateState(newNotifications);
    });

    setQueue([]);
  }, [updateState]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    setState(prevState => {
      const newNotifications = prevState.notifications.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true, readAt: new Date() }
          : notification
      );

      return updateState(newNotifications);
    });

    // Sync with backend if enabled
    if (autoSyncWithBackend && enableFirebase) {
      try {
        await apiMarkAsRead(id);
      } catch (error) {
        console.error('Failed to mark notification as read on backend:', error);
      }
    }
  }, [updateState, autoSyncWithBackend, enableFirebase]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setState(prevState => {
      const newNotifications = prevState.notifications.map(notification => ({
        ...notification,
        isRead: true,
        readAt: notification.readAt || new Date(),
      }));

      return updateState(newNotifications);
    });
  }, [updateState]);

  // Remove notification
  const remove = useCallback((id: string) => {
    setState(prevState => {
      const newNotifications = prevState.notifications.filter(
        notification => notification.id !== id
      );

      return updateState(newNotifications);
    });
  }, [updateState]);

  // Clear all notifications
  const clear = useCallback(() => {
    updateState([]);
    setQueue([]);
    toast.dismiss();
  }, [updateState]);

  // Get notifications by category
  const getByCategory = useCallback((category: string) => {
    return state.notifications.filter(notification => 
      notification.category === category
    );
  }, [state.notifications]);

  // Get notifications by type
  const getByType = useCallback((type: NotificationOptions['type']) => {
    return state.notifications.filter(notification => 
      notification.type === type
    );
  }, [state.notifications]);

  // Get recent notifications
  const getRecent = useCallback((hours = 24) => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return state.notifications.filter(notification =>
      notification.createdAt > cutoff
    );
  }, [state.notifications]);

  // Process queue when active count changes
  useEffect(() => {
    if (state.activeCount < queueLimit) {
      processQueue();
    }
  }, [state.activeCount, queueLimit, processQueue]);

  // Request browser notification permission on first use
  useEffect(() => {
    if (enableBrowserNotifications && typeof window !== 'undefined') {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [enableBrowserNotifications]);

  // Firebase support check on mount
  useEffect(() => {
    if (enableFirebase) {
      checkFirebaseSupport().then(supported => {
        setIsFirebaseSupported(supported);
        if (supported && 'Notification' in window) {
          setFirebasePermission(Notification.permission as 'default' | 'granted' | 'denied');
        }
      }).catch(error => {
        console.error('Error checking Firebase support:', error);
      });
    }
  }, [enableFirebase]);

  // Listen for foreground Firebase messages
  useEffect(() => {
    if (!enableFirebase || !isFirebaseSupported) return;

    // Set up message listener with callback
    const unsubscribe = onMessageListener((payload) => {
      console.log('Received foreground Firebase message:', payload);
      
      // Show notification using our notification system
      if (payload.notification) {
        show({
          title: payload.notification.title,
          message: payload.notification.body || 'New notification',
          type: 'info',
          category: 'firebase',
          persistent: false,
          metadata: {
            ...payload.data,
            messageId: payload.messageId,
            from: payload.from,
          },
          onClick: () => {
            // Handle notification click - navigate to link if provided
            if (payload.data?.link) {
              window.location.href = payload.data.link;
            }
          },
        });
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [enableFirebase, isFirebaseSupported, show]);

  // Sync notification history from backend
  useEffect(() => {
    if (!autoSyncWithBackend || !enableFirebase) return;

    const syncHistory = async () => {
      try {
        const result = await getNotificationHistory(50, 0);
        
        if (result.notifications && result.notifications.length > 0) {
          // Update state with backend notifications
          setState(prevState => {
            const backendNotifications: StoredNotification[] = result.notifications.map((notif) => ({
              id: notif.id,
              message: notif.body,
              title: notif.title,
              type: 'info' as const,
              category: notif.type,
              createdAt: new Date(notif.createdAt),
              isActive: false,
              isRead: notif.read,
              isDismissed: true,
              metadata: notif.data,
            }));

            // Merge with existing notifications, avoiding duplicates
            const existingIds = new Set(prevState.notifications.map(n => n.id));
            const newNotifications = backendNotifications.filter(n => !existingIds.has(n.id));
            
            const merged = [...prevState.notifications, ...newNotifications];
            
            // Limit total notifications
            if (merged.length > maxNotifications) {
              merged.splice(maxNotifications);
            }

            return updateState(merged);
          });

          // Update unread count
          if (result.unreadCount !== state.unreadCount) {
            console.log('Synced notification history:', result.notifications.length, 'notifications');
          }
        }
      } catch (error) {
        console.error('Failed to sync notification history:', error);
      }
    };

    // Initial sync
    syncHistory();

    // Sync every 5 minutes
    const interval = setInterval(syncHistory, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoSyncWithBackend, enableFirebase, maxNotifications, state.unreadCount, updateState]);

  // Periodically check unread count from backend
  useEffect(() => {
    if (!autoSyncWithBackend || !enableFirebase) return;

    const checkUnreadCount = async () => {
      try {
        const count = await apiGetUnreadCount();
        
        if (count !== state.unreadCount) {
          // Update badge if count changed
          if (enableBadge && typeof document !== 'undefined') {
            const originalTitle = document.title.replace(/ \(\d+\)$/, '');
            document.title = count > 0 
              ? `${originalTitle} (${count})`
              : originalTitle;
          }
        }
      } catch (error) {
        console.error('Failed to check unread count:', error);
      }
    };

    // Check every 2 minutes
    const interval = setInterval(checkUnreadCount, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoSyncWithBackend, enableFirebase, enableBadge, state.unreadCount]);

  // Firebase-specific methods
  const requestFirebasePermission = useCallback(async () => {
    if (!enableFirebase || !isFirebaseSupported) {
      console.warn('Firebase notifications are not supported');
      return null;
    }

    setIsFirebaseLoading(true);

    try {
      const token = await requestNotificationPermission();

      if (token) {
        setFcmToken(token);
        setFirebasePermission('granted');

        // Save token to backend
        if (autoSyncWithBackend) {
          try {
            await saveNotificationToken(token);
            console.log('FCM token saved to backend');
          } catch (error) {
            console.error('Failed to save FCM token to backend:', error);
          }
        }

        // Show success notification
        success('Push notifications enabled successfully!', {
          category: 'system',
        });

        return token;
      } else {
        setFirebasePermission('denied');
        error('Failed to enable push notifications', {
          category: 'system',
        });
        return null;
      }
    } catch (err) {
      console.error('Error requesting Firebase permission:', err);
      error('Failed to enable push notifications', {
        category: 'system',
      });
      return null;
    } finally {
      setIsFirebaseLoading(false);
    }
  }, [enableFirebase, isFirebaseSupported, autoSyncWithBackend, success, error]);

  const revokeFirebasePermission = useCallback(async () => {
    if (!fcmToken) return;

    setIsFirebaseLoading(true);

    try {
      // Remove token from backend
      if (autoSyncWithBackend) {
        await removeNotificationToken(fcmToken);
      }

      // Delete FCM token
      await removeFCMToken();

      setFcmToken(null);
      
      success('Push notifications disabled', {
        category: 'system',
      });
    } catch (err) {
      console.error('Error revoking Firebase permission:', err);
      error('Failed to disable push notifications', {
        category: 'system',
      });
    } finally {
      setIsFirebaseLoading(false);
    }
  }, [fcmToken, autoSyncWithBackend, success, error]);

  const subscribeToTopic = useCallback(async (topic: string) => {
    if (!fcmToken) {
      error('Please enable push notifications first', {
        category: 'system',
      });
      return false;
    }

    try {
      await firebaseSubscribeTopic(fcmToken, topic);
      success(`Subscribed to ${topic} notifications`, {
        category: 'system',
      });
      return true;
    } catch (err) {
      console.error('Error subscribing to topic:', err);
      error(`Failed to subscribe to ${topic}`, {
        category: 'system',
      });
      return false;
    }
  }, [fcmToken, success, error]);

  const unsubscribeFromTopic = useCallback(async (topic: string) => {
    if (!fcmToken) return false;

    try {
      await firebaseUnsubscribeTopic(fcmToken, topic);
      success(`Unsubscribed from ${topic} notifications`, {
        category: 'system',
      });
      return true;
    } catch (err) {
      console.error('Error unsubscribing from topic:', err);
      error(`Failed to unsubscribe from ${topic}`, {
        category: 'system',
      });
      return false;
    }
  }, [fcmToken, success, error]);

  const refreshFirebaseToken = useCallback(async () => {
    if (!enableFirebase || !isFirebaseSupported) return null;

    try {
      const token = await getCurrentToken();
      if (token) {
        setFcmToken(token);
        
        // Update backend
        if (autoSyncWithBackend) {
          await saveNotificationToken(token);
        }
      }
      return token;
    } catch (error) {
      console.error('Error refreshing Firebase token:', error);
      return null;
    }
  }, [enableFirebase, isFirebaseSupported, autoSyncWithBackend]);

  // Computed values
  const computed = useMemo(() => ({
    hasUnread: state.unreadCount > 0,
    hasActive: state.activeCount > 0,
    hasQueue: queue.length > 0,
    queueSize: queue.length,
    isEmpty: state.totalCount === 0,
    recentCount: getRecent().length,
    categoriesCount: state.categories.length,
    isFirebaseEnabled: enableFirebase && isFirebaseSupported,
    hasFirebasePermission: firebasePermission === 'granted',
    isFirebaseDenied: firebasePermission === 'denied',
  }), [state, queue.length, getRecent, enableFirebase, isFirebaseSupported, firebasePermission]);

  return {
    // State
    ...state,
    queue: enableQueue ? queue : [],
    
    // Show methods
    show,
    success,
    error,
    warning,
    info,
    loading,
    
    // Management methods
    dismiss,
    dismissAll,
    markAsRead,
    markAllAsRead,
    remove,
    clear,
    
    // Query methods
    getByCategory,
    getByType,
    getRecent,
    
    // Computed values
    ...computed,
    
    // Firebase state
    fcmToken,
    firebasePermission,
    isFirebaseSupported,
    isFirebaseLoading,
    
    // Firebase methods
    requestFirebasePermission,
    revokeFirebasePermission,
    subscribeToTopic,
    unsubscribeFromTopic,
    refreshFirebaseToken,
    
    // Configuration
    config: {
      maxNotifications,
      defaultDuration,
      enableSound,
      enableBadge,
      enableBrowserNotifications,
      persistToStorage,
      storageKey,
      position,
      enableQueue,
      queueLimit,
      enableFirebase,
      autoSyncWithBackend,
    },
    
    // Toaster component reference
    ToasterComponent: Toaster,
  };
};

export default useNotification;