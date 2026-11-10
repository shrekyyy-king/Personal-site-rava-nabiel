// GitHub Contents API. Token hanya dipakai di header Authorization; tidak pernah di URL atau log.
(function (w) {
  function b64(s) { return btoa(unescape(encodeURIComponent(s))); }
  function unb64(s) { return decodeURIComponent(escape(atob(s.replace(/\n/g, '')))); }
  function msg(s, j) {
    if (s === 401) return 'Token tidak valid atau sudah kedaluwarsa.';
    if (s === 403) return 'Akses ditolak atau rate limit. Pastikan izin token: Contents = Read and write.';
    if (s === 404) return 'Repo, branch, atau file tidak ditemukan, atau token tidak punya akses ke repo ini.';
    if (s === 409 || s === 422) return 'Konflik: file di GitHub sudah berubah. Klik Hubungkan untuk memuat ulang, lalu ulangi perubahan.';
    return 'Error GitHub ' + s + (j && j.message ? ': ' + j.message : '');
  }
  async function call(c, path, method, body) {
    var u = 'https://api.github.com/repos/' + encodeURIComponent(c.owner) + '/' + encodeURIComponent(c.repo) + '/contents/' + path.split('/').map(encodeURIComponent).join('/') + (method === 'GET' ? '?ref=' + encodeURIComponent(c.branch) : '');
    var h = { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + c.token, 'X-GitHub-Api-Version': '2022-11-28' };
    if (body) h['Content-Type'] = 'application/json';
    var r, j = null;
    try { r = await fetch(u, { method: method, headers: h, body: body ? JSON.stringify(body) : undefined }); } catch (e) { throw new Error('Tidak dapat menghubungi GitHub. Periksa koneksi internet.'); }
    try { j = await r.json(); } catch (e) {}
    if (!r.ok) throw Object.assign(new Error(msg(r.status, j)), { status: r.status });
    return j;
  }
  w.GH = {
    async read(c, path) { var j = await call(c, path, 'GET'); if (!j || !j.content) throw new Error('Respons GitHub tidak berisi file.'); return { text: unb64(j.content), sha: j.sha }; },
    async write(c, path, text, sha, message) {
      var j = await call(c, path, 'PUT', { message: message, content: b64(text), sha: sha, branch: c.branch });
      if (!j || !j.commit || !j.commit.sha) throw new Error('GitHub tidak mengonfirmasi commit. Perubahan belum dianggap terbit.');
      return j;
    },
    async put(c, path, base64, message) { return call(c, path, 'PUT', { message: message, content: base64, branch: c.branch }); }
  };
})(window);
