// Dipakai bersama oleh situs publik dan Live Preview. Semua teks di-escape.
(function (w) {
  var ST = { sans: 'Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif', serif: '"Playfair Display",Georgia,serif', mono: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace' };
  var PRESETS = {
    professional: { accent: '#1d4ed8', font: 'sans', radius: 10 },
    minimal: { accent: '#171717', font: 'sans', radius: 4 },
    elegant: { accent: '#8a6d3b', font: 'serif', radius: 12 },
    modern: { accent: '#7c3aed', font: 'sans', radius: 16 },
    monochrome: { accent: '#525252', font: 'mono', radius: 0 }
  };
  var ICONS = { link: '↗', star: '★', mail: '✉', phone: '☎', home: '⌂', doc: '✎', dot: '◆' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function url(u) { u = String(u || '').trim(); return (/^(https?:\/\/|mailto:|tel:)/i.test(u) || /^[\w.\/#-]+$/.test(u)) ? u : '#'; }
  function img(s) { s = String(s || ''); return (/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+\/=]+$/.test(s) || /^https?:\/\//i.test(s) || /^[\w.\/-]+$/.test(s)) ? s : ''; }
  function lum(h) { var n = parseInt(h.slice(1), 16); function f(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); } return 0.2126 * f(n >> 16) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255); }
  function V(x) { return x && x.visible !== false; }
  function render(root, d) {
    var p = d.profile || {}, a = d.appearance || {};
    var acc = /^#[0-9a-f]{6}$/i.test(a.accent) ? a.accent : '#1d4ed8';
    var dark = a.mode === 'dark' || (a.mode === 'auto' && w.matchMedia && w.matchMedia('(prefers-color-scheme: dark)').matches);
    root.className = 'site'; root.dataset.mode = dark ? 'dark' : 'light';
    root.dataset.btn = a.button || 'outline'; root.dataset.card = a.card || 'flat'; root.dataset.align = a.align || 'center';
    var s = root.style, f = a.font || 'sans';
    s.setProperty('--accent', acc); s.setProperty('--on', lum(acc) > 0.4 ? '#111' : '#fff'); s.setProperty('--r', (+a.radius || 0) + 'px');
    s.setProperty('--ff', f === 'mono' ? ST.mono : ST.sans); s.setProperty('--fh', ST[f] || ST.sans);
    function L(u, c, t) { return '<a class="' + c + '" href="' + esc(url(u)) + '" target="_blank" rel="noopener noreferrer">' + t + '</a>'; }
    var ini = (p.name || '?').split(/\s+/).map(function (x) { return x[0]; }).slice(0, 2).join('').toUpperCase();
    var av = img(p.avatar) ? '<img class="avatar" src="' + esc(img(p.avatar)) + '" alt="' + esc(p.name) + '" width="104" height="104">' : '<div class="avatar" aria-hidden="true">' + esc(ini) + '</div>';
    var soc = (d.socials || []).filter(V).filter(function (x) { return x.url; });
    var h = '<header class="hero">' + av + '<h1>' + esc(p.name) + '</h1>' +
      (p.title ? '<p class="title">' + esc(p.title) + '</p>' : '') + (p.tagline ? '<p class="tag">' + esc(p.tagline) + '</p>' : '') +
      (p.bio ? '<p class="bio">' + esc(p.bio) + '</p>' : '') +
      ((p.location || p.status) ? '<p class="meta">' + [p.location, p.status].filter(Boolean).map(esc).join(' &nbsp;|&nbsp; ') + '</p>' : '') +
      (soc.length ? '<div class="socials">' + soc.map(function (x) { return L(x.url, 'chip', esc(x.title)); }).join('') + '</div>' : '') + '</header>';
    (d.sections || []).filter(V).forEach(function (sc) {
      var ls = (sc.links || []).filter(V); if (!ls.length) return;
      h += '<section class="block"><h2>' + esc(sc.title) + '</h2><div class="links' + (sc.layout === 'grid' ? ' grid' : '') + '">' +
        ls.map(function (l) { return L(l.url, 'btn', '<span class="ic" aria-hidden="true">' + (ICONS[l.icon] || ICONS.link) + '</span><span><b>' + esc(l.title) + '</b>' + (l.description ? '<small>' + esc(l.description) + '</small>' : '') + '</span>'); }).join('') + '</div></section>';
    });
    var ab = d.about || {}, sk = String(ab.skills || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    if (V(ab) && (ab.intro || ab.education || ab.interests || sk.length)) {
      h += '<section class="block about"><h2>Tentang saya</h2>' + (ab.intro ? '<p>' + esc(ab.intro) + '</p>' : '') +
        (ab.education ? '<p><b>Pendidikan</b><br>' + esc(ab.education) + '</p>' : '') + (ab.interests ? '<p><b>Minat</b><br>' + esc(ab.interests) + '</p>' : '') +
        (sk.length ? '<div class="chips">' + sk.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' : '') + '</section>';
    }
    var pr = (d.projects || []).filter(V);
    if (pr.length) {
      h += '<section class="block"><h2>Proyek</h2><div class="projects">' + pr.map(function (x) {
        var t = (img(x.thumb) ? '<img src="' + esc(img(x.thumb)) + '" alt="" loading="lazy">' : '') + '<div><b>' + esc(x.title) + '</b>' +
          ((x.category || x.date) ? '<small>' + esc([x.category, x.date].filter(Boolean).join(' · ')) + '</small>' : '') + (x.description ? '<p>' + esc(x.description) + '</p>' : '') + '</div>';
        return x.url ? L(x.url, 'proj', t) : '<div class="proj">' + t + '</div>';
      }).join('') + '</div></section>';
    }
    var c = d.contact || {}, ct = [];
    if (c.email) ct.push(['Email', 'mailto:' + c.email]);
    if (c.whatsapp) ct.push(['WhatsApp', 'https://wa.me/' + String(c.whatsapp).replace(/\D/g, '')]);
    if (c.linkedin) ct.push(['LinkedIn', c.linkedin]);
    if (V(c) && ct.length) h += '<section class="block"><h2>Kontak</h2><div class="links">' + ct.map(function (x) { return L(x[1], 'btn', '<span class="ic" aria-hidden="true">' + ICONS.mail + '</span><span><b>' + x[0] + '</b></span>'); }).join('') + '</div></section>';
    h += '<footer>' + esc(d.footer || '') + '</footer>';
    root.innerHTML = '<div class="wrap">' + h + '</div>';
  }
  w.R = { render: render, esc: esc, url: url, img: img, PRESETS: PRESETS, ICONS: ICONS };
})(window);
