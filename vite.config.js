import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function normalizeBase(value) {
  if (!value || value === '/') return '/'
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

function pwaBuildPlugin(base) {
  return {
    name: 'lamsa-pwa-build',
    closeBundle() {
      const distDir = path.resolve('dist')
      const manifest = {
        id: base,
        name: 'Lamsa by Farah',
        short_name: 'Lamsa',
        description: 'Votre mariage, votre signature.',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#f7f0e9',
        theme_color: '#f7f0e9',
        orientation: 'portrait-primary',
        icons: [
          { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: `${base}icons/icon-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      }

      fs.writeFileSync(path.join(distDir, 'manifest.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`)

      const urls = new Set([
        `${base}index.html`,
        `${base}manifest.webmanifest`,
        `${base}favicon.svg`,
        `${base}icons/icon-180.png`,
        `${base}icons/icon-192.png`,
        `${base}icons/icon-512.png`,
        `${base}icons/icon-maskable-512.png`,
        `${base}fonts/dm-sans-latin.woff2`,
        `${base}fonts/playfair-display-latin-normal.woff2`,
        `${base}fonts/playfair-display-latin-italic.woff2`,
      ])

      const walk = (directory) => {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
          const absolute = path.join(directory, entry.name)
          if (entry.isDirectory()) walk(absolute)
          else if (/\.(js|css|woff2)$/.test(entry.name)) {
            const relative = path.relative(distDir, absolute).replace(/\\/g, '/')
            urls.add(`${base}${relative}`)
          }
        }
      }
      walk(distDir)

      const cacheName = 'lamsa-v1'
      const precacheJson = JSON.stringify([...urls])
      const serviceWorker = `const CACHE_NAME = '${cacheName}'
const PRECACHE_URLS = ${precacheJson}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('lamsa-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME)
        return (await cache.match('${base}index.html')) || Response.error()
      })
    )
    return
  }

  if (
    url.origin !== self.location.origin ||
    url.hostname.endsWith('.supabase.co')
  ) {
    return
  }

  if (PRECACHE_URLS.includes(url.pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(url.pathname).then((cached) => cached || fetch(request))
      )
    )
  } else {
    event.respondWith(fetch(request))
  }
})
`
      fs.writeFileSync(path.join(distDir, 'service-worker.js'), serviceWorker)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = normalizeBase(env.VITE_BASE_PATH || '/')

  return {
    base,
    plugins: [react(), pwaBuildPlugin(base)],
  }
})
