// Service Worker para PWA - Network First Strategy + Web Push
const CACHE_NAME = 'onda-app-v5';
const urlsToCache = [
  '/',
  '/list',
  '/grupos',
  '/empresas',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => name !== CACHE_NAME && caches.delete(name))
        )
      ),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Recebe push: envia mensagem para clients abertos (notificação in-app)
// e exibe notificação do sistema apenas se nenhum client estiver focado
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = { title: 'Igreja Onda', body: '', url: '/', icon: '/android-chrome-192x192.png' };
  try {
    payload = { ...payload, ...event.data.json() };
  } catch {
    payload.body = event.data.text();
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Sempre envia mensagem para os clients (notificação in-app)
      clients.forEach((client) => {
        client.postMessage({ type: 'PUSH_RECEIVED', payload });
      });

      // Mostra notificação do sistema apenas se app não estiver em foco
      const hasFocusedClient = clients.some((c) => c.focused);
      if (!hasFocusedClient) {
        return self.registration.showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/android-chrome-192x192.png',
          badge: '/android-chrome-192x192.png',
          data: { url: payload.url || '/' },
        });
      }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(self.location.origin));
      if (existing) {
        existing.focus();
        existing.navigate(url);
      } else {
        self.clients.openWindow(url);
      }
    })
  );
});
