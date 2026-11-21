/* Tamu — service worker: menyimpan file aplikasi agar bisa dibuka tanpa internet.
 * Strategi network-first: bila online, selalu ambil versi terbaru (maks. 3 detik), lalu simpan ke cache;
 * bila offline atau lambat, pakai cache. Tidak ada data pengguna yang lewat sini.
 */
const CACHE = 'tamu-v1.6.1';
const FILES = [
  './', './index.html', './manifest.webmanifest', './css/style.css',
  './js/util.js', './js/store.js', './js/prayer.js', './js/kemenag.js', './js/cycle.js', './js/fiqh.js', './js/content.js', './js/qa.js', './js/kitab.js', './js/app.js', './data/kitab.js', './data/hijri.js', './data/kota.js',
  './assets/logo.svg', './assets/icon-192.png', './assets/icon-512.png', './assets/icon-maskable-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    const network = fetch(req).then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    });
    try {
      // tunggu jaringan paling lama 3 detik bila ada cache; tanpa cache, tunggu sampai selesai
      return await (cached ? Promise.race([network, new Promise((_, rej) => setTimeout(() => rej(new Error('lambat')), 3000))]) : network);
    } catch (err) {
      network.catch(() => {});
      return cached || (await cache.match('./index.html')) || Response.error();
    }
  })());
});
