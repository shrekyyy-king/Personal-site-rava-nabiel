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
  function nn(i) { return ('0' + i).slice(-2); }
  function L(u, c, t) { return '<a class="' + c + '" href="' + esc(url(u)) + '" target="_blank" rel="noopener noreferrer">' + t + '</a>'; }
  function render(root, d, pv) {
    var p = d.profile || {}, a = d.appearance || {};
    var acc = /^#[0-9a-f]{6}$/i.test(a.accent) ? a.accent : '#1d4ed8';
    var dark = a.mode === 'dark' || (a.mode === 'auto' && w.matchMedia && w.matchMedia('(prefers-color-scheme: dark)').matches);
    root.className = 'site'; root.dataset.mode = dark ? 'dark' : 'light';
    root.dataset.btn = a.button || 'outline'; root.dataset.card = a.card || 'flat'; root.dataset.align = a.align || 'left';
    var s = root.style, f = a.font || 'sans';
    s.setProperty('--accent', acc); s.setProperty('--on', lum(acc) > 0.4 ? '#111' : '#fff'); s.setProperty('--r', (+a.radius || 0) + 'px');
    s.setProperty('--ff', f === 'mono' ? ST.mono : ST.sans); s.setProperty('--fh', ST[f] || ST.sans);
    var ini = (p.name || '?').split(/\s+/).map(function (x) { return x[0]; }).slice(0, 2).join('').toUpperCase();
    var av = img(p.avatar) ? '<img class="avatar" src="' + esc(img(p.avatar)) + '" alt="' + esc(p.name) + '" width="96" height="96">' : '<div class="avatar" aria-hidden="true">' + esc(ini) + '</div>';
    var cov = img(p.cover), st = d.story || {}, storyOn = st.visible === true && (st.intro || (st.chapters || []).some(V));
    var soc = (d.socials || []).filter(V).filter(function (x) { return x.url; });
    var hero = '<header class="hero' + (cov ? ' cov' : '') + '">' + (cov ? '<img class="bg" data-par=".22" src="' + esc(cov) + '" alt="">' : '<i class="blob" aria-hidden="true"></i>') +
      '<div class="hero-in">' + av + '<h1>' + esc(p.name) + '</h1>' + (p.title ? '<p class="title">' + esc(p.title) + '</p>' : '') + (p.tagline ? '<p class="tag">' + esc(p.tagline) + '</p>' : '') +
      (p.bio ? '<p class="bio">' + esc(p.bio) + '</p>' : '') + ((p.location || p.status) ? '<p class="meta">' + [p.location, p.status].filter(Boolean).map(esc).join(' &nbsp;|&nbsp; ') + '</p>' : '') +
      (soc.length ? '<div class="socials">' + soc.map(function (x) { return L(x.url, 'chip', esc(x.title)); }).join('') + '</div>' : '') +
      (storyOn ? '<a class="cta" href="whoami.html"' + (pv ? ' target="_blank" rel="noopener"' : '') + '>' + esc(st.buttonLabel || 'Siapa saya') + ' <span aria-hidden="true">→</span></a>' : '') + '</div></header>';
    var n = 0;
    function blk(title, inner) { n++; return '<section class="block rv"><h2><span>' + nn(n) + '</span>' + esc(title) + '</h2>' + inner + '</section>'; }
    var h = '';
    (d.sections || []).filter(V).forEach(function (sc) {
      var ls = (sc.links || []).filter(V); if (!ls.length) return;
      h += blk(sc.title, '<div class="links' + (sc.layout === 'grid' ? ' grid' : '') + '">' + ls.map(function (l) {
        return L(l.url, 'btn', (img(l.thumb) ? '<img class="th" src="' + esc(img(l.thumb)) + '" alt="" loading="lazy" width="44" height="44">' : '<span class="ic" aria-hidden="true">' + (ICONS[l.icon] || ICONS.link) + '</span>') + '<span class="tx"><b>' + esc(l.title) + '</b>' + (l.description ? '<small>' + esc(l.description) + '</small>' : '') + '</span>');
      }).join('') + '</div>');
    });
    var ab = d.about || {}, sk = String(ab.skills || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    if (V(ab) && (ab.intro || ab.education || ab.interests || sk.length)) {
      h += blk('Tentang saya', '<div class="about">' + (ab.intro ? '<p>' + esc(ab.intro) + '</p>' : '') + (ab.education ? '<p><b>Pendidikan</b><br>' + esc(ab.education) + '</p>' : '') +
        (ab.interests ? '<p><b>Minat</b><br>' + esc(ab.interests) + '</p>' : '') + (sk.length ? '<div class="chips">' + sk.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' : '') + '</div>');
    }
    var pr = (d.projects || []).filter(V);
    if (pr.length) {
      h += blk('Proyek', '<div class="projects">' + pr.map(function (x) {
        var t = (img(x.thumb) ? '<img src="' + esc(img(x.thumb)) + '" alt="" loading="lazy">' : '') + '<div><b>' + esc(x.title) + '</b>' + ((x.category || x.date) ? '<small>' + esc([x.category, x.date].filter(Boolean).join(' · ')) + '</small>' : '') + (x.description ? '<p>' + esc(x.description) + '</p>' : '') + '</div>';
        return x.url ? L(x.url, 'proj', t) : '<div class="proj">' + t + '</div>';
      }).join('') + '</div>');
    }
    var c = d.contact || {}, ct = [];
    if (c.email) ct.push(['Email', 'mailto:' + c.email]);
    if (c.whatsapp) ct.push(['WhatsApp', 'https://wa.me/' + String(c.whatsapp).replace(/\D/g, '')]);
    if (c.linkedin) ct.push(['LinkedIn', c.linkedin]);
    if (V(c) && ct.length) h += blk('Kontak', '<div class="links">' + ct.map(function (x) { return L(x[1], 'btn', '<span class="ic" aria-hidden="true">' + ICONS.mail + '</span><span class="tx"><b>' + x[0] + '</b></span>'); }).join('') + '</div>');
    root.innerHTML = hero + '<div class="wrap">' + h + '<footer>' + esc(d.footer || '') + '</footer></div>';
  }
  function renderStory(root, d, pv) {
    var st = d.story || {}, p = d.profile || {};
    render(root, { appearance: d.appearance });
    var ch = (st.chapters || []).filter(V);
    function paras(t) { return String(t || '').split(/\n\s*\n/).map(function (x) { return x.trim(); }).filter(Boolean).map(function (x) { return '<p>' + esc(x).replace(/\n/g, '<br>') + '</p>'; }).join(''); }
    var top = '<div class="wrap story top">' + (pv ? '' : '<a class="back" href="./">← Beranda</a>') + '<header class="sh"><small>' + esc(p.name) + '</small><h1>' + esc(st.heading || 'Siapa saya') + '</h1>' + (st.intro ? '<p class="lead">' + esc(st.intro) + '</p>' : '') + '</header></div>';
    var chs = ch.map(function (c, i) {
      var ph = img(c.photo);
      return '<section class="chap rv' + (ph ? ' ph' : '') + '">' + (ph ? '<img class="cbg" data-par=".14" src="' + esc(ph) + '" alt=""><i class="shade"></i>' : '') +
        '<div class="ci"><span class="num">' + nn(i + 1) + '</span><h2>' + esc(c.title) + '</h2>' + paras(c.body) + (c.quote ? '<blockquote>' + esc(c.quote) + '</blockquote>' : '') + '</div></section>';
    }).join('');
    var tail = '<div class="wrap story">' + (!ch.length && !st.intro ? '<p>Cerita belum ditulis.</p>' : '') +
      (st.cvUrl ? '<div class="links">' + L(st.cvUrl, 'btn', '<span class="ic" aria-hidden="true">' + ICONS.doc + '</span><span class="tx"><b>Lihat CV</b></span>') + '</div>' : '') + '<footer>' + esc(d.footer || '') + '</footer></div>';
    root.innerHTML = top + chs + tail;
  }
  w.R = { render: render, renderStory: renderStory, esc: esc, url: url, img: img, PRESETS: PRESETS, ICONS: ICONS };
})(window);
