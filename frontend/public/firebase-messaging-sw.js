/**
 * Firebase Cloud Messaging Service Worker
 * 
 * This service worker handles push notifications when the app is:
 * - In the background
 * - Closed/not running
 * - Not in focus
 * 
 * @see https://firebase.google.com/docs/cloud-messaging/js/receive
 */

// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4--O-eUjyzGyJ2wcMoVRiew0WZz1t_oc",
  authDomain: "vardhman-mills-5942b.firebaseapp.com",
  projectId: "vardhman-mills-5942b",
  storageBucket: "vardhman-mills-5942b.firebasestorage.app",
  messagingSenderId: "82628179689",
  appId: "1:82628179689:web:6746f33c474fd471126278",
  measurementId: "G-V5WY1MBFXZ"
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

/**
 * Handle background messages
 * This runs when a notification is received while the app is in the background
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  // Extract notification data
  const notificationTitle = payload.notification?.title || 'Vardhman Textiles';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: payload.notification?.image,
    tag: payload.data?.tag || 'notification',
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {
      ...payload.data,
      click_action: payload.data?.click_action || payload.fcmOptions?.link || '/',
      timestamp: Date.now(),
    },
    actions: [
      {
        action: 'view',
        title: '👁️ View',
        icon: '/icons/view-icon.png',
      },
      {
        action: 'dismiss',
        title: '✖️ Dismiss',
        icon: '/icons/close-icon.png',
      },
    ],
  };

  // Show the notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * Handle notification click events
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  // Handle action button clicks
  if (event.action === 'dismiss') {
    console.log('Notification dismissed');
    return;
  }

  // Get the URL to open
  const urlToOpen = event.notification.data?.click_action || '/';

  // Open the app or focus existing tab
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );

  // Track notification click (optional)
  if (event.notification.data) {
    fetch('/api/analytics/notification-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId: event.notification.data.notificationId,
        timestamp: Date.now(),
        action: event.action || 'default',
      }),
    }).catch((error) => {
      console.error('Error tracking notification click:', error);
    });
  }
});

/**
 * Handle notification close events
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] Notification closed:', event);

  // Track notification close (optional)
  if (event.notification.data) {
    fetch('/api/analytics/notification-close', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId: event.notification.data.notificationId,
        timestamp: Date.now(),
      }),
    }).catch((error) => {
      console.error('Error tracking notification close:', error);
    });
  }
});

/**
 * Handle service worker activation
 */
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker activated');
  event.waitUntil(clients.claim());
});

/**
 * Handle service worker installation
 */
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker installed');
  console.log('[firebase-messaging-sw.js] Install event:', event);
  
  // Force the waiting service worker to become the active service worker
  event.waitUntil(self.skipWaiting());
});

/**
 * Handle push events (alternative to onBackgroundMessage)
 */
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push event received:', event);

  if (event.data) {
    try {
      const data = event.data.json();
      console.log('Push data:', data);

      // You can customize notification display here
      const title = data.notification?.title || 'New Notification';
      const options = {
        body: data.notification?.body || '',
        icon: data.notification?.icon || '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        data: data.data || {},
      };

      event.waitUntil(
        self.registration.showNotification(title, options)
      );
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }
});

console.log('[firebase-messaging-sw.js] Service worker script loaded successfully');
