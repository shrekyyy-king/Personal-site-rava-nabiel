// Efek di situs publik: lightbox foto, muncul saat scroll, ripple saat tombol ditekan.
(function () {
  var app = document.getElementById('app'); if (!app) return;
  document.addEventListener('click', function (e) {
    var im = e.target.closest && e.target.closest('.gal img'); if (!im) return;
    var o = document.createElement('div'); o.className = 'lb'; o.innerHTML = '<img alt="">'; o.firstChild.src = im.src;
    function close() { o.remove(); document.removeEventListener('keydown', k); }
    function k(ev) { if (ev.key === 'Escape') close(); }
    o.addEventListener('click', close); document.addEventListener('keydown', k); document.body.appendChild(o);
  });
  if (!('IntersectionObserver' in window) || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  function scan() {
    var off = app.dataset.motion === 'off';
    document.documentElement.classList.toggle('fx', !off);
    if (!off) app.querySelectorAll('.rv:not(.in)').forEach(function (el) { io.observe(el); });
  }
  new MutationObserver(scan).observe(app, { childList: true });
  if (app.children.length) scan();
  document.addEventListener('pointerdown', function (e) {
    if (app.dataset.motion === 'off') return;
    var b = e.target.closest('.btn,.cta,.chip,.proj'); if (!b) return;
    var r = b.getBoundingClientRect(), m = Math.max(r.width, r.height) * 2, s = document.createElement('span');
    s.className = 'rip'; s.style.cssText = 'width:' + m + 'px;height:' + m + 'px;left:' + (e.clientX - r.left - m / 2) + 'px;top:' + (e.clientY - r.top - m / 2) + 'px';
    b.appendChild(s); setTimeout(function () { s.remove(); }, 700);
  });
})();
