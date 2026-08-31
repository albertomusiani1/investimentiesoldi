/* Service worker minimo: serve a due cose.
   1) è ciò che fa comparire "Installa app" su Chrome per Android
   2) tiene una copia della pagina, così l'app si apre anche senza rete
   Strategia: prima la rete, la copia salvata solo se la rete non risponde,
   così un aggiornamento della dashboard si vede subito. */
const CACHE = 'conti-v5';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch { return; }
  // le chiamate a Yahoo e a GitHub devono sempre passare dalla rete
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match('./')))
  );
});
