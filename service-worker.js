self.importScripts('./js/idb.js');
self.importScripts('./js/dbhelper.js');

self.addEventListener('install', function(event) {
    var urlsToCache = [
        '/',
        '/index.html',
        '/restaurant.html',
        'css/styles.css',
        'js/dbhelper.js',
        'js/idb.js',
        'js/index.js',
        'js/main.js',
        'js/restaurant_info.js',
        'js/reviews.js',
        'js/showmap.js',
        'img/1.webp',
        'img/2.webp',
        'img/3.webp',
        'img/4.webp',
        'img/5.webp',
        'img/6.webp',
        'img/7.webp',
        'img/8.webp',
        'img/9.webp',
        'img/10.webp',
        'img/1.jpg',
        'img/2.jpg',
        'img/3.jpg',
        'img/4.jpg',
        'img/5.jpg',
        'img/6.jpg',
        'img/7.jpg',
        'img/8.jpg',
        'img/9.jpg',
        'img/10.jpg'
    ]
    event.waitUntil(
        caches.open('cache-v8').then(function(cache) {
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

self.addEventListener('sync', function(event) {
    if (event.tag == 'myFirstSync') {
      event.waitUntil(syncIdbWithServer());
    }
});

function syncIdbWithServer() {
    DBHelper.openIdb().then(function(db) {
        if(!db) return;
        var tx = db.transaction('reviewsStore');
        var reviewsStore = tx.objectStore('reviewsStore');

        return reviewsStore.getAll();
    }).then(function(idbdata) {
        // writeBackToServer(idbdata);
        updateRecord(idbdata);
    });

    function updateRecord(data) {
        DBHelper.openIdb().then(function(db){
            if(!db) return;
            var tx = db.transaction('reviewsStore', 'readwrite');
            var reviewsStore = tx.objectStore('reviewsStore');
            data.forEach(record => {
                if(record.addedOffline === true && navigator.onLine) {
                    record.addedOffline = false;
                    reviewsStore.put(record);
                    writeBackToServer(record);
                    return tx.complete;
                }
            })
        }).then(function() {
            console.log('Item(s) updated!');
        });

    function writeBackToServer(record) {
        fetch('http://localhost:1337/reviews/', {
                method: 'POST',
                body: JSON.stringify(record),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json())
              .then(function() {
                console.log('Successfully synchronized review(s)');
                })
        };
    }
}