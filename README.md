# Website Personal + Dashboard Visual (GitHub Pages, Rp0)

Halaman publik: `index.html`. Dashboard: `admin.html`. Konten: `data/content.json`.

## Biaya & batasan (jujur)
- GitHub Pages gratis untuk repo publik, tetapi ada batas: ±1 GB ukuran situs, ±100 GB trafik/bulan, dan deploy maksimal ±10 build/jam. Bukan "tanpa batas".
- `admin.html` bisa dibuka siapa saja. Yang mencegah orang lain mengubah situs adalah **token**, bukan nama file.
- Token disimpan di `sessionStorage` (hilang saat tab ditutup). Ini bukan brankas rahasia: jangan dipakai di komputer yang tidak Anda percaya.
- Gambar dikecilkan di browser (maks 512 px foto profil, 800 px thumbnail), lalu diunggah sebagai file ke `assets/images/` di repo Anda saat Publish. Tidak ada layanan pihak ketiga. Pakai gambar secukupnya agar repo tidak membengkak.
- Tag Open Graph di `index.html` statis (crawler media sosial tidak menjalankan JavaScript); ubah manual bila perlu.

## Langkah pemasangan
1. Buat akun di github.com.
2. Klik **New repository**, beri nama (mis. `situs-saya`), pilih **Public**, buat.
3. Klik **uploading an existing file**, ekstrak ZIP lalu seret **isi folder** (index.html, admin.html, assets, data, dll.) ke halaman itu, klik **Commit changes**.
4. Buka **Settings → Pages**. Di *Build and deployment* pilih **Deploy from a branch**, branch **main**, folder **/ (root)**, Save.
5. Tunggu 1–2 menit. URL situs: `https://NAMA-GITHUB.github.io/NAMA-REPO/`. Dashboard: tambahkan `admin.html`.
6. Buat token: foto profil → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
7. *Repository access*: **Only select repositories** → pilih repo Anda saja.
8. *Permissions → Repository permissions → Contents*: **Read and write**. Jangan tambah izin lain. Atur masa berlaku, lalu Generate dan salin token (`github_pat_…`).
9. Buka `admin.html` → **Settings**. Isi Owner (nama GitHub), Repository, Branch (`main`), lalu tempel token → **Hubungkan**.
10. **Profile**: ganti nama, title, bio, foto.
11. **Links / Sections**: tambah link, ubah ikon, seret ⠿ atau pakai tombol ↑ ↓ untuk mengurutkan (di layar sentuh gunakan ↑ ↓).
12. **Appearance**: pilih preset, warna aksen, mode terang/gelap.
13. **Save Draft** menyimpan di browser ini saja; situs publik tidak berubah.
14. **Preview** memperlihatkan draft (di layar lebar, preview selalu tampil di kanan).
15. **Publish Changes** mengirim ke GitHub. Pesan "Berhasil" hanya muncul setelah GitHub mengonfirmasi commit; situs ter-update 1–2 menit kemudian.

## Masalah umum
- **Token tidak valid**: salin ulang token utuh; cek belum kedaluwarsa.
- **Repo/branch/file tidak ditemukan**: cek ejaan Owner/Repo/Branch dan token dipilihkan untuk repo ini.
- **Akses ditolak**: izin *Contents* harus **Read and write**.
- **Konflik**: file di GitHub berubah sejak dimuat. Klik Hubungkan, lalu ulangi perubahan.
- **Situs belum berubah**: tunggu 1–2 menit, refresh keras (Ctrl+Shift+R).
- **404 di situs**: pastikan Pages aktif dan `index.html` ada di root repo.
