// Tiradadi — service worker
// L'app (index.html + icone) vive nella cache del telefono e si apre SEMPRE da lì:
// senza rete, con rete lentissima o con rete buona. La copia di index.html viene
// aggiornata in background a ogni apertura e vale dall'apertura successiva.
// Aumenta VERSION quando cambi icone, manifest o questo file.
const VERSION = 'v3';
const CACHE = 'tiradadi-' + VERSION;
const SCOPE = self.registration.scope; // es. https://mauroperrone.github.io/tiradadi/
const SHELL = new URL('index.html', SCOPE).href;
const ASSETS = [
  'index.html',
  'manifest.webmanifest',
  'favicon.png',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png'
].map((p) => new URL(p, SCOPE).href);

// Safari rifiuta di mostrare una pagina presa dalla cache se era arrivata dopo un redirect:
// in quel caso salviamo una copia "pulita" della risposta.
async function clean(res) {
  if (!res.redirected) return res;
  const body = await res.blob();
  return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
}

// Scarica saltando la cache HTTP del browser e salva solo risposte complete e valide.
async function fetchAndStore(cache, url) {
  const res = await fetch(new Request(url, { cache: 'reload' }));
  if (!res.ok) throw new Error(url + ' -> HTTP ' + res.status);
  await cache.put(url, await clean(res));
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(ASSETS.map((url) => fetchAndStore(cache, url)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('tiradadi-') && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

const OFFLINE_PAGE =
  '<!DOCTYPE html><html lang="it"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width, initial-scale=1"><title>Tiradadi</title></head>' +
  '<body style="margin:0;padding:32px 20px;background:#0d241e;color:#f0e8d5;font:17px/1.5 system-ui,sans-serif">' +
  '<h1 style="font-size:22px;color:#d4ab52">Tiradadi non è ancora salvato offline</h1>' +
  '<p>Aprilo una volta con una connessione buona (meglio Wi-Fi) e aspetta che in alto compaia «pronto offline».</p>' +
  '</body></html>';

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith(SCOPE)) return;

  if (req.mode === 'navigate') {
    // Ogni apertura dell'app riceve subito la copia salvata, senza aspettare la rete.
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(SHELL);
      if (cached) return cached;
      try {
        return await fetch(req);
      } catch (e) {
        return new Response(OFFLINE_PAGE, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    })());
    // Aggiornamento in background, registrato subito (Safari non accetta waitUntil chiamato più tardi).
    event.waitUntil(caches.open(CACHE).then((cache) => fetchAndStore(cache, SHELL)).catch(() => {}));
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    return cached || fetch(req);
  })());
});
