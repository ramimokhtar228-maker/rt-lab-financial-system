if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(regs) {
    for (var r of regs) { r.unregister(); }
  });
}
if ('caches' in window) {
  caches.keys().then(function(keys) {
    for (var k of keys) { caches.delete(k); }
  });
}
