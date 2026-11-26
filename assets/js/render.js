// Dipakai bersama oleh situs publik dan Live Preview. Semua teks di-escape.
(function (w) {
  var ST = { sans: 'Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif', serif: '"Playfair Display",Georgia,serif', mono: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace', grotesk: '"Space Grotesk",Inter,system-ui,sans-serif', display: '"DM Serif Display",Georgia,serif' };
  var PRESETS = {
    professional: { accent: '#1d4ed8', font: 'sans', radius: 10, palette: 'default', mode: 'auto' },
    minimal: { accent: '#171717', font: 'sans', radius: 4, palette: 'mono', mode: 'auto' },
    elegant: { accent: '#8a6d3b', font: 'serif', radius: 12, palette: 'sand', mode: 'light' },
    modern: { accent: '#7c3aed', font: 'grotesk', radius: 18, palette: 'default', mode: 'auto' },
    monochrome: { accent: '#525252', font: 'mono', radius: 0, palette: 'mono', mode: 'auto' },
    aurora: { accent: '#2dd4bf', font: 'grotesk', radius: 20, palette: 'midnight', mode: 'dark' },
    sage: { accent: '#3f7d5a', font: 'display', radius: 14, palette: 'sage', mode: 'light' },
    rose: { accent: '#be4b6b', font: 'display', radius: 16, palette: 'rose', mode: 'light' }
  };
  var ICONS = { link: '↗', star: '★', mail: '✉', phone: '☎', home: '⌂', doc: '✎', dot: '◆' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // Domain tanpa skema (mis. "www.linkedin.com/in/...") akan dianggap path relatif dan menuju halaman salah; beri https://.
  function fix(u) { u = String(u == null ? '' : u).trim(); return /^(www\.[\w-]+\.\S+|(linkedin|instagram|github|facebook|twitter|tiktok|youtube)\.com\/\S*)$/i.test(u) ? 'https://' + u : u; }
  function url(u) { u = fix(u); return (/^(https?:\/\/|mailto:|tel:)/i.test(u) || /^[\w.\/#-]+$/.test(u)) ? u : '#'; }
  function img(s) { s = String(s || ''); return (/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+\/=]+$/.test(s) || /^https?:\/\//i.test(s) || /^[\w.\/-]+$/.test(s)) ? s : ''; }
  function lum(h) { var n = parseInt(h.slice(1), 16); function f(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); } return 0.2126 * f(n >> 16) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255); }
  function V(x) { return x && x.visible !== false; }
  function nn(i) { return ('0' + i).slice(-2); }
  function L(u, c, t) { return '<a class="' + c + '" href="' + esc(url(u)) + '" target="_blank" rel="noopener noreferrer">' + t + '</a>'; }
  function inl(x) { return esc(x).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>'); }
  function paras(t) {
    return String(t || '').split(/\n\s*\n/).map(function (b) {
      var o = '', ul = false, pr = [];
      function fl() { if (pr.length) { o += '<p>' + pr.join('<br>') + '</p>'; pr = []; } }
      b.split('\n').map(function (x) { return x.trim(); }).filter(Boolean).forEach(function (l) {
        var m = /^[-•]\s+(.*)$/.exec(l);
        if (m) { fl(); if (!ul) { o += '<ul>'; ul = true; } o += '<li>' + inl(m[1]) + '</li>'; }
        else { if (ul) { o += '</ul>'; ul = false; } pr.push(inl(l)); }
      });
      fl(); if (ul) o += '</ul>'; return o;
    }).join('');
  }
  // Video: YouTube / Vimeo (embed) atau file .mp4/.webm. URL lain ditolak (return '').
  function video(u) {
    u = String(u || '').trim(); var m, at = ' loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" allow="encrypted-media; picture-in-picture; fullscreen"';
    if ((m = /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^#\s]*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,15})/i.exec(u))) return '<div class="vid"><iframe title="Video" src="https://www.youtube-nocookie.com/embed/' + m[1] + '"' + at + '></iframe></div>';
    if ((m = /^https?:\/\/(?:www\.)?vimeo\.com\/(?:video\/)?(\d{5,12})/i.exec(u))) return '<div class="vid"><iframe title="Video" src="https://player.vimeo.com/video/' + m[1] + '"' + at + '></iframe></div>';
    if (/^(https:\/\/[^\s"'<>]+|[\w.\/-]+)\.(mp4|webm|ogg)(\?[^\s"'<>]*)?$/i.test(u)) return '<video class="vidf" controls playsinline preload="metadata" src="' + esc(u) + '"></video>';
    return '';
  }
  // Musik latar: dikenali dari URL-nya. MP3 (path repo / https), YouTube, atau Spotify.
  function music(m) {
    var u = String((m && m.url) || '').trim(), x; if (!u) return null;
    if ((x = /^https?:\/\/(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:watch\?(?:[^#\s]*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,15})/i.exec(u))) return { kind: 'youtube', id: x[1] };
    if ((x = /^https?:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(track|album|playlist|episode|show)\/([A-Za-z0-9]{10,30})/i.exec(u))) return { kind: 'spotify', type: x[1].toLowerCase(), id: x[2] };
    if (/^(https:\/\/[^\s"'<>]+|[\w.\/-]+)\.mp3(\?[^\s"'<>]*)?$/i.test(u)) return { kind: 'mp3', src: u };
    return null;
  }
  function pref() { try { var v = w.localStorage.getItem('site.mode'); return v === 'dark' || v === 'light' ? v : null; } catch (e) { return null; } }
  // Tema + atribut root. Pengunjung boleh menimpa mode lewat tombol terang/gelap (disimpan di browser mereka).
  function theme(root, a, pv) {
    a = a || {};
    var acc = /^#[0-9a-f]{6}$/i.test(a.accent) ? a.accent : '#1d4ed8';
    var dark = a.mode === 'dark' || (a.mode === 'auto' && w.matchMedia && w.matchMedia('(prefers-color-scheme: dark)').matches);
    var ov = pv ? null : pref(); if (ov) dark = ov === 'dark';
    root.className = 'site'; root.dataset.mode = dark ? 'dark' : 'light';
    root.dataset.btn = a.button || 'outline'; root.dataset.card = a.card || 'flat'; root.dataset.align = a.align || 'left';
    root.dataset.pal = a.palette || 'default'; root.dataset.shape = a.shape || 'rounded'; root.dataset.motion = a.motion || 'full';
    root.dataset.progress = a.progress === 'off' ? 'off' : 'on';
    var s = root.style, f = a.font || 'sans';
    s.setProperty('--accent', acc); s.setProperty('--on', lum(acc) > 0.4 ? '#111' : '#fff'); s.setProperty('--r', (+a.radius || 0) + 'px');
    s.setProperty('--ff', f === 'mono' ? ST.mono : f === 'grotesk' ? ST.grotesk : ST.sans); s.setProperty('--fh', ST[f] || ST.sans);
    return dark;
  }
  function nav(d, items, pv, dark) {
    var a = d.appearance || {}, p = d.profile || {}; if (a.nav === 'off') return '';
    var ln = items.map(function (x) { return pv ? '<span>' + esc(x[0]) + '</span>' : '<a href="' + esc(x[1]) + '">' + esc(x[0]) + '</a>'; }).join('');
    return '<nav class="nb" aria-label="Navigasi utama"><div class="nb-in">' + (pv ? '<span class="nb-brand">' + esc(p.name || '') + '</span>' : '<a class="nb-brand" href="./">' + esc(p.name || '') + '</a>') +
      '<div class="nb-links">' + ln + '</div>' + (!pv && a.themeToggle !== 'off' ? '<button type="button" class="mt" aria-label="Ganti tema terang atau gelap" aria-pressed="' + (dark ? 'true' : 'false') + '"><span aria-hidden="true">◐</span></button>' : '') + '</div></nav>';
  }
  // Tagline: satu baris = satu kalimat. Lebih dari satu → berganti-ganti (digerakkan fx.js; tanpa JS yang tampil kalimat pertama).
  function tags(p) {
    var ls = String(p.taglines || '').split(/\n/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 8);
    if (!ls.length && p.tagline) ls = [String(p.tagline)];
    if (!ls.length) return '';
    if (ls.length === 1) return '<p class="tag">' + esc(ls[0]) + '</p>';
    return '<p class="tag rot">' + ls.map(function (x, i) { return '<span' + (i ? '' : ' class="on"') + '>' + esc(x) + '</span>'; }).join('') + '</p>';
  }
  function stats(b) {
    var it = (b.items || []).filter(function (i) { return i && (String(i.value || '').trim() || i.label); });
    if (!it.length) return '';
    return '<div class="stats-g">' + it.map(function (i) {
      var v = String(i.value || '').trim(), m = /^([^\d]*)(\d+(?:[.,]\d{1,2})?)([^\d]*)$/.exec(v), at = '';
      if (m && !/^(19|20)\d\d$/.test(v)) { var dec = (m[2].split(/[.,]/)[1] || '').length; at = ' data-to="' + parseFloat(m[2].replace(',', '.')) + '" data-p="' + esc(m[1]) + '" data-s="' + esc(m[3]) + '" data-d="' + dec + '" data-c="' + (/,/.test(m[2]) ? ',' : '.') + '" data-f="' + esc(v) + '"'; }
      return '<div class="stat-c"><strong class="sv"' + at + '>' + esc(v) + '</strong>' + (i.label ? '<span>' + esc(i.label) + '</span>' : '') + '</div>';
    }).join('') + '</div>';
  }
  function timeline(b) {
    var it = (b.items || []).filter(function (i) { return i && (i.title || i.period || i.org || i.desc); });
    if (!it.length) return '';
    return '<ol class="tl">' + it.map(function (i, k) {
      return '<li class="tl-i rv" style="--i:' + Math.min(k, 6) + '">' + (i.period ? '<span class="tl-p">' + esc(i.period) + '</span>' : '') + '<div class="tl-b">' + (i.title ? '<b>' + esc(i.title) + '</b>' : '') + (i.org ? '<small>' + esc(i.org) + '</small>' : '') + (i.desc ? paras(i.desc) : '') + '</div></li>';
    }).join('') + '</ol>';
  }
  // Foto bab: daftar `photos` (baru) atau satu `photo` (lama, tetap didukung).
  function chapPhotos(c) {
    var a = (c.photos || []).map(function (x) { return { s: img(x && x.src), c: (x && x.caption) || '' }; }).filter(function (x) { return x.s; });
    if (!a.length && img(c.photo)) a = [{ s: img(c.photo), c: '' }];
    return a;
  }
  function pics(c, pv) {
    var a = chapPhotos(c); if (!a.length) return '';
    function fig(x, cls) { return '<figure class="' + cls + '"><img src="' + esc(x.s) + '" alt="' + esc(x.c) + '" loading="lazy">' + (x.c ? '<figcaption>' + esc(x.c) + '</figcaption>' : '') + '</figure>'; }
    if (a.length === 1) return '<div class="pics">' + fig(a[0], 'pic') + '</div>';
    return '<div class="pics multi" role="group" aria-roledescription="carousel" aria-label="Foto bab: ' + esc(c.title || '') + '"><div class="trk" tabindex="0">' + a.map(function (x) { return fig(x, 'sl'); }).join('') + '</div>' +
      (pv ? '' : '<div class="ctl"><button type="button" class="pr" aria-label="Foto sebelumnya" disabled>‹</button><span class="cnt" aria-live="polite">1 / ' + a.length + '</span><button type="button" class="nx" aria-label="Foto berikutnya">›</button></div>') + '</div>';
  }
  function gallery(b) {
    var ph = (b.photos || []).filter(function (p) { return img(p.src); }); if (!ph.length) return '';
    return '<div class="gal ' + (b.layout === 'strip' ? 'strip' : 'masonry') + '">' + ph.map(function (p) {
      return '<figure><img src="' + esc(img(p.src)) + '" alt="' + esc(p.caption || '') + '" loading="lazy">' + (p.caption ? '<figcaption>' + esc(p.caption) + '</figcaption>' : '') + '</figure>';
    }).join('') + '</div>';
  }
  function render(root, d, pv) {
    var p = d.profile || {}, a = d.appearance || {};
    var dark = theme(root, a, pv);
    var ini = (p.name || '?').split(/\s+/).map(function (x) { return x[0]; }).slice(0, 2).join('').toUpperCase();
    var av = img(p.avatar) ? '<img class="avatar" src="' + esc(img(p.avatar)) + '" alt="' + esc(p.name) + '" width="96" height="96">' : '<div class="avatar" aria-hidden="true">' + esc(ini) + '</div>';
    var cov = img(p.cover), hs = a.heroStyle || 'split', st = d.story || {}, storyOn = st.visible === true && (st.intro || (st.chapters || []).some(V));
    var soc = (d.socials || []).filter(V).filter(function (x) { return x.url; });
    var hero = '<header id="top" class="hero' + (cov ? ' cov' : '') + ' h-' + hs + '">' + (cov && hs === 'overlay' ? '<img class="bg" src="' + esc(cov) + '" alt="">' : (cov ? '' : '<i class="blob" aria-hidden="true"></i>')) +
      '<div class="hero-in">' + av + '<h1>' + esc(p.name) + '</h1>' + (p.title ? '<p class="title">' + esc(p.title) + '</p>' : '') + tags(p) +
      (p.bio ? '<p class="bio">' + esc(p.bio) + '</p>' : '') + ((p.location || p.status) ? '<p class="meta">' + [p.location, p.status].filter(Boolean).map(esc).join(' &nbsp;|&nbsp; ') + '</p>' : '') +
      (soc.length ? '<div class="socials">' + soc.map(function (x) { return L(x.url, 'chip', esc(x.title)); }).join('') + '</div>' : '') +
      (storyOn ? '<a class="cta" href="whoami.html"' + (pv ? ' target="_blank" rel="noopener"' : '') + '>' + esc(st.buttonLabel || 'Siapa saya') + ' <span aria-hidden="true">→</span></a>' : '') + '</div>' +
      (cov && hs !== 'overlay' ? '<figure class="pic"><img src="' + esc(cov) + '" alt="' + esc(p.name) + '"></figure>' : '') + '</header>';
    var n = 0, h = '', navItems = [];
    function blk(title, inner, wd) { var t = '', id = ''; if (title) { n++; id = ' id="sec-' + n + '"'; navItems.push([title, '#sec-' + n]); t = '<h2><span>' + nn(n) + '</span>' + esc(title) + '</h2>'; } return '<section' + id + ' class="block rv' + (wd === 'half' ? ' half' : '') + '">' + t + inner + '</section>'; }
    (d.sections || []).filter(V).forEach(function (sc) {
      var ls = (sc.links || []).filter(V); if (!ls.length) return;
      var lay = a.linkLayout && a.linkLayout !== 'auto' ? a.linkLayout : (a.linkLayout === 'auto' ? (sc.layout || 'bento') : 'bento');
      var hasSized = ls.some(function (l) { return l.size === 'l' || l.size === 'w'; });
      var bCls = lay === 'bento' && !hasSized && ls.length <= 3 ? ' bento-' + ls.length : '';
      h += blk(sc.title, '<div class="links ' + (lay === 'list' ? '' : lay + bCls) + '">' + ls.map(function (l) {
        var th = img(l.thumb), b = lay === 'bento', sz = b ? ' sz-' + (l.size === 'l' || l.size === 'w' ? l.size : 's') : '';
        return L(l.url, 'btn' + sz + (th && b ? ' has-img' : ''), (th ? '<img class="' + (b ? 'tbg' : 'th') + '" src="' + esc(th) + '" alt="" loading="lazy">' : '<span class="ic" aria-hidden="true">' + (ICONS[l.icon] || ICONS.link) + '</span>') +
          '<span class="tx"><b>' + esc(l.title) + '</b>' + (l.description ? '<small>' + esc(l.description) + '</small>' : '') + '</span>' + (l.badge ? '<em class="badge">' + esc(l.badge) + '</em>' : ''));
      }).join('') + '</div>', sc.width);
    });
    (d.blocks || []).filter(V).forEach(function (b) {
      var inner = '';
      if (b.type === 'gallery') inner = gallery(b);
      else if (b.type === 'video') { var v = video(b.url); inner = v ? v + (b.caption ? '<p class="cap">' + esc(b.caption) + '</p>' : '') : ''; }
      else if (b.type === 'text') inner = '<div class="about">' + paras(b.body) + '</div>';
      else if (b.type === 'timeline') inner = timeline(b);
      else if (b.type === 'stats') inner = stats(b);
      else if (b.type === 'quote') inner = b.text ? '<blockquote class="pq">' + esc(b.text) + (b.by ? '<cite>— ' + esc(b.by) + '</cite>' : '') + '</blockquote>' : '';
      if (inner) h += blk(b.title, inner, b.width);
    });
    var ab = d.about || {}, sk = String(ab.skills || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    var abOn = V(ab) && !!(ab.intro || ab.education || ab.interests || sk.length);
    var c = d.contact || {}, ct = [];
    if (c.email) ct.push(['Email', 'mailto:' + c.email]);
    if (c.whatsapp) ct.push(['WhatsApp', 'https://wa.me/' + String(c.whatsapp).replace(/\D/g, '')]);
    if (c.linkedin) ct.push(['LinkedIn', c.linkedin]);
    var ctOn = V(c) && ct.length > 0;
    var pairW = (abOn && ctOn) ? 'half' : '';
    if (abOn) {
      h += blk('Tentang saya', '<div class="about">' + (ab.intro ? '<p>' + esc(ab.intro) + '</p>' : '') + (ab.education ? '<p><b>Pendidikan</b><br>' + esc(ab.education) + '</p>' : '') +
        (ab.interests ? '<p><b>Minat</b><br>' + esc(ab.interests) + '</p>' : '') + (sk.length ? '<div class="chips">' + sk.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' : '') + '</div>', pairW);
    }
    if (ctOn) h += blk('Kontak', '<div class="links">' + ct.map(function (x) { return L(x[1], 'btn', '<span class="ic" aria-hidden="true">' + ICONS.mail + '</span><span class="tx"><b>' + x[0] + '</b></span>'); }).join('') + '</div>', pairW);
    var pr = (d.projects || []).filter(V);
    if (pr.length) {
      h += blk('Proyek', '<div class="projects' + (pr.length === 1 ? ' single' : '') + '">' + pr.map(function (x) {
        var th = img(x.thumb);
        var t = (th ? '<img src="' + esc(th) + '" alt="" loading="lazy">' : '<div class="proj-bar" aria-hidden="true"><span>' + ICONS.dot + '</span></div>') + '<div><b>' + esc(x.title) + '</b>' + ((x.category || x.date) ? '<small>' + esc([x.category, x.date].filter(Boolean).join(' · ')) + '</small>' : '') + (x.description ? '<p>' + esc(x.description) + '</p>' : '') + '</div>';
        return x.url ? L(x.url, 'proj', t) : '<div class="proj">' + t + '</div>';
      }).join('') + '</div>');
    }
    var items = navItems.slice(); if (storyOn) items.push([st.buttonLabel || 'Siapa saya', 'whoami.html']);
    root.innerHTML = nav(d, items, pv, dark) + hero + '<div class="wrap">' + h + '<footer>' + esc(d.footer || '') + '</footer></div>';
  }
  function renderStory(root, d, pv) {
    var st = d.story || {}, p = d.profile || {}, dark = theme(root, d.appearance, pv);
    var ch = (st.chapters || []).filter(V);
    var heading = String(st.heading || 'Siapa saya').trim() || 'Siapa saya';
    var top = '<div class="wrap story stop">' + (pv ? '' : '<a class="back" href="./">← Beranda</a>') + '<header class="sh"><small>' + esc(p.name) + '</small><h1>' + esc(heading) + '</h1>' + (st.intro ? '<p class="lead">' + esc(st.intro) + '</p>' : '') + '</header></div>';
    var chs = ch.map(function (c, i) {
      var pc = pics(c, pv), vd = video(c.video), ttl = String(c.title || '').trim();
      var wc = String(c.body || '').trim().split(/\s+/).filter(Boolean).length;
      var mins = wc ? Math.max(1, Math.round(wc / 180)) : 0;
      return '<section id="bab-' + (i + 1) + '" class="chap rv' + (pc ? ' ph' : '') + '">' + pc +
        '<div class="ci"><div class="chap-top"><span class="num">' + nn(i + 1) + '</span>' + (mins ? '<span class="chap-meta">' + mins + ' mnt baca</span>' : '') + '</div><h2>' + esc(ttl) + '</h2>' + paras(c.body) + (vd ? '<div class="cv">' + vd + '</div>' : '') + (c.quote ? '<blockquote>' + esc(c.quote) + '</blockquote>' : '') + '</div></section>';
    }).join('');
    var tail = '<div class="wrap story">' + (!ch.length && !st.intro ? '<p>Cerita belum ditulis.</p>' : '') +
      (st.cvUrl ? '<div class="links">' + L(st.cvUrl, 'btn', '<span class="ic" aria-hidden="true">' + ICONS.doc + '</span><span class="tx"><b>Lihat CV</b></span>') + '</div>' : '') + '<footer>' + esc(d.footer || '') + '</footer></div>';
    var items = ch.map(function (c, i) { return [c.title ? String(c.title).trim() : 'Bab ' + (i + 1), '#bab-' + (i + 1)]; });
    root.innerHTML = nav(d, items, pv, dark) + top + chs + tail;
  }
  w.R = { render: render, renderStory: renderStory, theme: theme, nav: nav, esc: esc, url: url, fixUrl: fix, img: img, video: video, music: music, PRESETS: PRESETS, ICONS: ICONS };
})(window);
