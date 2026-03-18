// Basic Service Worker to satisfy PWA installability requirements on mobile Chrome.
// It does NOT implement offline caching to avoid data synchronization issues.

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // Become available to all pages
});

// A fetch event listener is required by Chrome to consider the PWA installable.
// We just pass the request through to the network.
self.addEventListener('fetch', (event) => {
  // Pass-through fetch to ensure no caching occurs
  return;
});
