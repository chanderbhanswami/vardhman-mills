/**
 * Service Worker for Vardhman Textiles PWA
 * Handles offline functionality, caching strategies, and push notifications
 * Version: 2.0.0
 */

const CACHE_VERSION = 'vardhman-v2.0.0';
const RUNTIME_CACHE = 'vardhman-runtime';
const IMAGE_CACHE = 'vardhman-images';
const API_CACHE = 'vardhman-api';
const STATIC_CACHE = 'vardhman-static';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Cache strategies for different content types
const CACHE_STRATEGIES = {
  pages: 'NetworkFirst',
  api: 'NetworkFirst',
  images: 'CacheFirst',
  static: 'CacheFirst',
  fonts: 'CacheFirst',
};

// Cache durations (in seconds)
const CACHE_DURATIONS = {
  pages: 60 * 60, // 1 hour
  api: 5 * 60, // 5 minutes
  images: 30 * 24 * 60 * 60, // 30 days
  static: 365 * 24 * 60 * 60, // 1 year
  fonts: 365 * 24 * 60 * 60, // 1 year
};

// Log cache configuration
console.log('[SW] Cache strategies:', CACHE_STRATEGIES);
console.log('[SW] Cache durations:', CACHE_DURATIONS);

/**
 * Install Event - Cache essential assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Service worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old versions
              return (
                cacheName !== CACHE_VERSION &&
                cacheName !== RUNTIME_CACHE &&
                cacheName !== IMAGE_CACHE &&
                cacheName !== API_CACHE &&
                cacheName !== STATIC_CACHE
              );
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated successfully');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch Event - Implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Determine cache strategy based on request type
  if (request.url.includes('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
  } else if (
    request.destination === 'image' ||
    /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname)
  ) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
  } else if (
    request.destination === 'font' ||
    /\.(woff|woff2|ttf|otf)$/i.test(url.pathname)
  ) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    /\.(js|css)$/i.test(url.pathname)
  ) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else if (request.destination === 'document' || request.mode === 'navigate') {
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
  } else {
    // Use stale while revalidate for other requests
    event.respondWith(staleWhileRevalidateStrategy(request, RUNTIME_CACHE));
  }
});

/**
 * Network First Strategy
 * Try network first, fall back to cache if offline
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network request failed, serving from cache:', request.url, error.message);
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline');
    }
    
    // Return a generic offline response
    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain',
      }),
    });
  }
}

/**
 * Cache First Strategy
 * Try cache first, fall back to network if not in cache
 */
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache and network both failed:', error);
    
    return new Response('Resource not available', {
      status: 404,
      statusText: 'Not Found',
    });
  }
}

/**
 * Stale While Revalidate Strategy
 * Serve from cache immediately, update cache in background
 */
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      const cache = caches.open(cacheName);
      cache.then((c) => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  });
  
  return cachedResponse || fetchPromise;
}

/**
 * Push Notification Event
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let notificationData = {
    title: 'Vardhman Textiles',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'vardhman-notification',
    requireInteraction: false,
  };
  
  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (error) {
      console.error('[SW] Failed to parse push notification data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data || {},
      actions: notificationData.actions || [],
      vibrate: [200, 100, 200],
      timestamp: Date.now(),
    })
  );
});

/**
 * Notification Click Event
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open a new window if none found
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

/**
 * Background Sync Event
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart());
  } else if (event.tag === 'sync-wishlist') {
    event.waitUntil(syncWishlist());
  } else if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

/**
 * Sync Cart Data
 */
async function syncCart() {
  try {
    // Implement cart sync logic
    console.log('[SW] Syncing cart data...');
    // Your sync implementation here
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Cart sync failed:', error);
    return Promise.reject(error);
  }
}

/**
 * Sync Wishlist Data
 */
async function syncWishlist() {
  try {
    console.log('[SW] Syncing wishlist data...');
    // Your sync implementation here
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Wishlist sync failed:', error);
    return Promise.reject(error);
  }
}

/**
 * Sync Orders Data
 */
async function syncOrders() {
  try {
    console.log('[SW] Syncing orders data...');
    // Your sync implementation here
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Orders sync failed:', error);
    return Promise.reject(error);
  }
}

/**
 * Message Event - Handle messages from clients
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      })
    );
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

/**
 * Periodic Background Sync (if supported)
 */
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'update-products') {
    event.waitUntil(updateProductsCache());
  }
});

/**
 * Update Products Cache
 */
async function updateProductsCache() {
  try {
    console.log('[SW] Updating products cache...');
    // Fetch latest products and update cache
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Products cache update failed:', error);
    return Promise.reject(error);
  }
}

console.log('[SW] Service Worker loaded, version:', CACHE_VERSION);
