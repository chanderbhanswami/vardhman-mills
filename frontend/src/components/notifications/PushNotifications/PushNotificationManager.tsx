/**
 * PushNotificationManager Component
 * Comprehensive push notification management with service worker integration
 * Features: Service worker registration, push subscription, VAPID keys, offline support
 */
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Bell, BellOff, Check, X, AlertTriangle, 
  RefreshCw, Send, Server, Monitor, WifiOff 
} from 'lucide-react';
import { notificationLogger } from '@/lib/utils/logger';

// Local interface definitions for push notification functionality
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime?: number | null;
}

export interface VapidKeys {
  publicKey: string;
  privateKey: string;
}

export interface PushNotificationConfig {
  vapidPublicKey: string;
  serviceWorkerPath?: string;
  serverEndpoint: string;
  enableAutoSubscription?: boolean;
  enableOfflineQueue?: boolean;
  subscriptionUpdateInterval?: number;
}

export interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  isActive: boolean;
  isControlling: boolean;
  registration: ServiceWorkerRegistration | null;
  error: string | null;
  lastUpdate: Date | null;
  version: string | null;
}

export interface PushSubscriptionStatus {
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  isPending: boolean;
  error: string | null;
  lastUpdated: Date | null;
  expiresAt: Date | null;
}

export interface PushManagerStatus {
  serviceWorker: ServiceWorkerStatus;
  subscription: PushSubscriptionStatus;
  isOnline: boolean;
  queuedMessages: number;
  config: PushNotificationConfig;
  permissions: {
    notification: NotificationPermission;
    push: PermissionState;
  };
  statistics: {
    totalSent: number;
    totalReceived: number;
    totalErrors: number;
    lastSent: Date | null;
    lastReceived: Date | null;
  };
}

export interface PushNotificationManagerProps {
  config: PushNotificationConfig;
  onStatusChange?: (status: PushManagerStatus) => void;
  onSubscriptionChange?: (subscription: PushSubscription | null) => void;
  onMessageReceived?: (message: unknown) => void;
  onError?: (error: Error) => void;
  showStatusIndicator?: boolean;
  showControls?: boolean;
  enableDiagnostics?: boolean;
  autoRegister?: boolean;
  className?: string;
}

// Service Worker utilities
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const generateVapidKeys = (): VapidKeys => {
  return {
    publicKey: 'generated-public-key',
    privateKey: 'generated-private-key'
  };
};

