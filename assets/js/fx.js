// Efek situs publik: lapisan tetap (#fxl), bar progres, tombol tema, navigasi aktif, tagline berganti,
// hitung angka, carousel foto bab, lightbox, muncul saat scroll, ripple.
(function (w) {
  var app = document.getElementById('app'); if (!app) return;
  var reduce = !!(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var layer = null;
  // position:fixed di dalam .site menempel ke .site (container-type), bukan layar. Karena itu elemen tetap ditaruh di <body>.
  function sync() {
    if (!layer) return;
    ['mode', 'pal', 'motion', 'shape', 'progress'].forEach(function (k) { if (app.dataset[k] != null) layer.dataset[k] = app.dataset[k]; });
    ['--accent', '--on', '--r', '--ff', '--fh'].forEach(function (k) { layer.style.setProperty(k, app.style.getPropertyValue(k)); });
  }
  function mount() {
    if (!layer) { layer = document.createElement('div'); layer.id = 'fxl'; layer.className = 'fxl'; document.body.appendChild(layer); }
    sync(); return layer;
  }
  w.FX = { layer: mount, sync: sync };
  var anim = function () { return app.dataset.motion !== 'off' && !reduce; };

  // --- bar progres scroll
  function prog() {
    var i = layer && layer.querySelector('.pb i'); if (!i) return;
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight, y = w.pageYOffset || h.scrollTop;
    i.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, Math.max(0, y / max)) : 0) + ')';
  }
  var tk = false;
  function onScroll() { if (tk) return; tk = true; requestAnimationFrame(function () { tk = false; prog(); }); }
  w.addEventListener('scroll', onScroll, { passive: true }); w.addEventListener('resize', onScroll);

  // --- tombol tema pengunjung
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.mt'); if (!t || !app.contains(t)) return;
    var next = app.dataset.mode === 'dark' ? 'light' : 'dark';
    app.dataset.mode = next; t.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false'); sync();
    try { w.localStorage.setItem('site.mode', next); } catch (x) {}
  });

  // --- carousel foto bab
  function slide(box) {
    var trk = box.querySelector('.trk'), n = trk.children.length, w0 = trk.clientWidth || 1;
    return { trk: trk, n: n, i: Math.max(0, Math.min(n - 1, Math.round(trk.scrollLeft / w0))) };
  }
  function upd(box) {
    var s = slide(box), c = box.querySelector('.cnt'), p = box.querySelector('.pr'), x = box.querySelector('.nx');
    if (c) c.textContent = (s.i + 1) + ' / ' + s.n; if (p) p.disabled = s.i <= 0; if (x) x.disabled = s.i >= s.n - 1;
  }
  // Klik beruntun saat animasi geser masih jalan: hitung dari target terakhir, bukan dari posisi scroll yang sedang bergerak.
  function go(box, d) {
    var s = slide(box), cur = box._tg != null ? box._tg : s.i, n = Math.max(0, Math.min(s.n - 1, cur + d));
    box._tg = n; clearTimeout(box._tt); box._tt = setTimeout(function () { box._tg = null; }, 900);
    s.trk.scrollTo({ left: n * s.trk.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.pics .pr, .pics .nx'); if (!b) return;
    go(b.closest('.pics'), b.classList.contains('nx') ? 1 : -1);
  });
  document.addEventListener('keydown', function (e) {
    var box = e.target.closest && e.target.closest('.pics.multi'); if (!box || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    e.preventDefault(); go(box, e.key === 'ArrowRight' ? 1 : -1);
  });
  document.addEventListener('scroll', function (e) { var t = e.target; if (t && t.classList && t.classList.contains('trk')) upd(t.closest('.pics')); }, true);

  // --- lightbox
  document.addEventListener('click', function (e) {
    var im = e.target.closest && e.target.closest('.gal img, .pics img'); if (!im) return;
    var o = document.createElement('div'); o.className = 'lb'; o.innerHTML = '<img alt="">'; o.firstChild.src = im.currentSrc || im.src;
    function close() { o.remove(); document.removeEventListener('keydown', k); }
    function k(ev) { if (ev.key === 'Escape') close(); }
    o.addEventListener('click', close); document.addEventListener('keydown', k); document.body.appendChild(o);
  });

  // --- tagline berganti
  function rotate() {
    if (!anim()) return;
    app.querySelectorAll('.tag.rot').forEach(function (el) {
      if (el._t) return; var s = el.querySelectorAll('span'), i = 0; if (s.length < 2) return;
      el._t = setInterval(function () { s[i].classList.remove('on'); i = (i + 1) % s.length; s[i].classList.add('on'); }, 3600);
    });
  }

  // --- hitung angka
  function count(el) {
    var to = parseFloat(el.dataset.to); if (isNaN(to)) return;
    var dec = +el.dataset.d || 0, p = el.dataset.p || '', s = el.dataset.s || '', sep = el.dataset.c || '.', t0 = null, dur = 1200;
    function f(t) {
      if (t0 === null) t0 = t; var k = Math.min(1, (t - t0) / dur), v = to * (1 - Math.pow(1 - k, 3)), x = v.toFixed(dec);
      el.textContent = k < 1 ? p + (sep === ',' ? x.replace('.', ',') : x) + s : el.dataset.f;
      if (k < 1) requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }

  // --- navigasi aktif
  function spy() {
    var as = [].slice.call(app.querySelectorAll('.nb-links a[href^="#"]')); if (!as.length || !('IntersectionObserver' in w)) return;
    var box = as[0].parentNode, io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        as.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + e.target.id; a.classList.toggle('on', on);
          if (on) box.scrollTo({ left: a.offsetLeft - box.clientWidth / 2 + a.offsetWidth / 2, behavior: 'auto' });
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    as.forEach(function (a) { var t = document.getElementById(a.getAttribute('href').slice(1)); if (t) io.observe(t); });
  }

  var io = null, io2 = null;
  if ('IntersectionObserver' in w) {
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    io2 = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { count(e.target); io2.unobserve(e.target); } }); }, { threshold: 0.4 });
  }
  function scan() {
    mount();
    var pb = layer.querySelector('.pb');
    if (app.dataset.progress === 'off') { if (pb) pb.remove(); }
    else if (!pb) layer.insertAdjacentHTML('afterbegin', '<div class="pb" aria-hidden="true"><i></i></div>');
    prog(); app.querySelectorAll('.pics.multi').forEach(upd);
    var on = anim(); document.documentElement.classList.toggle('fx', on && !!io);
    if (on && io) { app.querySelectorAll('.rv:not(.in)').forEach(function (el) { io.observe(el); }); app.querySelectorAll('.sv[data-to]').forEach(function (el) { io2.observe(el); }); }
    rotate(); spy();
  }
  new MutationObserver(scan).observe(app, { childList: true });
  if (app.children.length) scan();

  document.addEventListener('pointerdown', function (e) {
    if (!anim()) return;
    var b = e.target.closest && e.target.closest('.btn,.cta,.chip,.proj'); if (!b) return;
    var r = b.getBoundingClientRect(), m = Math.max(r.width, r.height) * 2, s = document.createElement('span');
    s.className = 'rip'; s.style.cssText = 'width:' + m + 'px;height:' + m + 'px;left:' + (e.clientX - r.left - m / 2) + 'px;top:' + (e.clientY - r.top - m / 2) + 'px';
    b.appendChild(s); setTimeout(function () { s.remove(); }, 700);
  });
})(window);
