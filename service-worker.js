const CACHE_NAME = "restructure-v6";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.json",
  "./assets/restructure-icon-square.png",
  "./assets/apple-touch-icon.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/app-icon-1024.png",
  "./assets/favicon-32.png",
  "./assets/favicon-512.png",
  "./scripts/ui-helpers.js",
  "./scripts/dom.js",
  "./scripts/config.js",
  "./scripts/i18n.js",
  "./scripts/storage.js",
  "./scripts/state.js",
  "./scripts/agenda.js",
  "./scripts/brain-analysis.js",
  "./scripts/remember.js",
  "./scripts/settings.js",
  "./scripts/help.js",
  "./scripts/events.js",
  "./scripts/pwa.js",
  "./app.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request).catch(() => caches.match("./index.html"))
    )
  );
});

self.addEventListener("push", (event) => {
  const fallback = {
    title: "Restructure",
    body: "Restructure test notification.",
    url: "./index.html"
  };
  let data = fallback;
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { ...fallback, body: event.data.text() || fallback.body };
    }
  }
  const title = data.title || fallback.title;
  const options = {
    body: data.body || fallback.body,
    icon: "./assets/icon-192.png",
    badge: "./assets/icon-192.png",
    data: {
      url: data.url || fallback.url
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "./index.html";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existingClient = clients.find((client) => client.url.includes("index.html") || client.url.endsWith("/"));
      if (existingClient) return existingClient.focus();
      return self.clients.openWindow(targetUrl);
    })
  );
});
