// service-worker.js

const STATIC_CACHE_NAME = 'souqmarib-static-v2';
const DYNAMIC_CACHE_NAME = 'souqmarib-dynamic-v2';

const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install Event: Cache the app shell
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Precaching App Shell');
        return cache.addAll(APP_SHELL_ASSETS);
      })
      .catch(error => {
        console.error('[Service Worker] Precaching failed:', error);
      })
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
          console.log('[Service Worker] Removing old cache:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// Fetch Event: Apply caching strategies
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // For same-origin requests to static shell assets, use Cache First.
  if (APP_SHELL_ASSETS.includes(url.pathname)) {
    event.respondWith(caches.match(event.request));
    return;
  }
  
  // For cross-origin assets (CDN, fonts, images) and other dynamic requests
  // use a Stale-While-Revalidate strategy.
  event.respondWith(
    caches.open(DYNAMIC_CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // Fetch from network in the background to update the cache
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // Check for valid response to cache
          if(networkResponse && networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(err => {
            // Network fetch failed, but we might have served a stale response.
            // Or if we didn't have a response, this error will propagate.
            console.warn('[Service Worker] Network request failed:', event.request.url, err);
        });

        // Return cached response immediately if available, otherwise wait for fetch.
        return response || fetchPromise;
      });
    })
  );
});
