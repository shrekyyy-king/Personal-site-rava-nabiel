// Halaman Portofolio Akademik interaktif: filter kategori, pencarian, mode kartu/linimasa, dan modal detail bukti.
(function () {
  var app = document.getElementById('app');
  if (!app || !window.R) return;

  Promise.all([
    fetch('data/content.json', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }),
    fetch('data/portfolio.json', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
  ]).then(function (res) {
    var d = res[0] || {}, pf = res[1] || {};
    var p = d.profile || {}, a = d.appearance || {};
    var dark = R.theme(app, a, false);
    var esc = R.esc, img = R.img, url = R.url;
    var items = Array.isArray(pf.items) ? pf.items : [];
    var cats = Array.isArray(pf.categories) ? pf.categories : [{ id: 'all', label: 'Semua' }];

    document.title = (pf.title || 'Portofolio Akademik') + ' · ' + (p.name || '');

    var navLinks = [
      ['Beranda', './'],
      ['Portofolio', '#pf-grid']
    ];
    if (d.story && d.story.visible === true) navLinks.push([d.story.buttonLabel || 'Siapa saya', 'whoami.html']);

    var evCount = items.reduce(function (acc, it) { return acc + ((it.evidence && it.evidence.length) || 0); }, 0);

    var headerHtml =
      '<div class="wrap story stop pf-head">' +
      '<a class="back" href="./">← Beranda</a>' +
      '<header class="sh">' +
      '<small>' + esc(p.name || '') + (p.title ? ' · ' + esc(p.title) : '') + '</small>' +
      '<h1>' + esc(pf.title || 'Portofolio Akademik') + '</h1>' +
      (pf.subtitle ? '<p class="lead">' + esc(pf.subtitle) + '</p>' : '') +
      '<div class="pf-stats">' +
      '<span><b>' + items.length + '</b> Karya &amp; Pengalaman</span>' +
      '<span><b>' + Math.max(0, cats.length - 1) + '</b> Kategori</span>' +
      '<span><b>' + evCount + '</b> Bukti Terlampir</span>' +
      '</div>' +
      '</header>' +
      '</div>';

    var controlsHtml =
      '<section class="wrap pf-wrap">' +
      '<div class="pf-bar" role="region" aria-label="Filter portofolio">' +
      '<div class="pf-tabs" role="tablist">' +
      cats.map(function (c, idx) {
        var cnt = c.id === 'all' ? items.length : items.filter(function (x) { return x.category === c.id; }).length;
        return '<button type="button" class="pf-tab' + (idx === 0 ? ' on' : '') + '" data-cat="' + esc(c.id) + '" aria-pressed="' + (idx === 0 ? 'true' : 'false') + '">' +
          esc(c.label) + ' <em>' + cnt + '</em></button>';
      }).join('') +
      '</div>' +
      '<div class="pf-tools">' +
      '<input type="search" id="pf-q" class="pf-q" placeholder="Cari topik, peran, atau tag..." aria-label="Cari portofolio">' +
      '<div class="pf-views" role="group" aria-label="Mode tampilan">' +
      '<button type="button" class="pf-v on" data-view="grid" aria-pressed="true">Kartu</button>' +
      '<button type="button" class="pf-v" data-view="timeline" aria-pressed="false">Linimasa</button>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div id="pf-grid" class="pf-list"></div>' +
      '<footer>' + esc(d.footer || '') + '</footer>' +
      '</section>';

    app.innerHTML = R.nav(d, navLinks, false, dark) + headerHtml + controlsHtml;

    var state = { cat: 'all', view: 'grid', q: '' };
    var gridEl = document.getElementById('pf-grid');
    var modal = null;

    function filterItems() {
      var q = state.q.trim().toLowerCase();
      return items.filter(function (it) {
        if (state.cat !== 'all' && it.category !== state.cat) return false;
        if (!q) return true;
        var hay = [it.title, it.role, it.summary, it.categoryLabel, it.period].concat(it.tags || []).concat(it.details || []).join(' ').toLowerCase();
        return hay.indexOf(q) !== -1;
      });
    }

    function renderList() {
      var list = filterItems();
      if (!list.length) {
        gridEl.className = 'pf-list';
        gridEl.innerHTML = '<div class="pf-empty">Tidak ada item portofolio yang cocok dengan filter saat ini.</div>';
        return;
      }

      if (state.view === 'timeline') {
        gridEl.className = 'pf-list tl';
        gridEl.innerHTML = list.map(function (it, i) {
          var evN = (it.evidence && it.evidence.length) || 0;
          return '<li class="tl-i rv in" style="--i:' + Math.min(i, 6) + '">' +
            '<span class="tl-p">' + esc(it.period) + ' · ' + esc(it.categoryLabel || '') + '</span>' +
            '<button type="button" class="pf-tl-btn" data-id="' + esc(it.id) + '">' +
            '<b>' + esc(it.title) + '</b>' +
            (it.role ? '<small>' + esc(it.role) + '</small>' : '') +
            '<p>' + esc(it.summary) + '</p>' +
            '<span class="pf-more">' + (evN ? evN + ' bukti terlampir · ' : '') + 'Lihat detail →</span>' +
            '</button>' +
            '</li>';
        }).join('');
        return;
      }

      gridEl.className = 'pf-list pf-grid';
      gridEl.innerHTML = list.map(function (it) {
        var ev = it.evidence || [];
        var thumb = ev.find(function (e) { return e && e.type === 'image' && img(e.src); });
        return '<button type="button" class="pf-card" data-id="' + esc(it.id) + '">' +
          (thumb ? '<div class="pf-thumb"><img src="' + esc(img(thumb.src)) + '" alt="" loading="lazy"></div>' : '') +
          '<div class="pf-cb">' +
          '<div class="pf-meta"><span class="pf-cat">' + esc(it.categoryLabel || '') + '</span><span class="pf-per">' + esc(it.period || '') + '</span></div>' +
          '<h3>' + esc(it.title) + '</h3>' +
          (it.role ? '<small class="pf-role">' + esc(it.role) + '</small>' : '') +
          '<p>' + esc(it.summary) + '</p>' +
          ((it.tags && it.tags.length) ? '<div class="pf-tags">' + it.tags.slice(0, 4).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
          '<div class="pf-foot"><span>' + (ev.length ? '📎 ' + ev.length + ' Bukti' : '📂 Siap diisi bukti') + '</span><em>Detail ↗</em></div>' +
          '</div>' +
          '</button>';
      }).join('');
    }

    function closeModal() {
      if (!modal) return;
      modal.remove();
      modal = null;
      document.removeEventListener('keydown', onEsc);
    }
    function onEsc(e) { if (e.key === 'Escape') closeModal(); }

    function openModal(id) {
      var it = items.find(function (x) { return x.id === id; });
      if (!it) return;
      closeModal();
      var ev = it.evidence || [];
      var evHtml = ev.length ? ev.map(function (e) {
        if (e.type === 'image' && img(e.src)) {
          return '<figure class="pf-ev-img"><img src="' + esc(img(e.src)) + '" alt="' + esc(e.label || it.title) + '">' + (e.label ? '<figcaption>' + esc(e.label) + '</figcaption>' : '') + '</figure>';
        }
        if (e.url) {
          return '<a class="btn" href="' + esc(url(e.url)) + '" target="_blank" rel="noopener noreferrer"><span class="ic" aria-hidden="true">' + R.ICONS.doc + '</span><span class="tx"><b>' + esc(e.label || 'Lihat Bukti') + '</b>' + (e.note ? '<small>' + esc(e.note) + '</small>' : '') + '</span></a>';
        }
        return '';
      }).join('') : '<p class="pf-ev-empty">Belum ada bukti atau lampiran pada item ini. Anda dapat menambahkan tautan dokumen, sertifikat, atau foto di <code>data/portfolio.json</code>.</p>';

      modal = document.createElement('div');
      modal.className = 'pf-mod';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', it.title);
      modal.innerHTML =
        '<div class="pf-mod-box">' +
        '<button type="button" class="pf-mod-x" aria-label="Tutup detail">✕</button>' +
        '<div class="pf-meta"><span class="pf-cat">' + esc(it.categoryLabel || '') + '</span><span class="pf-per">' + esc(it.period || '') + '</span></div>' +
        '<h2>' + esc(it.title) + '</h2>' +
        (it.role ? '<p class="pf-role">' + esc(it.role) + '</p>' : '') +
        '<p class="pf-sum">' + esc(it.summary) + '</p>' +
        ((it.details && it.details.length) ? '<ul class="pf-det">' + it.details.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
        ((it.tags && it.tags.length) ? '<div class="pf-tags">' + it.tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
        '<div class="pf-ev"><h3>Bukti &amp; Dokumentasi</h3>' + evHtml + '</div>' +
        '</div>';

      modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target.closest('.pf-mod-x')) closeModal();
      });
      document.addEventListener('keydown', onEsc);
      document.body.appendChild(modal);
      modal.querySelector('.pf-mod-x').focus();
    }

    app.addEventListener('click', function (e) {
      var tab = e.target.closest('.pf-tab');
      if (tab) {
        state.cat = tab.dataset.cat;
        app.querySelectorAll('.pf-tab').forEach(function (b) {
          var on = b === tab;
          b.classList.toggle('on', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        renderList();
        return;
      }
      var vw = e.target.closest('.pf-v');
      if (vw) {
        state.view = vw.dataset.view;
        app.querySelectorAll('.pf-v').forEach(function (b) {
          var on = b === vw;
          b.classList.toggle('on', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        renderList();
        return;
      }
      var card = e.target.closest('.pf-card, .pf-tl-btn');
      if (card) openModal(card.dataset.id);
    });

    var qInput = document.getElementById('pf-q');
    if (qInput) qInput.addEventListener('input', function () { state.q = qInput.value; renderList(); });

    renderList();
    if (window.Music) Music.init(d);
  }).catch(function () {
    app.textContent = 'Portofolio akademik tidak dapat dimuat.';
  });
})();
