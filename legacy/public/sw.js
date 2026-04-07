const CACHE_NAME = 'babyhealth-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseClone = response.clone()

        // Cache the response
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone)
        })

        return response
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request).then((response) => {
          return response || new Response('Offline - Resource not found', { status: 404 })
        })
      })
  )
})
