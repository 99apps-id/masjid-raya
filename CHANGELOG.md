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
- Pilihan reciter murottal: 12 qari terkenal (Alafasy, Abdul Basit, Al-Husary, Minshawi, Maher Al-Muaiqly, As-Sudais, dll) dari arsip EveryAyah yang terverifikasi, dapat diganti lewat Admin → Pengaturan → Suara murottal lengkap dengan pratinjau audio.
- Daftar putar murottal per rentang: kutipan multi-ayat (mis. Al-Insyirah 5–6) dilantunkan ayat per ayat berurutan, bukan hanya ayat pertamanya.
- Font Latin estetik via `next/font` (self-host, lolos CSP, tetap tampil saat TV offline): Plus Jakarta Sans untuk UI dan Marcellus untuk judul hero; terjemahan ayat dikunci ke Inter dan jam digital tetap monospace tabular.
- Mode ringkas fullscreen TV: badge status, tombol kontrol, navigasi ayat, dan blok Pengingat/Uji Adzan disembunyikan; ukuran teks menyesuaikan agar nama surah dan terjemahan tidak tertutup kartu jadwal.

### Diperbaiki
- Bug audio runtime error pada autoplay murottal.
- Bug penyimpanan profil masjid di panel admin.
- Ketidakcocokan zona waktu antara jadwal shalat dan jam papan informasi.
- Gagal simpan profil dengan galat `Unrecognized keys: "id", "createdAt", "updatedAt"` — form kini hanya mengirim kolom yang dikenal.
- Gagal simpan edit ustadz dan pengurus dengan penyebab yang sama — pemetaan field dibuat eksplisit.
- Refresh jadwal papan informasi kembali ke lokasi default — parameter `?lokasi=` kini dipertahankan.
- Berkas MP4/M4A valid (merek `isom`, `dash`, `3gp`, …) yang sebelumnya ditolak deteksi magic bytes.
- Timer pergantian ayat yang bocor saat navigasi cepat (race condition).

### Keamanan
- Token yatim (akun dihapus) kini ditolak middleware termasuk untuk `/akun/*`.
- Seed menolak sandi bawaan bila `NODE_ENV=production` tanpa `SEED_*_PASSWORD`; biaya hash bcrypt 10 → 12.
- Validasi `UPLOAD_DIR` menolak direktori root; berkas bertipe MIME tak dikenal di `/api/media` dijawab 404.
- Validasi tautan berkas dibatasi ke folder unggahan resmi; skema profil memakai `strictObject`.
- Deteksi MP3 diperketat (verifikasi bit versi/lapisan MPEG) agar biner acak tidak lolos sebagai audio.
