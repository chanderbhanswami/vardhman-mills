/**
 * Firebase Client Configuration
 * 
 * Handles Firebase initialization and Cloud Messaging for the frontend
 * 
 * Features:
 * - Firebase app initialization
 * - Cloud Messaging setup
 * - Token management with localStorage
 * - Permission requests
 * - Message listening
 * - Topic subscription
 * - Browser compatibility checks
 * 
 * @see https://firebase.google.com/docs/cloud-messaging/js/client
 */

import { initializeApp, getApp, FirebaseApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  deleteToken,
  isSupported,
  Messaging,
  MessagePayload,
} from 'firebase/messaging';

// ============================================
// CONFIGURATION
// ============================================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
const FCM_TOKEN_KEY = 'fcm_token';
const TOKEN_EXPIRY_KEY = 'fcm_token_expiry';
const TOKEN_VALIDITY_DAYS = 60; // Refresh token every 60 days

// ============================================
// FIREBASE INITIALIZATION
// ============================================

let app: FirebaseApp;
let messaging: Messaging | null = null;

/**
 * Initialize Firebase app
 */
function initializeFirebase(): FirebaseApp {
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be initialized in the browser');
  }

  try {
    app = getApp();
  } catch {
    app = initializeApp(firebaseConfig);
  }

  return app;
}

/**
 * Get Firebase Messaging instance
 */
export async function getMessagingInstance(): Promise<Messaging | null> {
  if (typeof window === 'undefined') {
    console.warn('Messaging is only available in the browser');
    return null;
  }

  if (!messaging) {
    try {
      const supported = await isSupported();
      if (!supported) {
        console.warn('Firebase Messaging is not supported in this browser');
        return null;
      }

      const app = initializeFirebase();
      messaging = getMessaging(app);
    } catch (error) {
      console.error('Error initializing Firebase Messaging:', error);
      return null;
    }
  }

  return messaging;
}

// ============================================
// BROWSER COMPATIBILITY
// ============================================

/**
 * Check if notifications are supported in the browser
 */
export async function isNotificationSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Check if required APIs are available
  const hasNotificationAPI = 'Notification' in window;
  const hasServiceWorkerAPI = 'serviceWorker' in navigator;
  const hasMessaging = await isSupported();

  return hasNotificationAPI && hasServiceWorkerAPI && hasMessaging;
}

/**
 * Check if service worker is registered
 */
async function ensureServiceWorkerRegistered(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.error('Service Worker is not supported');
    return null;
  }

  try {
    // Check if service worker is already registered
    const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    
    if (registration) {
      console.log('Service Worker already registered');
      return registration;
    }

    // Register new service worker
    const newRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Service Worker registered successfully');
    return newRegistration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

// ============================================
// TOKEN MANAGEMENT
// ============================================

/**
 * Get stored FCM token from localStorage
 */
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const token = localStorage.getItem(FCM_TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!token || !expiry) return null;

    // Check if token is expired
    const expiryDate = new Date(expiry);
    const now = new Date();

    if (now > expiryDate) {
      // Token expired, remove it
      localStorage.removeItem(FCM_TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error getting stored token:', error);
    return null;
  }
}

/**
 * Store FCM token in localStorage
 */
function storeToken(token: string): void {
  if (typeof window === 'undefined') return;

  try {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + TOKEN_VALIDITY_DAYS);

    localStorage.setItem(FCM_TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toISOString());
  } catch (error) {
    console.error('Error storing token:', error);
  }
}

/**
 * Clear stored FCM token
 */
function clearStoredToken(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(FCM_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch (error) {
    console.error('Error clearing stored token:', error);
  }
}

// ============================================
// PERMISSION & TOKEN
// ============================================

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    // Check browser support
    const supported = await isNotificationSupported();
    if (!supported) {
      throw new Error('Notifications are not supported in this browser');
    }

    // Check if we already have a valid token
    const storedToken = getStoredToken();
    if (storedToken) {
      console.log('Using stored FCM token');
      return storedToken;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Ensure service worker is registered
    await ensureServiceWorkerRegistered();

    // Get messaging instance
    const messagingInstance = await getMessagingInstance();
    if (!messagingInstance) {
      throw new Error('Failed to get messaging instance');
    }

    // Get FCM token
    const token = await getToken(messagingInstance, {
      vapidKey: VAPID_KEY,
    });

    if (token) {
      console.log('FCM Token obtained:', token.substring(0, 20) + '...');
      storeToken(token);
      return token;
    } else {
      console.log('No registration token available');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    throw error;
  }
}

/**
 * Delete FCM token
 */
export async function removeFCMToken(): Promise<boolean> {
  try {
    const messagingInstance = await getMessagingInstance();
    if (!messagingInstance) {
      return false;
    }

    await deleteToken(messagingInstance);
    clearStoredToken();
    console.log('FCM token deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting FCM token:', error);
    return false;
  }
}

/**
 * Get current FCM token (from storage or request new)
 */
export async function getCurrentToken(): Promise<string | null> {
  const storedToken = getStoredToken();
  if (storedToken) return storedToken;

  return await requestNotificationPermission();
}

// ============================================
// MESSAGE LISTENING
// ============================================

/**
 * Listen for foreground messages
 */
export function onMessageListener(
  callback: (payload: MessagePayload) => void
): (() => void) | undefined {
  if (typeof window === 'undefined') {
    console.warn('Message listener can only be set up in the browser');
    return undefined;
  }

  getMessagingInstance()
    .then((messagingInstance) => {
      if (!messagingInstance) {
        console.warn('Messaging instance not available');
        return;
      }

      return onMessage(messagingInstance, (payload) => {
        console.log('Foreground message received:', payload);
        callback(payload);
      });
    })
    .catch((error) => {
      console.error('Error setting up message listener:', error);
    });

  // Return empty unsubscribe function
  return () => {
    console.log('Message listener unsubscribed');
  };
}

// ============================================
// TOPIC SUBSCRIPTION
// ============================================

/**
 * Subscribe to a topic
 * Note: Actual subscription happens on the backend
 */
export async function subscribeTopic(token: string, topic: string): Promise<void> {
  // This should be handled by your backend API
  // The backend will use Firebase Admin SDK to subscribe the token to the topic
  console.log(`Subscribing token to topic: ${topic}`);
  
  // Call your backend API
  const response = await fetch('/api/notifications/topics/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, topic }),
  });

  if (!response.ok) {
    throw new Error('Failed to subscribe to topic');
  }
}

/**
 * Unsubscribe from a topic
 * Note: Actual unsubscription happens on the backend
 */
export async function unsubscribeTopic(token: string, topic: string): Promise<void> {
  // This should be handled by your backend API
  console.log(`Unsubscribing token from topic: ${topic}`);
  
  // Call your backend API
  const response = await fetch('/api/notifications/topics/unsubscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, topic }),
  });

  if (!response.ok) {
    throw new Error('Failed to unsubscribe from topic');
  }
}

// ============================================
// EXPORTS
// ============================================

export {
  initializeFirebase,
  firebaseConfig,
  FCM_TOKEN_KEY,
};

const firebaseClient = {
  getMessagingInstance,
  isNotificationSupported,
  requestNotificationPermission,
  removeFCMToken,
  getCurrentToken,
  onMessageListener,
  subscribeTopic,
  unsubscribeTopic,
};

export default firebaseClient;
