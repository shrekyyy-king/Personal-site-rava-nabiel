// Dashboard visual. Draft: localStorage. Token: sessionStorage saja. Publish: GitHub Contents API.
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); }, esc = R.esc;
  var K = { cfg: 'cms.cfg', draft: 'cms.draft', tok: 'cms.token' };
  var TABS = [['overview', 'Overview'], ['profile', 'Profile'], ['links', 'Links'], ['sections', 'Sections'], ['projects', 'Projects'], ['story', 'Who am I'], ['appearance', 'Appearance'], ['settings', 'Settings']];
  function rd(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  var S = { d: null, pub: '', sha: null, tab: 'overview', conn: false, hasDraft: false, dirty: false, lastPub: '', open: new Set(),
    cfg: Object.assign({ owner: '', repo: '', branch: 'main', path: 'data/content.json' }, rd(K.cfg, {})) };
  function get(o, p) { return p ? p.split('.').reduce(function (x, k) { return x == null ? x : x[k]; }, o) : o; }
  function set(o, p, v) { var k = p.split('.'), l = k.pop(); get(o, k.join('.'))[l] = v; }
  function uid() { return Math.random().toString(36).slice(2, 9); }
  function tok() { return sessionStorage.getItem(K.tok); }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  function norm(d) {
    d = d || {};
    d.meta = Object.assign({ title: '', description: '' }, d.meta);
    d.profile = Object.assign({ name: '', title: '', bio: '', tagline: '', location: '', status: '', avatar: '' }, d.profile);
    ['socials', 'sections', 'projects'].forEach(function (k) { d[k] = Array.isArray(d[k]) ? d[k] : []; });
    d.sections.forEach(function (s) { s.links = Array.isArray(s.links) ? s.links : []; });
    d.about = Object.assign({ visible: false, intro: '', education: '', interests: '', skills: '' }, d.about);
    d.contact = Object.assign({ visible: false, email: '', whatsapp: '', linkedin: '' }, d.contact);
    d.appearance = Object.assign({ mode: 'auto', preset: 'professional', accent: '#1d4ed8', font: 'sans', radius: 10, button: 'outline', card: 'flat', align: 'center' }, d.appearance);
    d.footer = d.footer || '';
    d.story = Object.assign({ visible: false, heading: 'Siapa saya', intro: '', cvUrl: '', chapters: [] }, d.story);
    d.story.chapters = Array.isArray(d.story.chapters) ? d.story.chapters : [];
    d.story.chapters.forEach(function (c) { c.id = c.id || uid(); });
    function id(x) { x.id = x.id || uid(); }
    d.socials.concat(d.sections, d.projects).forEach(id);
    d.sections.forEach(function (s) { s.links.forEach(id); });
    return d;
  }
  function okUrl(u) { try { return /^(https?|mailto|tel):$/.test(new URL(u, location.href).protocol); } catch (e) { return false; } }
  function validate() {
    var e = [], d = S.d;
    if (!String(d.profile.name).trim()) e.push('Nama wajib diisi.');
    function chk(x) { if (!x.url || !okUrl(x.url)) e.push('URL tidak valid: ' + (x.title || '(tanpa judul)')); }
    d.socials.forEach(function (x) { if (x.visible !== false && x.url) chk(x); });
    d.sections.forEach(function (s) { s.links.forEach(function (l) { if (l.visible !== false) chk(l); }); });
    d.projects.forEach(function (x) { if (x.visible !== false && x.url) chk(x); });
    if (d.contact.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.contact.email)) e.push('Format email tidak valid.');
    if (d.contact.linkedin && !okUrl(d.contact.linkedin)) e.push('URL LinkedIn tidak valid.');
    if (d.story.cvUrl && !okUrl(d.story.cvUrl)) e.push('URL CV tidak valid.');
    return e;
  }
  function say(t, k) {
    var el = $('#toast'); el.textContent = t; el.className = 'toast ' + (k || ''); el.hidden = false;
    clearTimeout(say.t); say.t = setTimeout(function () { el.hidden = true; }, k === 'err' ? 9000 : 5000);
  }

  // ---------- form helpers ----------
  function F(l, p, o) {
    o = o || {}; var v = get(S.d, p), a = 'data-p="' + p + '"', t = o.t || 'text';
    if (t === 'ta') return '<label>' + l + '<textarea ' + a + ' rows="' + (o.r || 3) + '">' + esc(v) + '</textarea></label>';
    if (t === 'chk') return '<label class="chk"><input type="checkbox" ' + a + (v ? ' checked' : '') + '> ' + l + '</label>';
    if (t === 'sel') return '<label>' + l + '<select ' + a + '>' + o.o.map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === v ? ' selected' : '') + '>' + esc(x[1]) + '</option>'; }).join('') + '</select></label>';
    if (t === 'img') return '<div class="imgf"><span>' + l + '</span>' + (R.img(v) ? '<img src="' + esc(R.img(v)) + '" alt="">' : '') +
      '<input type="file" accept="image/png,image/jpeg,image/webp" data-img="' + p + '" data-max="' + (o.max || 600) + '">' + (v ? '<button data-a="rmimg" data-v="' + p + '">Hapus gambar</button>' : '') + '</div>';
    return '<label>' + l + '<input type="' + t + '" ' + a + ' value="' + esc(v) + '" ' + (o.x || '') + '></label>';
  }
  function tools(l, i, n) {
    var b = function (a, s, t, dis) { return '<button data-a="' + a + '" data-l="' + l + '" data-i="' + i + '" aria-label="' + t + '"' + (dis ? ' disabled' : '') + '>' + s + '</button>'; };
    return '<span class="tools">' + b('up', '↑', 'Naik', !i) + b('down', '↓', 'Turun', i >= n - 1) + b('dup', '⧉', 'Duplikat') + b('del', '✕', 'Hapus') + '</span>';
  }
  function item(l, i, n, x, body) {
    return '<details class="item" data-list="' + l + '" data-i="' + i + '" data-id="' + x.id + '"' + (S.open.has(x.id) ? ' open' : '') + '><summary><span class="grip" title="Seret untuk mengurutkan">⠿</span><span class="sum">' +
      (esc(x.title) || '(tanpa judul)') + (x.visible === false ? '<em>tersembunyi</em>' : '') + '</span>' + tools(l, i, n) + '</summary><div class="body">' + body + '</div></details>';
  }
  function list(l, kind, label, fn) {
    var a = get(S.d, l);
    return a.map(function (x, i) { return item(l, i, a.length, x, fn(x, l + '.' + i)); }).join('') + '<button data-a="add" data-l="' + l + '" data-k="' + kind + '">+ ' + label + '</button>';
  }
  var NEW = {
    social: function () { return { id: uid(), title: 'Link baru', url: '', description: '', visible: true }; },
    link: function () { return { id: uid(), title: 'Link baru', description: '', url: '', icon: 'link', visible: true }; },
    section: function () { return { id: uid(), title: 'Section baru', layout: 'list', visible: true, links: [] }; },
    project: function () { return { id: uid(), title: 'Proyek baru', description: '', thumb: '', url: '', category: '', date: '', visible: true }; }
  };
  NEW.chapter = function () { return { id: uid(), title: 'Bab baru', body: '', quote: '', visible: true }; };
  var ICONOPTS = function () { return Object.keys(R.ICONS).map(function (k) { return [k, R.ICONS[k] + ' ' + k]; }); };

  var T = {
    overview: function () {
      var d = S.d, n = d.sections.reduce(function (a, s) { return a + s.links.filter(function (l) { return l.visible !== false; }).length; }, 0) + d.socials.filter(function (s) { return s.visible !== false && s.url; }).length;
      var site = S.cfg.owner && S.cfg.repo ? 'https://' + S.cfg.owner + '.github.io/' + S.cfg.repo + '/' : '—';
      return '<h2>Overview</h2><div class="stats">' + [['GitHub', S.conn ? 'Terhubung' : 'Belum terhubung'], ['Terakhir publish', S.lastPub || '—'], ['Draft', S.dirty ? 'Belum disimpan' : S.hasDraft ? 'Tersimpan lokal' : 'Tidak ada'], ['Link aktif', n], ['Section', d.sections.length], ['Proyek', d.projects.length]]
        .map(function (x) { return '<div class="stat"><small>' + x[0] + '</small><b>' + esc(x[1]) + '</b></div>'; }).join('') + '</div><p class="note">URL situs: ' + esc(site) + '</p>' +
        '<div class="row"><button data-a="tab" data-v="profile">Edit profil</button><button data-a="tab" data-v="sections">Kelola link</button><button data-a="tab" data-v="appearance">Tampilan</button></div>' +
        (S.conn ? '' : '<p class="note">Hubungkan GitHub di Settings agar bisa Publish. Tanpa itu Anda tetap bisa mengedit dan menyimpan draft.</p>');
    },
    profile: function () {
      return '<h2>Profile</h2>' + F('Nama', 'profile.name') + F('Title profesional', 'profile.title') + F('Tagline', 'profile.tagline') + F('Biografi', 'profile.bio', { t: 'ta', r: 4 }) +
        F('Lokasi (opsional)', 'profile.location') + F('Status ketersediaan (opsional)', 'profile.status') + F('Foto profil', 'profile.avatar', { t: 'img', max: 512 }) +
        '<h3>Tentang saya</h3>' + F('Tampilkan section', 'about.visible', { t: 'chk' }) + F('Pengantar', 'about.intro', { t: 'ta' }) + F('Pendidikan', 'about.education', { t: 'ta', r: 2 }) +
        F('Minat', 'about.interests', { t: 'ta', r: 2 }) + F('Keahlian (pisahkan dengan koma)', 'about.skills');
    },
    links: function () {
      return '<h2>Sosial media</h2>' + list('socials', 'social', 'Tambah sosial media', function (x, p) { return F('Judul', p + '.title') + F('URL', p + '.url') + F('Deskripsi (opsional)', p + '.description') + F('Tampilkan', p + '.visible', { t: 'chk' }); }) +
        '<h2>Kontak</h2>' + F('Tampilkan section', 'contact.visible', { t: 'chk' }) + F('Email', 'contact.email', { t: 'email' }) + F('WhatsApp (nomor, mis. 62812...)', 'contact.whatsapp') + F('LinkedIn (URL)', 'contact.linkedin');
    },
    sections: function () {
      return '<h2>Section & link</h2>' + list('sections', 'section', 'Tambah section', function (s, p) {
        return F('Judul section', p + '.title') + F('Layout', p + '.layout', { t: 'sel', o: [['list', 'Daftar'], ['grid', 'Grid']] }) + F('Tampilkan', p + '.visible', { t: 'chk' }) + '<h3>Link</h3>' +
          list(p + '.links', 'link', 'Tambah link', function (l, q) { return F('Judul', q + '.title') + F('Deskripsi', q + '.description') + F('URL', q + '.url') + F('Ikon', q + '.icon', { t: 'sel', o: ICONOPTS() }) + F('Tampilkan', q + '.visible', { t: 'chk' }); });
      });
    },
    projects: function () {
      return '<h2>Proyek</h2>' + list('projects', 'project', 'Tambah proyek', function (x, p) {
        return F('Judul', p + '.title') + F('Deskripsi', p + '.description', { t: 'ta' }) + F('URL proyek', p + '.url') + F('Kategori', p + '.category') + F('Tanggal (opsional)', p + '.date') + F('Thumbnail', p + '.thumb', { t: 'img', max: 800 }) + F('Tampilkan', p + '.visible', { t: 'chk' });
      });
    },
    story: function () {
      return '<h2>Who am I</h2><p class="note">Tulis ceritamu dalam bab-bab. Pisahkan paragraf dengan satu baris kosong.</p>' + F('Tampilkan halaman & tautan di beranda', 'story.visible', { t: 'chk' }) + F('Judul halaman', 'story.heading') + F('Pembuka', 'story.intro', { t: 'ta', r: 3 }) + F('Link CV (opsional)', 'story.cvUrl') +
        '<h3>Bab</h3>' + list('story.chapters', 'chapter', 'Tambah bab', function (c, p) { return F('Judul bab', p + '.title') + F('Isi cerita', p + '.body', { t: 'ta', r: 8 }) + F('Kutipan sorotan (opsional)', p + '.quote', { t: 'ta', r: 2 }) + F('Tampilkan', p + '.visible', { t: 'chk' }); });
    },
    appearance: function () {
      var A = S.d.appearance;
      return '<h2>Tampilan</h2><div class="row">' + Object.keys(R.PRESETS).map(function (k) { return '<button data-a="preset" data-v="' + k + '"' + (A.preset === k ? ' aria-pressed="true"' : '') + '>' + k[0].toUpperCase() + k.slice(1) + '</button>'; }).join('') + '</div>' +
        F('Mode', 'appearance.mode', { t: 'sel', o: [['auto', 'Otomatis'], ['light', 'Terang'], ['dark', 'Gelap']] }) + F('Warna aksen', 'appearance.accent', { t: 'color' }) +
        F('Font', 'appearance.font', { t: 'sel', o: [['sans', 'Sans-serif'], ['serif', 'Serif (judul)'], ['mono', 'Monospace']] }) + F('Border radius', 'appearance.radius', { t: 'range', x: 'min="0" max="28"' }) +
        F('Gaya tombol', 'appearance.button', { t: 'sel', o: [['outline', 'Outline'], ['solid', 'Solid']] }) + F('Gaya kartu', 'appearance.card', { t: 'sel', o: [['flat', 'Flat'], ['raised', 'Bayangan halus']] }) +
        F('Layout profil', 'appearance.align', { t: 'sel', o: [['center', 'Tengah'], ['left', 'Kiri']] });
    },
    settings: function () {
      var c = S.cfg, url = c.owner && c.repo ? 'https://' + c.owner + '.github.io/' + c.repo + '/' : '';
      return '<h2>Settings</h2><h3>Koneksi GitHub</h3><p class="note">Token disimpan hanya di sessionStorage (hilang saat tab ditutup). Ini penyimpanan sementara di browser, bukan brankas rahasia: jangan pakai di komputer yang tidak Anda percaya.</p>' +
        [['owner', 'Owner'], ['repo', 'Repository'], ['branch', 'Branch'], ['path', 'Path file konten']].map(function (x) { return '<label>' + x[1] + '<input data-cfg="' + x[0] + '" value="' + esc(c[x[0]]) + '"></label>'; }).join('') +
        '<label>Fine-grained token<input type="password" id="tok" autocomplete="off" placeholder="github_pat_..."></label><div class="row"><button class="primary" data-a="connect">Hubungkan</button><button data-a="logout">Logout / putuskan</button></div>' +
        (url ? '<p>URL situs: <a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(url) + '</a></p>' : '') +
        '<h3>SEO & footer</h3>' + F('Judul halaman', 'meta.title') + F('Meta description', 'meta.description', { t: 'ta', r: 2 }) + F('Teks footer', 'footer') +
        '<h3>Data</h3><div class="row"><button data-a="export">Export JSON</button><label class="filebtn">Import JSON<input type="file" accept="application/json" id="imp" hidden></label><button data-a="reset">Reset draft / pulihkan versi published</button></div>';
    }
  };

  // ---------- render ----------
  function bar() {
    var diff = JSON.stringify(S.d) !== S.pub;
    $('#badges').innerHTML = '<span class="bd' + (S.conn ? ' ok' : '') + '">' + (S.conn ? 'GitHub terhubung' : 'Belum terhubung') + '</span><span class="bd' + (S.dirty || diff ? ' warn' : '') + '">' + (S.dirty ? 'Belum disimpan' : S.hasDraft ? 'Draft tersimpan' : diff ? 'Berbeda dari published' : 'Sesuai published') + '</span>';
    $('#nav').innerHTML = TABS.map(function (t) { return '<button data-a="tab" data-v="' + t[0] + '"' + (S.tab === t[0] ? ' aria-current="page"' : '') + '>' + t[1] + '</button>'; }).join('');
  }
  function pv() { if (S.tab === 'story') R.renderStory($('#pv'), S.d, true); else R.render($('#pv'), S.d, true); }
  function main() { $('#main').innerHTML = T[S.tab](); bar(); }
  function changed(re) { S.dirty = true; pv(); if (re) main(); else bar(); }
  function shell() {
    $('#admin').innerHTML = '<header class="top"><div><b>Dashboard</b><span id="badges"></span></div><div class="row" style="margin:0"><button data-a="save">Save Draft</button><button data-a="preview">Preview</button><button class="primary" data-a="publish" id="pubbtn">Publish Changes</button></div></header><nav id="nav"></nav>' +
      '<div class="cols"><section id="main"></section><aside id="pvp"><div class="devs"><button data-a="device" data-v="mobile">Mobile</button><button data-a="device" data-v="tablet">Tablet</button><button data-a="device" data-v="desktop">Desktop</button></div><div id="pvwrap" data-dev="mobile"><div id="pv" class="site"></div></div></aside></div><div id="toast" class="toast" role="status" hidden></div>';
  }

  // ---------- actions ----------
  function move(l, f, t) { var a = get(S.d, l); if (t < 0 || t >= a.length || f === t) return; a.splice(t, 0, a.splice(f, 1)[0]); changed(true); }
  function reid(x) { x.id = uid(); (x.links || []).forEach(reid); }
  function saveDraft() {
    var e = validate(); if (e.length) return say(e.join(' · '), 'err');
    try { localStorage.setItem(K.draft, JSON.stringify(S.d)); } catch (x) { return say('Penyimpanan lokal penuh. Gunakan gambar yang lebih kecil.', 'err'); }
    S.hasDraft = true; S.dirty = false; bar(); say('Draft disimpan di browser ini. Situs publik belum berubah.', 'ok');
  }
  async function connect(silent) {
    var c = Object.assign({}, S.cfg, { token: tok() });
    if (!c.owner || !c.repo || !c.token) return;
    try {
      var r = await GH.read(c, c.path), j = JSON.parse(r.text);
      S.sha = r.sha; S.pub = JSON.stringify(norm(clone(j))); S.conn = true;
      if (!S.hasDraft && !S.dirty) S.d = norm(j);
      if (!silent) say('Terhubung. Konten dimuat dari GitHub.', 'ok');
    } catch (e) { S.conn = false; say(e.message, 'err'); }
  }
  async function uploadImages(c, d) {
    var slots = [[d.profile, 'avatar']].concat(d.projects.map(function (p) { return [p, 'thumb']; }));
    for (var i = 0; i < slots.length; i++) {
      var o = slots[i][0], k = slots[i][1], m = /^data:image\/(\w+);base64,(.+)$/.exec(o[k] || '');
      if (m) { var path = 'assets/images/' + uid() + '.' + (m[1] === 'jpeg' ? 'jpg' : m[1]); await GH.put(c, path, m[2], 'Upload gambar via dashboard'); o[k] = path; }
    }
  }
  async function publish() {
    if (!S.conn || !tok()) return say('Hubungkan GitHub di Settings terlebih dahulu.', 'err');
    var e = validate(); if (e.length) return say(e.join(' · '), 'err');
    var c = Object.assign({}, S.cfg, { token: tok() }), btn = $('#pubbtn'); btn.disabled = true; btn.textContent = 'Memublikasikan…';
    try {
      var d = clone(S.d); await uploadImages(c, d);
      var j = await GH.write(c, S.cfg.path, JSON.stringify(d, null, 2) + '\n', S.sha, 'Update konten via dashboard');
      S.sha = j.content && j.content.sha; S.d = d; S.pub = JSON.stringify(d); S.lastPub = new Date().toLocaleString('id-ID');
      localStorage.removeItem(K.draft); S.hasDraft = false; S.dirty = false; main(); pv();
      say('Berhasil. Commit ' + j.commit.sha.slice(0, 7) + ' tercatat di GitHub. Situs publik diperbarui dalam 1–2 menit.', 'ok');
    } catch (x) { say('Gagal memublikasikan: ' + x.message, 'err'); }
    finally { btn.disabled = false; btn.textContent = 'Publish Changes'; }
  }
  function shrink(f, max) {
    return new Promise(function (ok, no) {
      var u = URL.createObjectURL(f), im = new Image();
      im.onload = function () { var k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); ok(c.toDataURL('image/webp', 0.82)); };
      im.onerror = no; im.src = u;
    });
  }

  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.dataset && t.dataset.cfg) { S.cfg[t.dataset.cfg] = t.value.trim(); localStorage.setItem(K.cfg, JSON.stringify(S.cfg)); return; }
    var p = t.dataset && t.dataset.p; if (!p) return;
    set(S.d, p, t.type === 'checkbox' ? t.checked : t.type === 'range' ? +t.value : t.value);
    changed(t.type === 'checkbox');
  });
  document.addEventListener('change', async function (e) {
    var t = e.target;
    if (t.dataset && t.dataset.img) {
      var f = t.files[0]; if (!f) return;
      if (!/^image\/(png|jpeg|webp)$/.test(f.type)) return say('Format harus PNG, JPG, atau WebP.', 'err');
      if (f.size > 5 * 1024 * 1024) return say('Ukuran file maksimal 5 MB.', 'err');
      try { set(S.d, t.dataset.img, await shrink(f, +t.dataset.max)); changed(true); } catch (x) { say('Gambar tidak dapat diproses.', 'err'); }
    } else if (t.id === 'imp' && t.files[0]) {
      try { var j = JSON.parse(await t.files[0].text()); if (!j || typeof j.profile !== 'object') throw 0; S.d = norm(j); changed(true); say('Konfigurasi diimpor sebagai draft.', 'ok'); } catch (x) { say('File JSON tidak valid.', 'err'); }
    }
  });
  document.addEventListener('toggle', function (e) { var t = e.target; if (t.dataset && t.dataset.id) { if (t.open) S.open.add(t.dataset.id); else S.open.delete(t.dataset.id); } }, true);
  document.addEventListener('click', async function (e) {
    var b = e.target.closest('[data-a]'); if (!b) return; e.preventDefault();
    var a = b.dataset.a, l = b.dataset.l, i = +b.dataset.i, v = b.dataset.v;
    if (a === 'tab') { S.tab = v; main(); pv(); }
    else if (a === 'up') move(l, i, i - 1);
    else if (a === 'down') move(l, i, i + 1);
    else if (a === 'dup') { var arr = get(S.d, l), c = clone(arr[i]); reid(c); c.title = (c.title || '') + ' (salinan)'; arr.splice(i + 1, 0, c); changed(true); }
    else if (a === 'del') { if (confirm('Hapus item ini?')) { get(S.d, l).splice(i, 1); changed(true); } }
    else if (a === 'add') { var n = NEW[b.dataset.k](); get(S.d, l).push(n); S.open.add(n.id); changed(true); }
    else if (a === 'rmimg') { set(S.d, v, ''); changed(true); }
    else if (a === 'preset') { Object.assign(S.d.appearance, R.PRESETS[v], { preset: v }); changed(true); }
    else if (a === 'device') $('#pvwrap').dataset.dev = v;
    else if (a === 'preview') document.body.classList.toggle('pv-open');
    else if (a === 'save') saveDraft();
    else if (a === 'publish') await publish();
    else if (a === 'connect') {
      var tv = $('#tok').value.trim(); if (!tv && !tok()) return say('Isi token terlebih dahulu.', 'err');
      if (tv) { sessionStorage.setItem(K.tok, tv); $('#tok').value = ''; }
      await connect(); main(); pv();
    }
    else if (a === 'logout') { sessionStorage.removeItem(K.tok); S.conn = false; S.sha = null; main(); say('Token dihapus dari sesi ini.', 'ok'); }
    else if (a === 'export') { var bl = new Blob([JSON.stringify(S.d, null, 2)], { type: 'application/json' }), al = document.createElement('a'); al.href = URL.createObjectURL(bl); al.download = 'content.json'; al.click(); }
    else if (a === 'reset') { if (confirm('Buang draft dan kembali ke versi published?')) { localStorage.removeItem(K.draft); S.d = norm(JSON.parse(S.pub)); S.hasDraft = false; S.dirty = false; main(); pv(); } }
  });
  var drag = null;
  document.addEventListener('pointerdown', function (e) { var g = e.target.closest && e.target.closest('.grip'); if (g) g.closest('.item').draggable = true; });
  document.addEventListener('dragstart', function (e) { var it = e.target.closest && e.target.closest('[data-list]'); if (it) drag = { l: it.dataset.list, i: +it.dataset.i }; });
  document.addEventListener('dragover', function (e) { if (drag && e.target.closest && e.target.closest('[data-list]')) e.preventDefault(); });
  document.addEventListener('drop', function (e) { var it = e.target.closest && e.target.closest('[data-list]'); if (!drag || !it || it.dataset.list !== drag.l) return; e.preventDefault(); var d = drag; drag = null; move(d.l, d.i, +it.dataset.i); });
  document.addEventListener('dragend', function (e) { if (e.target.classList && e.target.classList.contains('item')) e.target.draggable = false; drag = null; });
  window.addEventListener('beforeunload', function (e) { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } });

  async function init() {
    shell();
    try {
      var r = await fetch('data/content.json', { cache: 'no-store' }); var pub = norm(await r.json()); S.pub = JSON.stringify(pub);
      var dr = localStorage.getItem(K.draft); S.hasDraft = !!dr; S.d = dr ? norm(JSON.parse(dr)) : clone(pub);
    } catch (e) { S.d = norm({}); S.pub = JSON.stringify(S.d); say('Konten awal tidak dapat dimuat; memulai dari data kosong.', 'err'); }
    if (tok() && S.cfg.owner) await connect(true);
    main(); pv();
  }
  init();
})();