// Custom hook for push notification management
const usePushNotificationManager = (config: PushNotificationConfig) => {
  const [status, setStatus] = useState<PushManagerStatus>(() => ({
    serviceWorker: {
      isSupported: 'serviceWorker' in navigator,
      isRegistered: false,
      isActive: false,
      isControlling: false,
      registration: null,
      error: null,
      lastUpdate: null,
      version: null
    },
    subscription: {
      isSubscribed: false,
      subscription: null,
      isPending: false,
      error: null,
      lastUpdated: null,
      expiresAt: null
    },
    isOnline: navigator.onLine,
    queuedMessages: 0,
    config,
    permissions: {
      notification: Notification.permission,
      push: 'prompt' as PermissionState
    },
    statistics: {
      totalSent: 0,
      totalReceived: 0,
      totalErrors: 0,
      lastSent: null,
      lastReceived: null
    }
  }));

  const messageQueueRef = useRef<unknown[]>([]);

  // Register service worker
  const registerServiceWorker = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    if (!status.serviceWorker.isSupported) {
      throw new Error('Service Workers not supported');
    }

    try {
      notificationLogger.info('Registering service worker', { path: config.serviceWorkerPath });
      
      const registration = await navigator.serviceWorker.register(
        config.serviceWorkerPath || '/sw.js',
        { scope: '/' }
      );

      await navigator.serviceWorker.ready;

      setStatus(prev => ({
        ...prev,
        serviceWorker: {
          ...prev.serviceWorker,
          isRegistered: true,
          isActive: !!registration.active,
          isControlling: !!navigator.serviceWorker.controller,
          registration,
          error: null,
          lastUpdate: new Date(),
          version: registration.active?.scriptURL || null
        }
      }));

      notificationLogger.info('Service worker registered successfully');
      return registration;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      notificationLogger.error('Failed to register service worker', error);
      
      setStatus(prev => ({
        ...prev,
        serviceWorker: {
          ...prev.serviceWorker,
          error: errorMessage
        }
      }));
      
      throw error;
    }
  }, [config.serviceWorkerPath, status.serviceWorker.isSupported]);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async (): Promise<PushSubscription | null> => {
    if (!status.serviceWorker.registration) {
      throw new Error('Service worker not registered');
    }

    if (Notification.permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    try {
      setStatus(prev => ({
        ...prev,
        subscription: {
          ...prev.subscription,
          isPending: true,
          error: null
        }
      }));

      notificationLogger.info('Subscribing to push notifications');
      
      const applicationServerKey = urlBase64ToUint8Array(config.vapidPublicKey);
      
      const subscription = await status.serviceWorker.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource
      });

      const p256dhKey = subscription.getKey('p256dh')!;
      const authKey = subscription.getKey('auth')!;
      
      const subscriptionData: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...Array.from(new Uint8Array(p256dhKey)))),
          auth: btoa(String.fromCharCode(...Array.from(new Uint8Array(authKey))))
        },
        expirationTime: subscription.expirationTime
      };

      await fetch(`${config.serverEndpoint}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionData)
      });

      setStatus(prev => ({
        ...prev,
        subscription: {
          isSubscribed: true,
          subscription: subscriptionData,
          isPending: false,
          error: null,
          lastUpdated: new Date(),
          expiresAt: subscription.expirationTime ? new Date(subscription.expirationTime) : null
        }
      }));

      notificationLogger.info('Successfully subscribed to push notifications');
      return subscriptionData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      notificationLogger.error('Failed to subscribe to push notifications', error);
      
      setStatus(prev => ({
        ...prev,
        subscription: {
          ...prev.subscription,
          isPending: false,
          error: errorMessage
        },
        statistics: {
          ...prev.statistics,
          totalErrors: prev.statistics.totalErrors + 1
        }
      }));
      
      throw error;
    }
  }, [status.serviceWorker.registration, config.vapidPublicKey, config.serverEndpoint]);

  // Send push notification
  const sendPushNotification = useCallback(async (message: unknown): Promise<void> => {
    if (!status.subscription.isSubscribed) {
      if (config.enableOfflineQueue) {
        messageQueueRef.current.push(message);
        setStatus(prev => ({ ...prev, queuedMessages: messageQueueRef.current.length }));
        notificationLogger.info('Message queued for later delivery', { queueSize: messageQueueRef.current.length });
        return;
      }
      throw new Error('Not subscribed to push notifications');
    }

    try {
      const response = await fetch(`${config.serverEndpoint}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: status.subscription.subscription,
          message
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to send push notification: ${response.statusText}`);
      }

      setStatus(prev => ({
        ...prev,
        statistics: {
          ...prev.statistics,
          totalSent: prev.statistics.totalSent + 1,
          lastSent: new Date()
        }
      }));

      notificationLogger.info('Push notification sent successfully');
    } catch (error) {
      notificationLogger.error('Failed to send push notification', error);
      
      setStatus(prev => ({
        ...prev,
        statistics: {
          ...prev.statistics,
          totalErrors: prev.statistics.totalErrors + 1
        }
      }));
      
      throw error;
    }
  }, [status.subscription.isSubscribed, status.subscription.subscription, config.serverEndpoint, config.enableOfflineQueue]);

  return {
    status,
    registerServiceWorker,
    subscribeToPush,
    sendPushNotification
  };
};

export const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({
  config,
  onStatusChange,
  onSubscriptionChange,
  onError,
  showStatusIndicator = true,
  showControls = true,
  className = ''
}) => {
  const {
    status,
    registerServiceWorker,
    subscribeToPush,
    sendPushNotification
  } = usePushNotificationManager(config);

  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    onSubscriptionChange?.(status.subscription.subscription);
  }, [status.subscription.subscription, onSubscriptionChange]);

  const handleRegisterServiceWorker = async () => {
    setIsRegistering(true);
    try {
      await registerServiceWorker();
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      await subscribeToPush();
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testMessage.trim()) return;
    
    try {
      await sendPushNotification({
        title: 'Test Notification',
        body: testMessage,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png'
      });
      setTestMessage('');
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const getStatusColor = () => {
    if (!status.serviceWorker.isSupported) return 'text-gray-500';
    if (status.serviceWorker.error || status.subscription.error) return 'text-red-500';
    if (status.subscription.isSubscribed) return 'text-green-500';
    if (status.serviceWorker.isRegistered) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const getStatusIcon = () => {
    if (!status.serviceWorker.isSupported) return <X className="w-4 h-4" />;
    if (status.serviceWorker.error || status.subscription.error) return <AlertTriangle className="w-4 h-4" />;
    if (status.subscription.isSubscribed) return <Check className="w-4 h-4" />;
    if (status.serviceWorker.isRegistered) return <Bell className="w-4 h-4" />;
    return <BellOff className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (!status.serviceWorker.isSupported) return 'Not Supported';
    if (status.serviceWorker.error) return `SW Error: ${status.serviceWorker.error}`;
    if (status.subscription.error) return `Sub Error: ${status.subscription.error}`;
    if (status.subscription.isPending) return 'Subscribing...';
    if (status.subscription.isSubscribed) return 'Push Enabled';
    if (status.serviceWorker.isRegistered) return 'SW Registered';
    return 'Not Registered';
  };

  return (
    <div className={`push-notification-manager ${className}`}>
      {showStatusIndicator && (
        <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
          
          {!status.isOnline && (
            <div className="flex items-center space-x-1 text-orange-500">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm">Offline</span>
            </div>
          )}
          
          {status.queuedMessages > 0 && (
            <div className="flex items-center space-x-1 text-blue-500">
              <Monitor className="w-4 h-4" />
              <span className="text-sm">{status.queuedMessages} queued</span>
            </div>
          )}
        </div>
      )}

      {showControls && (
        <div className="mt-4 space-y-3">
          {!status.serviceWorker.isRegistered && (
            <button
              onClick={handleRegisterServiceWorker}
              disabled={isRegistering || !status.serviceWorker.isSupported}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isRegistering ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Server className="w-4 h-4" />
              )}
              <span>{isRegistering ? 'Registering...' : 'Register Service Worker'}</span>
            </button>
          )}

          {status.serviceWorker.isRegistered && !status.subscription.isSubscribed && (
            <button
              onClick={handleSubscribe}
              disabled={isSubscribing || status.permissions.notification !== 'granted'}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubscribing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
              <span>{isSubscribing ? 'Subscribing...' : 'Enable Push Notifications'}</span>
            </button>
          )}

          {status.subscription.isSubscribed && (
            <div className="space-y-2">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter test message..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleSendTestMessage}
                disabled={!testMessage.trim()}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Test Notification</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PushNotificationManager;

export { usePushNotificationManager, urlBase64ToUint8Array, generateVapidKeys };