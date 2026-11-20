(function () {
  var app = document.getElementById('app');
  fetch('data/content.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) {
      var st = d.story || {};
      if (st.visible !== true) { app.textContent = 'Halaman ini belum tersedia.'; return; }
      R.renderStory(app, d);
      document.title = (st.heading || 'Siapa saya') + ' · ' + ((d.profile || {}).name || '');
    })
    .catch(function () { app.textContent = 'Konten tidak dapat dimuat.'; });
})();
