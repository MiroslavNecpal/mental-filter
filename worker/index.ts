// Custom service worker code bundled by next-pwa and merged into sw.js.
// Handles incoming push notifications and notification click events.

declare const self: ServiceWorkerGlobalScope;

self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  const data = event.data.json() as {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    url?: string;
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon ?? '/icon-192x192.png',
      badge: data.badge ?? '/icon-192x192.png',
      data: { url: data.url ?? '/' },
    })
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const url = (event.notification.data as { url: string }).url ?? '/';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        const existing = clients.find(c => c.url === url && 'focus' in c);
        if (existing) return existing.focus();
        return self.clients.openWindow(url);
      })
  );
});
