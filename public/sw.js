const CACHE_NAME = 'ims-pwa-cache-v2';
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// Install: pre-cache essential static assets (with graceful failure)
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.allSettled(
                STATIC_ASSETS.map(url =>
                    cache.add(url).catch(err => {
                        console.warn(`SW: Failed to cache ${url}`, err);
                    })
                )
            );
        })
    );
    // Activate immediately without waiting for existing tabs to close
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );
    // Take control of all open pages immediately
    self.clients.claim();
});

// Fetch strategy
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip Supabase API calls and WebSocket connections — always go to network
    if (url.hostname.includes('supabase.co') || url.protocol === 'wss:') return;

    // For navigation requests (HTML pages): network-first with offline fallback
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Cache the latest version of the page
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    return response;
                })
                .catch(() => {
                    return caches.match(request).then(cached => {
                        return cached || caches.match('/');
                    });
                })
        );
        return;
    }

    // For static assets (JS, CSS, images, fonts): cache-first
    if (
        url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?|ttf|eot)$/) ||
        url.pathname.startsWith('/assets/')
    ) {
        event.respondWith(
            caches.match(request).then(cached => {
                if (cached) return cached;

                return fetch(request).then(response => {
                    // Only cache successful responses
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    }
                    return response;
                }).catch(() => {
                    // Return nothing if both cache and network fail
                    return new Response('', { status: 503, statusText: 'Offline' });
                });
            })
        );
        return;
    }

    // For everything else: network-first
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    );
});

// ── Web Push: show notification when server sends a push event ────────────────
self.addEventListener('push', event => {
    let data = { title: 'IMS Alert', body: 'You have a new notification.', icon: '/icon-192.png' };
    try { if (event.data) data = { ...data, ...event.data.json() }; } catch {}

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body:  data.body,
            icon:  data.icon || '/icon-192.png',
            badge: '/icon-192.png',
            tag:   'ims-notification',
            renotify: true,
            data:  { url: data.url || '/' },
        })
    );
});

// ── Open app when notification is clicked ─────────────────────────────────────
self.addEventListener('notificationclick', event => {
    event.notification.close();
    const target = event.notification.data?.url || '/';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
            const existing = clients.find(c => c.url.includes(self.location.origin));
            if (existing) { existing.focus(); existing.navigate(target); }
            else self.clients.openWindow(target);
        })
    );
});
