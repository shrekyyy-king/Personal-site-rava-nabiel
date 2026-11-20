// Efek hidup di situs publik: muncul saat scroll, parallax foto latar, ripple saat tombol ditekan.
(function () {
  var app = document.getElementById('app');
  if (!app || !('IntersectionObserver' in window) || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  document.documentElement.classList.add('fx');
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.12 });
  var P = [], tick = false;
  function upd() {
    tick = false; var h = innerHeight;
    P.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect(); if (r.bottom < 0 || r.top > h) return;
      el.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - h / 2) * -parseFloat(el.dataset.par)).toFixed(1) + 'px,0)';
    });
  }
  function scan() { app.querySelectorAll('.rv:not(.in)').forEach(function (el) { io.observe(el); }); P = [].slice.call(app.querySelectorAll('[data-par]')); upd(); }
  new MutationObserver(scan).observe(app, { childList: true });
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('.btn,.cta,.chip,.proj'); if (!b) return;
    var r = b.getBoundingClientRect(), m = Math.max(r.width, r.height) * 2, s = document.createElement('span');
    s.className = 'rip'; s.style.cssText = 'width:' + m + 'px;height:' + m + 'px;left:' + (e.clientX - r.left - m / 2) + 'px;top:' + (e.clientY - r.top - m / 2) + 'px';
    b.appendChild(s); setTimeout(function () { s.remove(); }, 700);
  });
})();
