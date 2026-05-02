const CACHE_NAME = 'rent-management-v1';
const RUNTIME_CACHE = 'rent-management-runtime';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
];

// Routes to pre-cache (for SPA)
const APP_ROUTES = [
    '/houses',
    '/tenants',
    '/payments',
    '/maintenance',
    '/reports'
];

// Install event - cache static assets and routes
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing - downloading full app...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching static assets');
                // Cache static assets
                const assetCachePromise = cache.addAll(STATIC_ASSETS);

                // Cache app routes by fetching them (which serves index.html in SPA)
                const routeCachePromise = Promise.all(
                    APP_ROUTES.map(route => {
                        const request = new Request(route, { mode: 'no-cors' });
                        return fetch(request).then(response => cache.put(request, response));
                    })
                );

                return Promise.all([assetCachePromise, routeCachePromise]);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
                        })
                        .map((cacheName) => {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => self.clients.claim())
    );

    // Notify all clients that a new version is active
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'SW_UPDATED',
                message: 'Service worker updated and activated'
            });
        });
    });
});

// Fetch event - network first for API, cache first for static assets
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Network-first strategy for API requests
    if (url.pathname.startsWith('/api/')) {
        // Only cache GET requests
        if (request.method === 'GET') {
            event.respondWith(
                fetch(request)
                    .then((response) => {
                        // If valid response, clone and cache
                        if (response && response.status === 200) {
                            const responseToCache = response.clone();
                            caches.open('rent-management-api-v1').then((cache) => {
                                cache.put(request, responseToCache);
                            });
                        }
                        return response;
                    })
                    .catch(() => {
                        // If network fails, try cache
                        return caches.match(request);
                    })
            );
            return;
        }

        // For non-GET requests, just fetch
        event.respondWith(fetch(request));
        return;
    }

    // Cache-first strategy for static assets
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version and update in background
                    updateCache(request);
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(request)
                    .then((response) => {
                        // Don't cache if not a success response
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache static assets
                        if (shouldCache(request)) {
                            caches.open(RUNTIME_CACHE)
                                .then((cache) => {
                                    cache.put(request, responseToCache);
                                });
                        }

                        return response;
                    })
                    .catch(() => {
                        // If offline and no cache, return offline page or fallback
                        if (request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Helper function to update cache in background
function updateCache(request) {
    fetch(request)
        .then((response) => {
            if (response && response.status === 200) {
                caches.open(RUNTIME_CACHE)
                    .then((cache) => {
                        cache.put(request, response);
                    });
            }
        })
        .catch(() => {
            // Silently fail background updates
        });
}

// Helper function to determine if resource should be cached
function shouldCache(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Cache HTML, CSS, JS, images, fonts
    return (
        pathname.endsWith('.html') ||
        pathname.endsWith('.css') ||
        pathname.endsWith('.js') ||
        pathname.endsWith('.png') ||
        pathname.endsWith('.jpg') ||
        pathname.endsWith('.jpeg') ||
        pathname.endsWith('.svg') ||
        pathname.endsWith('.woff') ||
        pathname.endsWith('.woff2') ||
        pathname.endsWith('.ttf') ||
        pathname === '/'
    );
}

// Listen for messages from client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    // Feature: Download entire website data
    if (event.data && event.data.type === 'CACHE_ALL_DATA') {
        console.log('[Service Worker] Caching all API data...');

        const apiEndpoints = [
            '/api/houses/',
            '/api/tenants/',
            '/api/payments/',
            '/api/maintenance/',
            '/api/reports/'
        ];

        event.waitUntil(
            caches.open('rent-management-api-v1').then(cache => {
                return Promise.all(
                    apiEndpoints.map(url => {
                        return fetch(url).then(response => {
                            if (response.status === 200) {
                                return cache.put(url, response);
                            }
                        }).catch(err => console.error('Failed to cache', url, err));
                    })
                ).then(() => {
                    console.log('[Service Worker] All data cached successfully');
                    // Notify clients
                    self.clients.matchAll().then(clients => {
                        clients.forEach(client => client.postMessage({ type: 'DATA_CACHED' }));
                    });
                });
            })
        );
    }
});
