import { messaging } from '../config/firebase.config';
import type { Message, MulticastMessage } from 'firebase-admin/messaging';

interface NotificationPayload {
  title: string;
  body: string;
  image?: string;
  icon?: string;
  badge?: string;
  data?: Record<string, string>;
}

export class NotificationService {
  /**
   * Send notification to a single device
   */
  static async sendToDevice(
    token: string,
    payload: NotificationPayload
  ): Promise<string> {
    try {
      const message: Message = {
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.image,
        },
        data: payload.data,
        token,
        webpush: {
          notification: {
            icon: payload.icon || '/icons/icon-192x192.png',
            badge: payload.badge || '/icons/badge-72x72.png',
            requireInteraction: true,
            vibrate: [200, 100, 200],
          },
          fcmOptions: {
            link: payload.data?.link || '/',
          },
        },
      };

      if (!messaging) {
        console.warn('⚠️ Firebase messaging not initialized, skipping notification');
        return 'SKIPPED_NO_MESSAGING';
      }

      const response = await messaging.send(message);
      console.log('✅ Notification sent successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to multiple devices
   */
  static async sendToMultipleDevices(
    tokens: string[],
    payload: NotificationPayload
  ): Promise<{ successCount: number; failureCount: number }> {
    try {
      const message: MulticastMessage = {
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.image,
        },
        data: payload.data,
        tokens,
        webpush: {
          notification: {
            icon: payload.icon || '/icons/icon-192x192.png',
            badge: payload.badge || '/icons/badge-72x72.png',
            requireInteraction: true,
          },
        },
      };

      if (!messaging) {
        console.warn('⚠️ Firebase messaging not initialized, skipping multicast notification');
        return { successCount: 0, failureCount: tokens.length };
      }

      const response = await messaging.sendEachForMulticast(message);
      console.log(`✅ ${response.successCount} notifications sent successfully`);
      console.log(`❌ ${response.failureCount} notifications failed`);

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      console.error('❌ Error sending multicast notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to a topic
   */
  static async sendToTopic(
    topic: string,
    payload: NotificationPayload
  ): Promise<string> {
    try {
      const message: Message = {
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.image,
        },
        data: payload.data,
        topic,
        webpush: {
          notification: {
            icon: payload.icon || '/icons/icon-192x192.png',
            badge: payload.badge || '/icons/badge-72x72.png',
          },
        },
      };

      if (!messaging) {
        console.warn('⚠️ Firebase messaging not initialized, skipping topic notification');
        return 'SKIPPED_NO_MESSAGING';
      }

      const response = await messaging.send(message);
      console.log('✅ Topic notification sent successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error sending topic notification:', error);
      throw error;
    }
  }

  /**
   * Subscribe tokens to a topic
   */
  static async subscribeToTopic(
    tokens: string[],
    topic: string
  ): Promise<void> {
    try {
      if (!messaging) {
        console.warn('⚠️ Firebase messaging not initialized, skipping topic subscription');
        return;
      }

      const response = await messaging.subscribeToTopic(tokens, topic);
      console.log(`✅ Successfully subscribed to topic: ${topic}`);
      console.log(`Success: ${response.successCount}, Failures: ${response.failureCount}`);
    } catch (error) {
      console.error('❌ Error subscribing to topic:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe tokens from a topic
   */
  static async unsubscribeFromTopic(
    tokens: string[],
    topic: string
  ): Promise<void> {
    try {
      if (!messaging) {
        console.warn('⚠️ Firebase messaging not initialized, skipping topic unsubscription');
        return;
      }

      const response = await messaging.unsubscribeFromTopic(tokens, topic);
      console.log(`✅ Successfully unsubscribed from topic: ${topic}`);
      console.log(`Success: ${response.successCount}, Failures: ${response.failureCount}`);
    } catch (error) {
      console.error('❌ Error unsubscribing from topic:', error);
      throw error;
    }
  }

  /**
   * Send order notification
   */
  static async sendOrderNotification(
    token: string,
    orderId: string,
    status: string,
    message: string
  ) {
    return this.sendToDevice(token, {
      title: `Order ${status}`,
      body: message,
      icon: '/icons/order-icon.png',
      data: {
        type: 'order',
        orderId,
        status,
        link: `/account/orders/${orderId}`,
      },
    });
  }

  /**
   * Send promotional notification
   */
  static async sendPromotionalNotification(
    tokens: string[],
    title: string,
    body: string,
    imageUrl?: string,
    link?: string
  ) {
    return this.sendToMultipleDevices(tokens, {
      title,
      body,
      image: imageUrl,
      icon: '/icons/promo-icon.png',
      data: {
        type: 'promotional',
        link: link || '/products',
      },
    });
  }
}

export default NotificationService;