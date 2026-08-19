const CACHE_NAME = "pocket-portfolio-spaces-v21";
const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "editions.js",
  "app.js",
  "images/qrcode.png",
  "images/brown-bear-tree-finished-wide-doorway-blurred.jpg",
  "images/brown-bear-tree-finished-with-scale.jpg",
  "images/faux-tree-base-detail-process.jpg",
  "images/dayspring-anniversary-interactive-materials.jpg",
  "images/dayspring-event-self-running-kiosk.jpg",
  "images/dayspring-anniversary-projection-viewer.jpg",
  "images/dayspring-anniversary-branded-collateral.jpg",
  "images/dayspring-event-stickers.jpg",
  "images/modular-backdrop-wedding-couple-blurred.jpg",
  "images/modular-backdrop-concept-render.jpg",
  "images/cals-corner-visitors-wide.jpg",
  "images/IMG_1396.jpg",
  "images/cals-corner-inside.jpg",
  "images/cals-corner-curved-stair-detail.jpg",
  "images/cals-corner-reading-nook-in-use.jpg",
  "images/cals-corner-height-access-sign.png",
  "images/cals-corner-do-not-touch-sign.png",
  "images/custom-cnc.jpg",
  "images/climate-progress-finished-event-display.jpg",
  "images/climate-progress-cnc-logo-process.jpg",
  "images/concept-streetcar-touchscreen.jpg",
  "images/concept-pet-care-touchscreen.jpg",
  "images/concept-coffee-touchscreen.jpg",
  "images/concept-rock-climbing-touchscreen.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
