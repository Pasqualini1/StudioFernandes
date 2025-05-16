const CACHE_NAME = 'agendamento-pwa-v1';
const urlsToCache = [
  '/',
  '/index.html',   // Aponte para a página principal (index.html)
  '/login.css',      // O arquivo CSS do login
  '/login.js',        // O script JS do login
  '/agenda.html',   // Página de agenda (agenda.html)
  '/agenda.css',     // O arquivo CSS da agenda
  '/agenda.js',       // O script JS da agenda
  '/manifest.json',      // O manifest do PWA
  '/icons/logo1.png'  // Ícone para o PWA
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
