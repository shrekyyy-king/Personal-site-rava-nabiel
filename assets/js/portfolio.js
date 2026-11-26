// Halaman Portofolio Akademik: membaca academicPortfolio dari data/content.json.
(function () {
  var app = document.getElementById('app');
  if (!app || !window.R) return;
  fetch('data/content.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) {
      R.renderPortfolio(app, d, false);
      var pf = d.academicPortfolio || {}, p = d.profile || {};
      document.title = (pf.title || 'Portofolio Akademik') + ' · ' + (p.name || '');
      if (window.Music) Music.init(d);
    })
    .catch(function () { app.textContent = 'Portofolio akademik tidak dapat dimuat.'; });
})();
