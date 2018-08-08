/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants/`;
  }

  static get DATABASE_REVIEWS_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/reviews/?limit=1000`;
  }

  /**
   * Opens Idb
   */
  static openIdb() {
    var dbPromise = idb.open('myIdb', 10, function(upgradeDb) {
      switch(upgradeDb.oldVersion) {
        case 0:
          var dbStore = upgradeDb.createObjectStore('dbStore', {keyPath: 'id'});
        case 1:
          upgradeDb.createObjectStore('reviewsStore', {keyPath: 'id'});
        case 2:
          var reviewsStore = upgradeDb.transaction.objectStore('reviewsStore');
          reviewsStore.createIndex('restaurantId', 'restaurant_id');
      }
    });
    return dbPromise;
  }

  /**
   * Static method. Writes restaurants to database.
   */
  static createDbAndWriteRestaurants() {
    if(navigator.onLine) {
    fetch(DBHelper.DATABASE_URL)
    .then(response => response.json())
    .then(data => writeToDb(data));

    function writeToDb(data) {
      DBHelper.openIdb().then(function(db){
        if (!db) return;
        var tx = db.transaction('dbStore', 'readwrite');
        var dbStore = tx.objectStore('dbStore');
        data.forEach(record => dbStore.put(record));
        return tx.complete;
      }).then(function() {
        console.log('Success Writting Restaurants to Database!');
      });
    }}
  }

  /**
   * Static method. Writes reviews to database.
   */
  static writeReviewsToIdb() {
    if(navigator.onLine) {
    fetch(DBHelper.DATABASE_REVIEWS_URL)
    .then(response => response.json())
    .then(data => writeToDb(data));

    function writeToDb(data) {
      DBHelper.openIdb().then(function(db){
        if (!db) return;
        var tx = db.transaction('reviewsStore', 'readwrite');
        var reviewsStore = tx.objectStore('reviewsStore');
        var restaurantIndex = reviewsStore.index('restaurantId');
        data.forEach(record => reviewsStore.put(record));
        return tx.complete;
      }).then(function() {
        console.log('Success Writting Reviews to Database!');
      });
    }}
  }

  /**
   * Fetch all restaurants.
   * If offline, from idb.
   * If online, from server.
   */
  static fetchRestaurants(callback) {
    if(!navigator.onLine) {
      DBHelper.openIdb().then(function(db){
        if(!db) return;
        var tx = db.transaction('dbStore');
        var dbStore = tx.objectStore('dbStore');

        return dbStore.getAll();
      }).then(function(idbdata){
        callback(null, idbdata);
        console.log('Data fetched from idb');
      })
    } else {
    fetch(DBHelper.DATABASE_URL)
      .then(response => response.json())
      .then(restaurants => {callback(null, restaurants); 
        console.log('Data fetched from server');
      })
      .catch('Request failed', null);
    }
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}

/**
 * static createDbAndWriteRestaurants method is called
 */
DBHelper.createDbAndWriteRestaurants();

/**
 * static writeReviewsToIdb method is called
 */
DBHelper.writeReviewsToIdb();

