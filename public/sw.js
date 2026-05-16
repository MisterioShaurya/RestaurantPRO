// Service Worker for RestaurantPRO - Push Notifications

const CACHE_NAME = 'restaurant-pro-v1';

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  let notificationData = {
    title: 'RestaurantPRO',
    body: 'New update available',
    url: '/dashboard/order-logs'
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: payload.title || 'RestaurantPRO',
        body: payload.body || '',
        url: payload.url || '/dashboard/order-logs',
        orderId: payload.orderId
      };
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
    }
  }

  const options = {
    body: notificationData.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: {
      url: notificationData.url,
      orderId: notificationData.orderId,
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'View Order',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      }
    ],
    tag: `kot-${notificationData.orderId || Date.now()}`,
    renotify: true,
    requireInteraction: true,
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Open the order logs page
  const urlToOpen = event.notification.data?.url || '/dashboard/order-logs';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes('/dashboard') && 'focus' in client) {
          client.postMessage({
            type: 'NAVIGATE',
            url: urlToOpen
          });
          return client.focus();
        }
      }
      // If no window/tab found, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle background sync for offline orders
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    console.log('[SW] Syncing pending orders...');
    event.waitUntil(syncPendingOrders());
  }
});

async function syncPendingOrders() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const pendingOrders = await cache.match('/api/orders/pending');
    
    if (pendingOrders) {
      const orders = await pendingOrders.json();
      for (const order of orders) {
        try {
          const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
          });
          if (response.ok) {
            await cache.delete('/api/orders/pending');
          }
        } catch (err) {
          console.error('[SW] Error syncing order:', err);
        }
      }
    }
  } catch (err) {
    console.error('[SW] Error in syncPendingOrders:', err);
  }
}

// Listen for messages from the client
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});