const CACHE_NAME = "agendamento-pwa-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/login.css",
  "/login.js",
  "/agenda.html",
  "/agenda.css",
  "/agenda.js",
  '/manifest.json',
  "/icons/logo1-512.png",
  "/icons/logo2-192.png"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);  // Adiciona todos os arquivos ao cache
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;  // Retorna do cache se estiver lá
        }
        return fetch(event.request);  // Caso contrário, faz o pedido normal
      })
  );
});
