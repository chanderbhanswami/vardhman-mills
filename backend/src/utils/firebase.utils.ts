import { messaging, auth, firestore } from '../config/firebase.config';
import type { Message, MulticastMessage, BatchResponse } from 'firebase-admin/messaging';
import type { UserRecord } from 'firebase-admin/auth';

/**
 * Firebase Utilities for Backend Operations
 * Provides helper functions for Firebase Admin SDK
 */

// ============================================
// MESSAGING UTILITIES
// ============================================

/**
 * Validate FCM token format
 */
export function isValidFCMToken(token: string): boolean {
  // FCM tokens are typically 152-163 characters long
  return token.length >= 140 && token.length <= 200;
}

/**
 * Batch send notifications (max 500 tokens per batch)
 */
export async function batchSendNotifications(
  tokens: string[],
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  },
  data?: Record<string, string>
): Promise<{
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
}> {
  if (!messaging) {
    console.warn('Firebase messaging not initialized');
    return { successCount: 0, failureCount: tokens.length, invalidTokens: [] };
  }

  const BATCH_SIZE = 500;
  const invalidTokens: string[] = [];
  let totalSuccessCount = 0;
  let totalFailureCount = 0;

  // Split tokens into batches
  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    const batch = tokens.slice(i, i + BATCH_SIZE);

    try {
      const message: MulticastMessage = {
        notification,
        data,
        tokens: batch,
      };

      const response = await messaging.sendEachForMulticast(message);

      totalSuccessCount += response.successCount;
      totalFailureCount += response.failureCount;

      // Collect invalid tokens
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error) {
          const errorCode = resp.error.code;
          if (
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(batch[idx]);
          }
        }
      });
    } catch (error) {
      console.error(`Error sending batch ${i / BATCH_SIZE}:`, error);
      totalFailureCount += batch.length;
    }
  }

  return {
    successCount: totalSuccessCount,
    failureCount: totalFailureCount,
    invalidTokens,
  };
}

/**
 * Send notification with retry logic
 */
