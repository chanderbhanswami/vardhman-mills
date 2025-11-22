import { useState, useEffect, useCallback } from 'react';

interface UsePushNotificationsReturn {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  sendNotification: (title: string, options?: NotificationOptions) => Promise<void>;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported || permission !== 'granted') {
      throw new Error('Push notifications not supported or permission not granted');
    }

    try {
      // Mock subscription - replace with actual service worker registration
      console.log('Subscribing to push notifications...');
      
      // In a real implementation, you would:
      // 1. Register service worker
      // 2. Get push subscription
      // 3. Send subscription to server
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }, [isSupported, permission]);

  const unsubscribe = useCallback(async () => {
    try {
      // Mock unsubscription - replace with actual implementation
      console.log('Unsubscribing from push notifications...');
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  }, []);

  const sendNotification = useCallback(async (title: string, options?: NotificationOptions): Promise<void> => {
    if (!isSupported || permission !== 'granted') {
      throw new Error('Push notifications not supported or permission not granted');
    }

    try {
      new Notification(title, options);
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }, [isSupported, permission]);

  return {
    permission,
    isSupported,
    requestPermission,
    subscribe,
    unsubscribe,
    sendNotification
  };
};