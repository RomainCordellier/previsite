// Prévisite : fonctionnement hors ligne. Changer CACHE à chaque version (meme numero que VERSION dans index.html).
var CACHE = "previsite-v0.1";
var FICHIERS = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", function (ev) {
  ev.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FICHIERS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (ev) {
  ev.waitUntil(caches.keys().then(function (noms) {
    return Promise.all(noms.filter(function (n) { return n !== CACHE; }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

// Reponse immediate depuis le cache (hors ligne), mise a jour en arriere-plan quand le reseau repond.
self.addEventListener("fetch", function (ev) {
  var rq = ev.request;
  if (rq.method !== "GET" || new URL(rq.url).origin !== self.location.origin) return;
  ev.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(rq, { ignoreSearch: true }).then(function (enCache) {
      var reseau = fetch(rq).then(function (rep) { if (rep && rep.ok) c.put(rq, rep.clone()); return rep; }).catch(function () { return enCache; });
      return enCache || reseau;
    });
  }));
});
