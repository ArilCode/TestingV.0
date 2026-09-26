const CACHE_NAME = 'arilchat-v3.0.1';
const ASSETS = [
  './',
  './index.html',
  './site.manifest',
  './images/apple-touch-icon.png',
  './images/favicon-96x96.png',
  './images/favicon.ico',
  './images/favicon.svg',
  './images/web-app-manifest-192x192.png',
  './images/web-app-manifest-512x512.png',
  // CDN WAJIB DI CACHE
  'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;700&display=swap',
  'https://unpkg.com/peerjs@1.5.3/dist/peerjs.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'
];

// Install - cache semua
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching all');
      return cache.addAll(ASSETS.map(url => new Request(url, {mode: 'no-cors'}))).catch(()=>{
        // fallback kalau ada yang gagal, cache satu-satu
        return Promise.allSettled(ASSETS.map(url => cache.add(url).catch(()=>{})));
      });
    })
  );
});

// Activate - hapus cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(()=> self.clients.claim())
  );
});

// Fetch - ambil dari cache dulu, kalau gak ada baru online
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        // simpan font / request baru ke cache juga
        if (event.request.url.includes('fonts.gstatic.com') || event.request.url.includes('googleapis')) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return res;
      }).catch(() => {
        // kalau offline dan file gak ada di cache, balikin index.html biar app tetap kebuka
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});