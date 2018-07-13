self.addEventListener('install', function(event) {
    var urlsToCache = [
        '/',
        '/index.html',
        '/restaurant.html',
        'css/styles.css',
        'js/dbhelper.js',
        'js/index.js',
        'js/main.js',
        'js/restaurant_info.js',
        'img/1.webp',
        'img/2.webp',
        'img/3.webp',
        'img/4.webp',
        'img/5.webp',
        'img/6.webp',
        'img/7.webp',
        'img/8.webp',
        'img/9.webp',
        'img/10.webp'
    ]
    event.waitUntil(
        caches.open('cache-v2').then(function(cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response) return response;
            return fetch(event.request);
        })
    );
});