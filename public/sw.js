// Minimal service worker — only caches the icon and manifest so the
// install/A2HS UX has something to show offline. Everything else
// (HTML pages, /auth/*, /_next/*, server actions) is left to the network
// so auth state and route handlers never serve a stale response.
const CACHE = 'static-v1'
const ALLOW = ['/icon.svg', '/manifest.webmanifest']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ALLOW)))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      ),
      self.clients.claim(),
    ])
  )
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  if (url.origin !== self.location.origin) return
  if (!ALLOW.includes(url.pathname)) return
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  )
})
