// Situs publik: hanya membaca data/content.json (tidak pernah menyentuh draft localStorage).
(function () {
  var app = document.getElementById('app');
  fetch('data/content.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) {
      R.render(app, d);
      var m = d.meta || {};
      if (m.title) document.title = m.title;
      var el = document.querySelector('meta[name=description]');
      if (el && m.description) el.setAttribute('content', m.description);
    })
    .catch(function () { app.textContent = 'Konten tidak dapat dimuat.'; });
})();
