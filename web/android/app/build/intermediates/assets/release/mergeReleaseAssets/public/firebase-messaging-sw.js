// Firebase Cloud Messaging Service Worker per Notifiche Push Native Background

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Configurazione Ufficiale Firebase SocialFlow
firebase.initializeApp({
  apiKey: "AIzaSyDNzhg-2VpWN3aDaZ7gd8h62BDWz-S-3lc",
  authDomain: "social-flow-f1aca.firebaseapp.com",
  projectId: "social-flow-f1aca",
  storageBucket: "social-flow-f1aca.firebasestorage.app",
  messagingSenderId: "940857178246",
  appId: "1:940857178246:web:fb97b714ee3a7d6407b907",
  measurementId: "G-LFRF9HN16J"
});

const messaging = firebase.messaging();

// Gestione Notifiche in Background a Schermo Spento
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Notifica Ricevuta in Background:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'SocialFlow';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'Nuova notifica da SocialFlow',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [300, 100, 300, 100, 300],
    tag: payload.data?.tag || 'socialflow-fcm-alert',
    renotify: true,
    data: {
      url: payload.data?.url || '/'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
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
