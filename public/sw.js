// Service Worker para PWA - Network First Strategy
const CACHE_NAME = 'onda-app-v3';
const urlsToCache = [
  '/',
  '/list',
  '/grupos',
  '/empresas',
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Força ativação imediata
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // Assume controle imediato
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Network-first: tenta rede primeiro, cache como fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Atualiza cache com resposta nova
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se rede falhar, usa cache
        return caches.match(event.request);
      })
  );
});
