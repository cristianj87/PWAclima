const CACHE_NAME = 'clima-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/icon.png',
  '/manifest.json'
];

// Instalación del SW y almacenamiento en caché
self.addEventListener('install', event => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Archivos cacheados');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación y limpieza de cachés viejas
self.addEventListener('activate', event => {
  console.log('[SW] Activado');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Borrando caché vieja:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Interceptar solicitudes
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Si el recurso está en caché, lo devuelve; si no, hace una solicitud de red
      return response || fetch(event.request);
    }).catch(() => {
      // Fallback para cuando todo falla (sin red ni caché)
      return new Response('<h1>⚠️ Sin conexión y sin caché disponible.</h1>', {
        headers: { 'Content-Type': 'text/html' }
      });
    })
  );
});
