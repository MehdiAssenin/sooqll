const CACHE_NAME = "lelegance-v1";
const urlsToCache = [
  "/",
  "/images/hero-bottle.jpg",
  "/images/hero-bag.jpg",
  "/images/category-women.jpg",
  "/images/category-men.jpg",
  "/images/category-bags.jpg",
  "/images/category-gifts.jpg",
  "/images/product-1.jpg",
  "/images/product-2.jpg",
  "/images/product-3.jpg",
  "/images/product-4.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request);
    })
  );
});
