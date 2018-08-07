if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
  }

navigator.serviceWorker.ready.then(function(swRegistration) {
  return swRegistration.sync.register('myFirstSync');
});

  