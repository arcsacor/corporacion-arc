/* ============================================================
   CORPORACION ARC S.A. — notificaciones.js
   Service Worker para notificaciones PWA
   ============================================================ */

const CACHE_NAME = 'arc-admin-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('push', (e) => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || '🔔 Nuevo lead — Corporación ARC S.A.';
  const options = {
    body: data.body || 'Ha llegado un nuevo lead.',
    icon: '/corporacion-arc/assets/images/favicon.png',
    badge: '/corporacion-arc/assets/images/favicon.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/corporacion-arc/admin/dashboard.html' }
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.openWindow(e.notification.data.url)
  );
});
