const CACHE_NAME = "indian-travel-agency-v2";

const FILES_TO_CACHE = [
  "./",
  "./manifest.json"
];


// INSTALL
self.addEventListener("install", event => {

  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

});


// ACTIVATE
self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys => {

      return Promise.all(

        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))

      );

    })

  );

  self.clients.claim();

});


// FETCH
self.addEventListener("fetch", event => {

  // HTML pages ہمیشہ Network سے تازہ لیں
  if (
    event.request.method === "GET" &&
    event.request.destination === "document"
  ) {

    event.respondWith(

      fetch(event.request)
        .then(response => {

          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, copy);
          });

          return response;

        })
        .catch(() => {

          return caches.match(event.request);

        })

    );

    return;
  }


  // باقی files کے لیے Cache First
  event.respondWith(

    caches.match(event.request).then(cachedResponse => {

      return cachedResponse || fetch(event.request);

    })

  );

});
