const V = 'lyric-lingo-v14';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if(r.method !== 'GET') return;
  const u = new URL(r.url);
  const cdn = /(^|\.)(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.hostname);
  if(u.origin !== location.origin && !cdn) return; // lyrics and translation services always use the network
  e.respondWith(fetch(r).then(res => {
    if(res.ok || res.type === 'opaque'){ const c = res.clone(); caches.open(V).then(x => x.put(r, c)); }
    return res;
  }).catch(() => caches.match(r, {ignoreSearch: true}).then(m => m || caches.match('index.html'))));
});
