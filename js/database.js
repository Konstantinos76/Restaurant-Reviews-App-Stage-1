// import idb from 'idb';

var dbPromise = idb.open('myIdb', 1, function(upgradeDb) {
    var dbStore = upgradeDb.createObjectStore('dbStore');
    dbStore.put('myValue0', 'myKey0');
});

// dbPromise.then(function(db) {
//     var tx = db.transaction('dbStoreKey', 'readwrite');
//     var dbStore = tx.objectStore('dbStoreKey');
//     dbStore.put('bar', 'foo');
//     return tx.complete;
//     }).then(function() {
//     console.log('Success writing to idb');
// });