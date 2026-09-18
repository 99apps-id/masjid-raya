# Changelog

Semua perubahan penting pada proyek ini didokumentasikan di berkas ini.

Format ini mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/),
dan proyek ini menggunakan [Semantic Versioning](https://semver.org/lang/id/).

## [Belum Dirilis]

### Ditambahkan
- Dokumentasi awal (README.md) lengkap dengan panduan instalasi, mode TV layar penuh, struktur proyek, dan panduan penggunaan.
- Dukungan wilayah Indonesia: katalog kota lengkap untuk perhitungan jadwal shalat.
- Panel admin dengan manajemen berita, kegiatan, khutbah, ustadz, pengurus, petugas, kas, galeri, profil, dan pengaturan.
- Endpoint REST API terlindungi untuk seluruh operasi CRUD admin.
- Autentikasi NextAuth dengan role-based access (`admin`, `pengurus`, `jamaah`).
- Sistem keamanan brute-force berlapis (rate limiting per IP dan per akun).
- Validasi input ketat menggunakan Zod.
- Penyimpanan berkas aman berbasis magic bytes (`src/lib/upload.ts`).
- Papan informasi digital dengan jam tabular, hitung mundur shalat, dan progress bar.
- Mode TV layar penuh (fullscreen) tanpa gangguan navigasi dan footer.
- Tampilan kaligrafi Utsmani (Scheherazade New & Amiri Quran) untuk ayat pilihan.
- Autoplay murottal ayat dengan visualisasi gelombang audio dan transisi cross-fade.
- Fitur khusus Ramadhan: deteksi otomatis, jadwal Imsak, dan hitung mundur berbuka.
- Header keamanan HTTP (CSP, HSTS, X-Frame-Options, dll) di `next.config.mjs`.

### Diperbaiki
- Bug audio runtime error pada autoplay murottal.
- Bug penyimpanan profil masjid di panel admin.
- Ketidakcocokan zona waktu antara jadwal shalat dan jam papan informasi.
