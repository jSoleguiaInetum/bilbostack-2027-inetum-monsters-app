// Service worker de BilboStack 2027 Monsters App.
// Estrategia: network-first para navegaciones (con fallback al shell cacheado)
// y cache-first para assets estáticos del mismo origen y fuentes de Google Fonts.
// Subir VERSION al cambiar el precache/estrategia para forzar la actualización.

const VERSION = 'v1'
const SHELL_CACHE = `bilbostack-shell-${VERSION}`
const ASSET_CACHE = `bilbostack-assets-${VERSION}`
const FONT_CACHE = `bilbostack-fonts-${VERSION}`
const KNOWN_CACHES = [SHELL_CACHE, ASSET_CACHE, FONT_CACHE]

const SHELL_URLS = ['/', '/manifest.webmanifest', '/offline.html']

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE)
      await cache.addAll(SHELL_URLS)
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys()
      await Promise.all(names.filter((n) => !KNOWN_CACHES.includes(n)).map((n) => caches.delete(n)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Fuentes de Google Fonts: stale-while-revalidate.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(request, FONT_CACHE))
    return
  }

  if (url.origin !== self.location.origin) return

  // Navegaciones SPA: network-first con fallback al shell cacheado.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request)
          const cache = await caches.open(SHELL_CACHE)
          cache.put('/', response.clone())
          return response
        } catch {
          const cached = await caches.match('/')
          return cached || (await caches.match('/offline.html'))
        }
      })(),
    )
    return
  }

  // Assets estáticos del mismo origen: cache-first.
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/monster-assets/') || url.pathname.startsWith('/icons/') || url.pathname === '/favicon.svg') {
    event.respondWith(cacheFirst(request, ASSET_CACHE))
  }
})

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(cacheName)
    cache.put(request, response.clone())
  }
  return response
}

async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request)
  const network = fetch(request)
    .then((response) => {
      if (response.ok || response.type === 'opaque') {
        caches.open(cacheName).then((cache) => cache.put(request, response.clone()))
      }
      return response
    })
    .catch(() => null)
  return cached || (await network) || Response.error()
}