export async function sendNotificationWithRetry(
  token: string,
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  },
  data?: Record<string, string>,
  maxRetries: number = 3
): Promise<string> {
  if (!messaging) {
    throw new Error('Firebase messaging not initialized');
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const message: Message = {
        notification,
        data,
        token,
      };

      const messageId = await messaging.send(message);
      console.log(`✅ Notification sent on attempt ${attempt}:`, messageId);
      return messageId;
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Failed to send notification after ${maxRetries} attempts: ${lastError?.message}`
  );
}

/**
 * Send notification with priority
 */
export async function sendHighPriorityNotification(
  token: string,
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  },
  data?: Record<string, string>
): Promise<string> {
  if (!messaging) {
    throw new Error('Firebase messaging not initialized');
  }

  const message: Message = {
    notification,
    data,
    token,
    android: {
      priority: 'high',
      notification: {
        priority: 'high',
        sound: 'default',
        channelId: 'high_importance_channel',
      },
    },
    apns: {
      headers: {
        'apns-priority': '10',
      },
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
    webpush: {
      headers: {
        Urgency: 'high',
      },
      notification: {
        requireInteraction: true,
        vibrate: [200, 100, 200],
      },
    },
  };

  return await messaging.send(message);
}

/**
 * Clean up invalid FCM tokens
 */
export async function cleanupInvalidTokens(
  tokens: string[]
): Promise<string[]> {
  if (!messaging) {
    console.warn('Firebase messaging not initialized');
    return [];
  }

  const invalidTokens: string[] = [];

  for (const token of tokens) {
    try {
      // Try to send a dry-run message
      await messaging.send(
        {
          token,
          notification: {
            title: 'Test',
            body: 'Test',
          },
        },
        true // dry run
      );
    } catch (error: any) {
      if (
        error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered'
      ) {
        invalidTokens.push(token);
      }
    }
  }

  return invalidTokens;
}

// ============================================
// TOPIC MANAGEMENT UTILITIES
// ============================================

/**
 * Subscribe users to multiple topics
 */
export async function subscribeToMultipleTopics(
  token: string,
  topics: string[]
): Promise<{ success: string[]; failed: string[] }> {
  if (!messaging) {
    console.warn('Firebase messaging not initialized');
    return { success: [], failed: topics };
  }

  const success: string[] = [];
  const failed: string[] = [];

  for (const topic of topics) {
    try {
      await messaging.subscribeToTopic([token], topic);
      success.push(topic);
    } catch (error) {
      console.error(`Failed to subscribe to topic ${topic}:`, error);
      failed.push(topic);
    }
  }

  return { success, failed };
}

/**
 * Unsubscribe users from multiple topics
 */
export async function unsubscribeFromMultipleTopics(
  token: string,
  topics: string[]
): Promise<{ success: string[]; failed: string[] }> {
  if (!messaging) {
    console.warn('Firebase messaging not initialized');
    return { success: [], failed: topics };
  }

  const success: string[] = [];
  const failed: string[] = [];

  for (const topic of topics) {
    try {
      await messaging.unsubscribeFromTopic([token], topic);
      success.push(topic);
    } catch (error) {
      console.error(`Failed to unsubscribe from topic ${topic}:`, error);
      failed.push(topic);
    }
  }

  return { success, failed };
}

/**
 * Get topic management suggestions based on user preferences
 */
export function getRecommendedTopics(userPreferences: {
  categories?: string[];
  brands?: string[];
  priceRange?: 'budget' | 'mid' | 'premium';
  notifyNewArrivals?: boolean;
  notifySales?: boolean;
}): string[] {
  const topics: string[] = ['all_users'];

  // Category-based topics
  if (userPreferences.categories) {
    topics.push(
      ...userPreferences.categories.map((cat) => `category_${cat.toLowerCase()}`)
    );
  }

  // Brand-based topics
  if (userPreferences.brands) {
    topics.push(
      ...userPreferences.brands.map((brand) => `brand_${brand.toLowerCase()}`)
    );
  }

  // Price range topics
  if (userPreferences.priceRange) {
    topics.push(`price_${userPreferences.priceRange}`);
  }

  // Feature-based topics
  if (userPreferences.notifyNewArrivals) {
    topics.push('new_arrivals');
  }

  if (userPreferences.notifySales) {
    topics.push('sales_promotions');
  }

  return topics;
}

// ============================================
// AUTHENTICATION UTILITIES
// ============================================

/**
 * Create custom Firebase token for user
 */
export async function createCustomToken(
  uid: string,
  additionalClaims?: Record<string, any>
): Promise<string> {
  if (!auth) {
    throw new Error('Firebase auth not initialized');
  }
  
  try {
    const token = await auth.createCustomToken(uid, additionalClaims);
    return token;
  } catch (error) {
    console.error('Error creating custom token:', error);
    throw error;
  }
}

/**
 * Verify Firebase ID token
 */
export async function verifyIdToken(idToken: string): Promise<{
  valid: boolean;
  uid?: string;
  email?: string;
  claims?: Record<string, any>;
}> {
  if (!auth) {
    console.warn('Firebase auth not initialized — verifyIdToken will return invalid');
    return { valid: false };
  }
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return {
      valid: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      claims: decodedToken,
    };
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return { valid: false };
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  if (!auth) {
    console.warn('Firebase auth not initialized — getUserByEmail returns null');
    return null;
  }
  try {
    const user = await auth.getUserByEmail(email);
    return user;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

/**
 * Update user custom claims (for roles, permissions)
 */
export async function setUserClaims(
  uid: string,
  claims: Record<string, any>
): Promise<void> {
  if (!auth) throw new Error('Firebase auth not initialized');
  try {
    await auth.setCustomUserClaims(uid, claims);
    console.log(`✅ Custom claims set for user ${uid}`);
  } catch (error) {
    console.error('Error setting custom claims:', error);
    throw error;
  }
}

/**
 * Delete user account
 */
export async function deleteUser(uid: string): Promise<void> {
  if (!auth) throw new Error('Firebase auth not initialized');
  try {
    await auth.deleteUser(uid);
    console.log(`✅ User ${uid} deleted successfully`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * Create new user with email and password
 */
export async function createUser(
  email: string,
  password: string,
  displayName?: string,
  photoURL?: string
): Promise<UserRecord> {
  if (!auth) throw new Error('Firebase auth not initialized');
  try {
    const user = await auth.createUser({
      email,
      password,
      displayName,
      photoURL,
      emailVerified: false,
    });
    console.log(`✅ User created: ${user.uid}`);
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// ============================================
// FIRESTORE UTILITIES
// ============================================

/**
 * Save FCM token to Firestore
 */
export async function saveFCMToken(
  userId: string,
  token: string,
  deviceInfo?: {
    deviceId?: string;
    platform?: 'web' | 'android' | 'ios';
    userAgent?: string;
  }
): Promise<void> {
  if (!firestore) {
    console.warn('Firestore not initialized — saveFCMToken will no-op');
    return;
  }
  try {
    await firestore
      .collection('users')
      .doc(userId)
      .collection('fcm_tokens')
      .doc(token)
      .set({
        token,
        deviceInfo: deviceInfo || {},
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      });
    console.log(`✅ FCM token saved for user ${userId}`);
  } catch (error) {
    console.error('Error saving FCM token:', error);
    throw error;
  }
}

/**
 * Get all active FCM tokens for a user
 */
export async function getUserFCMTokens(userId: string): Promise<string[]> {
  if (!firestore) {
    console.warn('Firestore not initialized — getUserFCMTokens returns empty array');
    return [];
  }
  try {
    const snapshot = await firestore
      .collection('users')
      .doc(userId)
      .collection('fcm_tokens')
      .where('isActive', '==', true)
      .get();

    return snapshot.docs.map((doc) => doc.data().token);
  } catch (error) {
    console.error('Error getting user FCM tokens:', error);
    return [];
  }
}

/**
 * Remove FCM token from Firestore
 */
export async function removeFCMToken(
  userId: string,
  token: string
): Promise<void> {
  if (!firestore) {
    console.warn('Firestore not initialized — removeFCMToken will no-op');
    return;
  }
  try {
    await firestore
      .collection('users')
      .doc(userId)
      .collection('fcm_tokens')
      .doc(token)
      .delete();
    console.log(`✅ FCM token removed for user ${userId}`);
  } catch (error) {
    console.error('Error removing FCM token:', error);
    throw error;
  }
}

/**
 * Log notification to Firestore
 */
export async function logNotification(
  userId: string,
  notification: {
    title: string;
    body: string;
    type: string;
    data?: Record<string, any>;
  }
): Promise<void> {
  if (!firestore) {
    console.warn('Firestore not initialized — logNotification will no-op');
    return;
  }
  try {
    await firestore
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .add({
        ...notification,
        createdAt: new Date(),
        read: false,
        delivered: true,
      });
    console.log(`✅ Notification logged for user ${userId}`);
  } catch (error) {
    console.error('Error logging notification:', error);
    throw error;
  }
}

/**
 * Get user notification history
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 50
): Promise<any[]> {
  if (!firestore) {
    console.warn('Firestore not initialized — getUserNotifications returns empty list');
    return [];
  }
  try {
    const snapshot = await firestore
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<void> {
  if (!firestore) {
    console.warn('Firestore not initialized — markNotificationAsRead will no-op');
    return;
  }
  try {
    await firestore
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .doc(notificationId)
      .update({
        read: true,
        readAt: new Date(),
      });
    console.log(`✅ Notification marked as read: ${notificationId}`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Batch operations helper
 */
export async function batchUpdateDocuments(
  collection: string,
  updates: Array<{ id: string; data: Record<string, any> }>
): Promise<void> {
  if (!firestore) {
    console.warn('Firestore not initialized — batchUpdateDocuments will no-op');
    return;
  }

  const BATCH_SIZE = 500;
  const batches: any[] = [];

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = firestore.batch();
    const chunk = updates.slice(i, i + BATCH_SIZE);

    chunk.forEach(({ id, data }) => {
      const docRef = firestore!.collection(collection).doc(id);
      batch.update(docRef, data);
    });

    batches.push(batch.commit());
  }

  await Promise.all(batches);
  console.log(`✅ Batch update completed: ${updates.length} documents`);
}

// ============================================
// ANALYTICS & MONITORING UTILITIES
// ============================================

/**
 * Track notification delivery status
 */
export async function trackNotificationMetrics(
  notificationId: string,
  status: 'sent' | 'delivered' | 'failed' | 'clicked',
  metadata?: Record<string, any>
): Promise<void> {
  if (!firestore) {
    console.warn('Firestore not initialized — trackNotificationMetrics will no-op');
    return;
  }
  try {
    await firestore.collection('notification_metrics').add({
      notificationId,
      status,
      timestamp: new Date(),
      metadata: metadata || {},
    });
  } catch (error) {
    console.error('Error tracking notification metrics:', error);
  }
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(
  startDate: Date,
  endDate: Date
): Promise<{
  sent: number;
  delivered: number;
  failed: number;
  clicked: number;
}> {
  if (!firestore) {
    console.warn('Firestore not initialized — getNotificationStats returns zeroes');
    return { sent: 0, delivered: 0, failed: 0, clicked: 0 };
  }
  try {
    const snapshot = await firestore
      .collection('notification_metrics')
      .where('timestamp', '>=', startDate)
      .where('timestamp', '<=', endDate)
      .get();

    const stats = {
      sent: 0,
      delivered: 0,
      failed: 0,
      clicked: 0,
    };

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      stats[data.status as keyof typeof stats]++;
    });

    return stats;
  } catch (error) {
    console.error('Error getting notification stats:', error);
    return { sent: 0, delivered: 0, failed: 0, clicked: 0 };
  }
}

// ============================================
// NOTIFICATION TEMPLATES
// ============================================

/**
 * Common notification templates
 */
export const NotificationTemplates = {
  orderPlaced: (orderId: string, total: string) => ({
    title: '🎉 Order Placed Successfully!',
    body: `Your order #${orderId} of ${total} has been confirmed.`,
    data: { type: 'order', orderId, action: 'view_order' },
  }),

  orderShipped: (orderId: string, trackingNumber?: string) => ({
    title: '📦 Order Shipped!',
    body: trackingNumber
      ? `Your order #${orderId} is on the way! Track: ${trackingNumber}`
      : `Your order #${orderId} has been shipped.`,
    data: { type: 'order', orderId, trackingNumber, action: 'track_order' },
  }),

  orderDelivered: (orderId: string) => ({
    title: '✅ Order Delivered!',
    body: `Your order #${orderId} has been delivered. Enjoy your purchase!`,
    data: { type: 'order', orderId, action: 'rate_order' },
  }),

  priceDropAlert: (productName: string, oldPrice: string, newPrice: string) => ({
    title: '💰 Price Drop Alert!',
    body: `${productName} is now ${newPrice} (was ${oldPrice})`,
    data: { type: 'price_drop', action: 'view_product' },
  }),

  backInStock: (productName: string) => ({
    title: '🎊 Back in Stock!',
    body: `${productName} is now available. Grab it before it's gone!`,
    data: { type: 'stock_alert', action: 'view_product' },
  }),

  flashSale: (discount: string, endsIn: string) => ({
    title: '⚡ Flash Sale Alert!',
    body: `Get ${discount} off! Hurry, ends in ${endsIn}`,
    data: { type: 'promotion', action: 'view_sale' },
  }),

  cartReminder: (itemCount: number) => ({
    title: '🛒 Items Waiting in Your Cart',
    body: `You have ${itemCount} item${itemCount > 1 ? 's' : ''} in your cart. Complete your purchase!`,
    data: { type: 'cart_reminder', action: 'view_cart' },
  }),

  reviewRequest: (orderId: string, productName: string) => ({
    title: '⭐ How was your experience?',
    body: `Please rate ${productName} from your order #${orderId}`,
    data: { type: 'review_request', orderId, action: 'write_review' },
  }),

  welcomeMessage: (userName: string) => ({
    title: `Welcome to Vardhman Textiles, ${userName}! 👋`,
    body: 'Explore our premium collection of textiles and home decor.',
    data: { type: 'welcome', action: 'browse_products' },
  }),
};

// Export all utilities
export default {
  // Messaging
  isValidFCMToken,
  batchSendNotifications,
  sendNotificationWithRetry,
  sendHighPriorityNotification,
  cleanupInvalidTokens,

  // Topics
  subscribeToMultipleTopics,
  unsubscribeFromMultipleTopics,
  getRecommendedTopics,

  // Auth
  createCustomToken,
  verifyIdToken,
  getUserByEmail,
  setUserClaims,
  deleteUser,
  createUser,

  // Firestore
  saveFCMToken,
  getUserFCMTokens,
  removeFCMToken,
  logNotification,
  getUserNotifications,
  markNotificationAsRead,
  batchUpdateDocuments,

  // Analytics
  trackNotificationMetrics,
  getNotificationStats,

  // Templates
  NotificationTemplates,
};