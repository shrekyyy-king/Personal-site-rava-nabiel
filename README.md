# Finora

Aplikasi manajemen keuangan pribadi. *Pahami uangmu. Perbaiki hidupmu.*

Berjalan sepenuhnya di browser: tanpa server, tanpa akun, tanpa biaya.

## Privasi
Data transaksi hanya disimpan di `localStorage` browser masing-masing pengguna.
Repositori ini hanya berisi kode, tidak ada data keuangan.
Menghapus data browser atau berganti perangkat dapat menghilangkan data,
jadi gunakan **Pengaturan → Cadangkan (JSON)** secara berkala.

## Fitur
- Catat, ubah, hapus pemasukan dan pengeluaran (Rupiah bilangan bulat)
- Dashboard, grafik bulanan, wawasan berbasis aturan
- Rasio keuangan, perbandingan bulanan, skor kesehatan keuangan
- Laporan ringkasan dan pemasukan-pengeluaran (basis kas), ekspor CSV
- Alokasi dana per dompet (Tunai, BRI, BCA, DANA, bisa ditambah) dan transfer antar dompet
- Portofolio investasi terpisah dari arus kas (pembelian aset bukan pengeluaran)
- Dua bahasa: Indonesia dan English (tombol ID/EN)
- Kategori kustom (tambah, ubah, hapus)
- Jual aset (penuh atau sebagian) dengan laba/rugi terealisasi
- Anggaran bulanan (total, per kelompok, per kategori) dengan peringatan overspending
- Target tabungan dengan progres dan kebutuhan tabungan per bulan
- Cadangan dan pemulihan JSON, tema terang/gelap

## Menjalankan lokal
Buka `index.html` di browser.

## Deploy ke GitHub Pages
1. Unggah `index.html` dan `README.md` ke repositori publik.
2. Settings → Pages → Branch `main`, folder `/ (root)` → Save.
3. Situs aktif di `https://USERNAME.github.io/NAMA-REPO/`.

## Belum tersedia
Cakupan dana darurat, refund, laporan arus kas
operasi/investasi/pendanaan, ekspor Excel/PDF, tes otomatis.
