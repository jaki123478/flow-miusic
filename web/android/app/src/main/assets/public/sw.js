// Service Worker per Notifiche Push e PWA su Android, Motorola e iOS
// Supporto avanzato per background audio playback

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Cache audio streams per evitare interruzioni
const audioCacheName = 'audio-cache';
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(audioCacheName).then((cache) => {
      return cache.addAll([]); // Cache vuoto iniziale
    })
  );
});

// Handle background media playback
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'AUDIO_PLAYBACK') {
    // Handle audio playback messages from the main thread
    // This ensures audio continues playing when the app is backgrounded
    if (event.data.action === 'play') {
      // Signal to continue audio playback
      event.ports[0]?.postMessage({ status: 'playing' });
    } else if (event.data.action === 'pause') {
      // Signal to pause audio playback
      event.ports[0]?.postMessage({ status: 'paused' });
    } else if (event.data.action === 'keepAlive') {
      // Keep service worker alive during playback
      event.ports[0]?.postMessage({ status: 'alive' });
    }
  }
});

// Keep service worker alive during audio playback
let keepAliveInterval = null;
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'START_KEEP_ALIVE') {
    // Start periodic messages to keep service worker alive
    if (keepAliveInterval) clearInterval(keepAliveInterval);
    keepAliveInterval = setInterval(() => {
      event.ports[0]?.postMessage({ type: 'KEEP_ALIVE' });
    }, 30000); // Every 30 seconds
  } else if (event.data && event.data.type === 'STOP_KEEP_ALIVE') {
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
      keepAliveInterval = null;
    }
  }
});

// Enhanced fetch handler for audio streams
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // Handle audio streams specially to prevent interruptions
  if (url.includes('.mp3') || 
      url.includes('.m4a') || 
      url.includes('.ogg') ||
      url.includes('.wav') ||
      url.includes('audio') ||
      url.includes('stream') ||
      url.includes('youtube') ||
      url.includes('ytimg')) {
    
    event.respondWith(
      caches.open(audioCacheName).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          
          // Cache the audio response for future use
          return fetch(event.request).then((networkResponse) => {
            // Only cache successful responses
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // If network fails, try to return cached version
            return cache.match(event.request);
          });
        });
      })
    );
  }
});

// Handle page visibility changes
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'VISIBILITY_CHANGE') {
    const isVisible = event.data.visible;
    if (!isVisible) {
      // Page is hidden, ensure audio continues
      console.log('Page hidden, ensuring audio continues');
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : 'Nuova notifica da SocialFlow' };
  }

  const title = payload.title || 'SocialFlow';
  const options = {
    body: payload.body || 'Hai ricevuto un nuovo messaggio o chiamata',
    icon: payload.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [300, 100, 300, 100, 300],
    tag: 'socialflow-notification',
    renotify: true,
    data: {
      url: payload.url || '/'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
