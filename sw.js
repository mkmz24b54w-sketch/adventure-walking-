
const SCOPE = new URL('./', self.location.href).href;
// Scope the cache name so two notebooks on one github.io origin do not delete each other.
const PREFIX = 'exploration-notebook-' + encodeURIComponent(new URL(SCOPE).pathname) + '-';
const CACHE = PREFIX + '71b652483bb8349c';
const ASSETS = ["./.nojekyll","./DATA-LICENSE.txt","./assets/index-C8XqAQ9p.js","./assets/index-DbQgBQOX.css","./data/game.json","./icons/icon-192.png","./icons/icon-512.png","./icons/notebook.svg","./index.html","./manifest.webmanifest"].map(path => new URL(path, SCOPE).href);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).catch(async error => { await caches.delete(CACHE); throw error; }));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE') self.skipWaiting();
  if (event.data?.type === 'STATUS') event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const complete = (await Promise.all(ASSETS.map(path => cache.match(path)))).every(Boolean);
    event.ports[0]?.postMessage({ ready: complete, version: '71b652483bb8349c' });
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(event.request, { ignoreVary: true });
    if (cached) return cached;
    if (event.request.mode === 'navigate') return (await cache.match(new URL('index.html', SCOPE).href)) || fetch(event.request);
    return fetch(event.request);
  })());
});
