const url = window.location.href;
const urlStringLength = window.location.href.length;
const restaurantId = url.charAt(urlStringLength-1);
const restaurantIdNumber = parseInt(restaurantId);

function fetchReviews() {
  let htmlContent = '';
  const reviewsul = document.querySelector('#reviews-list');

  if (navigator.onLine) {
    fetch(`http://localhost:1337/reviews/?restaurant_id=${restaurantId}`)
        .then(response => response.json())
        .then(showReviews)
        .catch(err => requestError(err));
  }
  else {
      DBHelper.openIdb().then(function(db) {
        if(!db) return;
        var tx = db.transaction('reviewsStore');
        var reviewsStore = tx.objectStore('reviewsStore');
        var restaurantIndex = reviewsStore.index('restaurantId');

        return restaurantIndex.getAll(restaurantIdNumber);
      }).then(function(idbdata) {
        //   console.log(idbdata);
          showReviews(idbdata);
          console.log('Fetched reviews from idb');
      });
  }

  function showReviews(data) {
    if(data && data.length > 1) {
      const reviews = data;
      htmlContent = reviews.map(review => `<li>
      <p>${review.name}</p>
      <p>${review.createdAt}</p>
      <p>Rating: ${review.rating}</p>
      <p>${review.comments}</p>
      </li>`).join('');
    } else {
    htmlContent = '<div>No reviews for this restaurant</div>';
    }
  reviewsul.insertAdjacentHTML('beforeend', htmlContent);
  }

  function requestError(err) {
    console.log(err);
    reviewsul.insertAdjacentHTML('beforeend', '<div>Network: Error fetching reviews.');
  }
}

fetchReviews();

function fetchRestaurantById() {
  if(navigator.onLine) {
    fetch(`http://localhost:1337/restaurants/${restaurantId}`)
      .then(response => response.json())
      .then(isFavorite)
      .catch(err => requestError(err));
  }
    
  function isFavorite(restaurant) {
    const favButton = document.getElementById('favorite-button-badge');
    if(restaurant.is_favorite == "true" || restaurant.is_favorite == true) {
      favButton.style.backgroundColor = 'green';
      favButton.innerHTML = 'Your Favorite &starf;';
      favButton.setAttribute('aria-label', 'You have marked this restaurant as one of your favorites. Tap to unfavorite');
    }
    else {
      favButton.style.backgroundColor = '#333';
      favButton.innerHTML = 'ADD TO MY FAVORITES';
      favButton.setAttribute('aria-label', 'This restaurant is not one of your favorites, yet. Tap to add to your favorites');
    }
  }

  function requestError(err) {
    console.log(err);
  }
}

fetchRestaurantById();

document.getElementById("favorite-button-badge").addEventListener("click", function() {
  let favButtonText = this.innerHTML;
  // This if statement will check wether the button contains the word 'YOUR'
  // part of the phrase 'YOUR FAVORITE'. This means the user has already
  // selected restaurant as favorite. If this is the case, this new click
  // will now unfavorite the restaurant.
  if (favButtonText.match(/your/i)) {
    fetch(`http://localhost:1337/restaurants/${restaurantId}/?is_favorite=false`, {
      method: 'PUT'
    }).then(function(){
      fetchRestaurantById();
      console.log('Successfully removed restaurant from favorites');
    })
  } else {
  fetch(`http://localhost:1337/restaurants/${restaurantId}/?is_favorite=true`, {
    method: 'PUT'
  }).then(function(){
    fetchRestaurantById();
    console.log('Successfully added restaurant to favorites');
    })
  }
});

document.getElementById("addReviewForm").addEventListener("submit", function() {
  let name = document.getElementById('add-review-name-field').value;
  let rating = document.getElementById('add-review-select-field').value;
  let comments = document.getElementById('add-review-textfield').value;

  let d = new Date();

  let data = {
    "id": Math.floor(Math.random() * 1000) + 30,
    "restaurant_id": restaurantIdNumber,
    "name": name,
    "rating": rating,
    "comments": comments,
    "createdAt" : d.toDateString(),
    "addedOffline": false
  };

  if(!navigator.onLine) {
    data.addedOffline = true;
    DBHelper.openIdb().then(function(db) {
      if(!db) return;
      var tx = db.transaction('reviewsStore', 'readwrite');
      var reviewsStore = tx.objectStore('reviewsStore');
      reviewsStore.put(data);
      return tx.complete;
    }).then(function() {
      console.log('Successfully wrote review to idb while offline');
      window.location.href = url;
    })
  } 
  else {
      fetch('http://localhost:1337/reviews/', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json())
        .then(function() {
          window.location.href = url;
    })
  }
});