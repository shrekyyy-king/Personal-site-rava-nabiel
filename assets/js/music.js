// Pemutar musik melayang. Sumber dikenali dari URL: .mp3 (repo / https), YouTube, atau Spotify.
// Putar otomatis HANYA setelah interaksi pertama pengunjung (klik, ketuk, atau tombol keyboard), sesuai aturan browser.
(function (w) {
  var KEY = 'site.music';
  function load() { try { return JSON.parse(w.sessionStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(o) { try { w.sessionStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function init(d) {
    var m = d && d.music; if (!m || m.visible !== true || !w.R) return null;
    var info = R.music(m); if (!info) return null;
    var host = (w.FX ? FX.layer() : document.body), esc = R.esc, st = load(), api = { kind: info.kind };
    var title = String(m.title || '').trim() || 'Musik latar';
    var el = document.createElement('div'); el.className = 'mp'; el.dataset.k = info.kind; el.dataset.playing = '0'; el.dataset.open = '0';
    var emb = '', openBtn = '';
    if (info.kind === 'youtube') emb = '<iframe title="Pemutar YouTube" allow="autoplay; encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" src="https://www.youtube-nocookie.com/embed/' + esc(info.id) + '?enablejsapi=1&playsinline=1&loop=1&playlist=' + esc(info.id) + '&rel=0&origin=' + encodeURIComponent(w.location.origin) + '"></iframe>';
    if (info.kind === 'spotify') emb = '<iframe title="Pemutar Spotify" allow="encrypted-media" loading="lazy" src="https://open.spotify.com/embed/' + esc(info.type) + '/' + esc(info.id) + '?theme=0"></iframe>';
    if (emb) openBtn = '<button type="button" class="mp-o" aria-expanded="false" aria-label="Tampilkan pemutar">▴</button>';
    el.innerHTML = (emb ? '<div class="mp-e">' + emb + '</div>' : '') + '<div class="mp-pill"><button type="button" class="mp-b" aria-pressed="false" aria-label="Putar musik"><span class="ico" aria-hidden="true">▶</span><span class="eq" aria-hidden="true"><i></i><i></i><i></i></span></button><div class="mp-t"><b>' + esc(title) + '</b><small>' + (info.kind === 'spotify' ? 'Spotify' : 'Musik latar') + '</small></div>' + openBtn + '</div>';
    host.appendChild(el);
    var btn = el.querySelector('.mp-b'), opn = el.querySelector('.mp-o'), ifr = el.querySelector('iframe'), audio = null, manual = !!st.manual;
    function ui(p) { el.dataset.playing = p ? '1' : '0'; btn.setAttribute('aria-pressed', p ? 'true' : 'false'); btn.setAttribute('aria-label', p ? 'Jeda musik' : 'Putar musik'); }
    function yt(fn) { if (ifr && ifr.contentWindow) ifr.contentWindow.postMessage(JSON.stringify({ event: 'command', func: fn, args: '' }), 'https://www.youtube-nocookie.com'); }
    function toggleOpen(v) { el.dataset.open = v ? '1' : '0'; if (opn) { opn.setAttribute('aria-expanded', v ? 'true' : 'false'); opn.textContent = v ? '▾' : '▴'; } }
    if (info.kind === 'mp3') {
      audio = new Audio(); audio.loop = true; audio.preload = 'none'; audio.src = info.src;
      if (st.t > 0) audio.addEventListener('loadedmetadata', function () { try { audio.currentTime = Math.min(st.t, audio.duration || st.t); } catch (e) {} }, { once: true });
      audio.addEventListener('play', function () { ui(true); }); audio.addEventListener('pause', function () { ui(false); });
      w.addEventListener('pagehide', function () { save({ t: audio.currentTime || 0, manual: manual }); });
    }
    function play() {
      if (audio) { var r = audio.play(); if (r && r.catch) r.catch(function () { ui(false); }); }
      else if (info.kind === 'youtube') { yt('playVideo'); ui(true); }
    }
    function pause() { if (audio) audio.pause(); else if (info.kind === 'youtube') { yt('pauseVideo'); ui(false); } }
    btn.addEventListener('click', function () {
      if (info.kind === 'spotify') { toggleOpen(el.dataset.open !== '1'); return; }
      if (el.dataset.playing === '1') { manual = true; pause(); } else { manual = false; play(); }
    });
    if (opn) opn.addEventListener('click', function () { toggleOpen(el.dataset.open !== '1'); });
    if (info.kind === 'youtube') w.addEventListener('message', function (e) {
      if (!/^https:\/\/www\.youtube(-nocookie)?\.com$/.test(e.origin) || !ifr || e.source !== ifr.contentWindow) return;
      try { var j = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; if (j && j.event === 'onStateChange') ui(j.info === 1); } catch (x) {}
    });
    if (ifr && info.kind === 'youtube') ifr.addEventListener('load', function () { ifr.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), 'https://www.youtube-nocookie.com'); });
    // Putar otomatis: sekali, setelah interaksi pertama di luar pemutar. Tidak untuk Spotify (embed tidak bisa dikendalikan).
    if (m.autoplay !== false && info.kind !== 'spotify' && !manual) {
      var evs = ['pointerup', 'touchend', 'keydown'], done = false;
      var first = function (e) {
        if (done) return;
        if (e.type === 'keydown' && /^(Tab|Shift|Control|Alt|Meta|Escape|CapsLock)$/.test(e.key)) return;
        if (e.target && e.target.closest && e.target.closest('.mp')) { stop(); return; }
        stop(); play();
      };
      var stop = function () { done = true; evs.forEach(function (n) { document.removeEventListener(n, first, true); }); };
      evs.forEach(function (n) { document.addEventListener(n, first, true); });
    }
    api.el = el; api.play = play; api.pause = pause; api.audio = audio;
    return api;
  }
  w.Music = { init: init };
})(window);
