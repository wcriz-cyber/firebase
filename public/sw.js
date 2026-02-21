// ════════════════════════════════════════════════════════════════
//  C5X SERVICE WORKER — v3.0 — Push Notifications + Cache PWA
// ════════════════════════════════════════════════════════════════

const CACHE_NAME = 'c5x-cache-v3';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png'
];

const NOTIF_ICON  = '/icon.png';
const NOTIF_BADGE = '/icon.png';
const APP_URL     = self.location.origin;

// ── INSTALL ──────────────────────────────────────────────────────
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_URLS).catch(() => {}); // no falla si algún asset falta
    })
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => clients.claim())
  );
});

// ── FETCH (cache-first con fallback a red) ────────────────────────
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Guardar en caché solo respuestas válidas de nuestra app
        if (
          response.ok &&
          response.type === 'basic' &&
          event.request.url.includes(self.location.origin)
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

// ── MENSAJE DESDE LA PÁGINA → MOSTRAR NOTIFICACIÓN ───────────────
self.addEventListener('message', event => {
  const msg = event.data;
  if (!msg || !msg.type) return;

  if (msg.type === 'SHOW_NOTIFICATION') {
    event.waitUntil(showC5xNotification(msg));
  }

  if (msg.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── PUSH (para Web Push futuro con servidor VAPID) ────────────────
self.addEventListener('push', event => {
  let payload = { title: 'C5X Trading', body: '📊 Alerta de trading', tag: 'c5x-push' };
  if (event.data) {
    try { payload = { ...payload, ...event.data.json() }; } catch(e) {}
  }
  event.waitUntil(showC5xNotification(payload));
});

// ── CLICK EN NOTIFICACIÓN → ABRIR / ENFOCAR APP ──────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || APP_URL;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      // Si la app ya está abierta en alguna pestaña/ventana, enfocarla
      for (const c of list) {
        if (c.url.startsWith(APP_URL) && 'focus' in c) {
          return c.focus();
        }
      }
      // Si no está abierta, abrirla
      return clients.openWindow(targetUrl);
    })
  );
});

// ── CLOSE NOTIFICATION ────────────────────────────────────────────
self.addEventListener('notificationclose', () => {
  // Aquí se podría registrar analítica de dismissals
});

// ── BACKGROUND SYNC ───────────────────────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'c5x-alert-sync') {
    // Reenviar notificaciones pendientes guardadas en IndexedDB si hubiera
    event.waitUntil(flushPendingNotifications());
  }
});

// ── PERIODIC BACKGROUND SYNC (Chrome Android ≥ 80) ───────────────
self.addEventListener('periodicsync', event => {
  if (event.tag === 'c5x-market-check') {
    event.waitUntil(periodicMarketCheck());
  }
});

// ════════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════════

function showC5xNotification(opts) {
  const {
    title        = 'C5X',
    body         = '',
    tag          = 'c5x-generic',
    icon         = NOTIF_ICON,
    badge        = NOTIF_BADGE,
    requireInteraction = false,
    silent       = false,
    data         = {},
    actions      = [],
    vibrate      = [200, 100, 200]
  } = opts;

  return self.registration.showNotification(title, {
    body,
    icon,
    badge,
    tag,
    requireInteraction,
    silent,
    vibrate,
    data: { url: APP_URL, ...data },
    actions: actions.length ? actions : [
      { action: 'open',    title: '📱 Abrir C5X' },
      { action: 'dismiss', title: '✕ Descartar'   }
    ],
    // Android-specific: color del pequeño ícono en la barra de estado
    color: '#3b82f6',
    dir: 'ltr',
    lang: 'es'
  });
}

async function flushPendingNotifications() {
  // Stub — en producción se leería de IndexedDB
  return Promise.resolve();
}

async function periodicMarketCheck() {
  // Stub para Periodic Background Sync futuro
  // Aquí se haría fetch de precios y se mostraría notificación si hay alerta
  return Promise.resolve();
}
