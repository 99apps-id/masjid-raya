/**
 * Katalog 114 surah Al-Qur'an (mushaf Madinah, total 6236 ayat).
 *
 * Modul ini murni data + fungsi tanpa akses jaringan/database sehingga aman
 * diimpor komponen klien maupun server. Jumlah ayat per surah mengikuti
 * mushaf standar; teks Arab per ayat dimuat saat runtime lewat
 * `/api/surah/[nomor]` (proksi ber-cache ke arsip quran-uthmani) agar tidak
 * memberatkan bundel JavaScript.
 */

export interface InfoSurah {
  nomor: number;
  nama: string;
  arab: string;
  arti: string;
  ayat: number;
  tempat: "Makkiyah" | "Madaniyah";
}

export const DAFTAR_SURAH: InfoSurah[] = [
  { nomor: 1, nama: "Al-Fatihah", arab: "الفاتحة", arti: "Pembukaan", ayat: 7, tempat: "Makkiyah" },
  { nomor: 2, nama: "Al-Baqarah", arab: "البقرة", arti: "Sapi Betina", ayat: 286, tempat: "Madaniyah" },
  { nomor: 3, nama: "Ali 'Imran", arab: "آل عمران", arti: "Keluarga Imran", ayat: 200, tempat: "Madaniyah" },
  { nomor: 4, nama: "An-Nisa'", arab: "النساء", arti: "Wanita", ayat: 176, tempat: "Madaniyah" },
  { nomor: 5, nama: "Al-Ma'idah", arab: "المائدة", arti: "Hidangan", ayat: 120, tempat: "Madaniyah" },
  { nomor: 6, nama: "Al-An'am", arab: "الأنعام", arti: "Binatang Ternak", ayat: 165, tempat: "Makkiyah" },
  { nomor: 7, nama: "Al-A'raf", arab: "الأعراف", arti: "Tempat Tertinggi", ayat: 206, tempat: "Makkiyah" },
  { nomor: 8, nama: "Al-Anfal", arab: "الأنفال", arti: "Rampasan Perang", ayat: 75, tempat: "Madaniyah" },
  { nomor: 9, nama: "At-Taubah", arab: "التوبة", arti: "Pengampunan", ayat: 129, tempat: "Madaniyah" },
  { nomor: 10, nama: "Yunus", arab: "يونس", arti: "Nabi Yunus", ayat: 109, tempat: "Makkiyah" },
  { nomor: 11, nama: "Hud", arab: "هود", arti: "Nabi Hud", ayat: 123, tempat: "Makkiyah" },
  { nomor: 12, nama: "Yusuf", arab: "يوسف", arti: "Nabi Yusuf", ayat: 111, tempat: "Makkiyah" },
  { nomor: 13, nama: "Ar-Ra'd", arab: "الرعد", arti: "Guruh", ayat: 43, tempat: "Makkiyah" },
  { nomor: 14, nama: "Ibrahim", arab: "إبراهيم", arti: "Nabi Ibrahim", ayat: 52, tempat: "Makkiyah" },
  { nomor: 15, nama: "Al-Hijr", arab: "الحجر", arti: "Kaum Hijr", ayat: 99, tempat: "Makkiyah" },
  { nomor: 16, nama: "An-Nahl", arab: "النحل", arti: "Lebah", ayat: 128, tempat: "Makkiyah" },
  { nomor: 17, nama: "Al-Isra'", arab: "الإسراء", arti: "Memperjalankan Malam Hari", ayat: 111, tempat: "Makkiyah" },
  { nomor: 18, nama: "Al-Kahf", arab: "الكهف", arti: "Penghuni Gua", ayat: 110, tempat: "Makkiyah" },
  { nomor: 19, nama: "Maryam", arab: "مريم", arti: "Maryam", ayat: 98, tempat: "Makkiyah" },
  { nomor: 20, nama: "Ta-Ha", arab: "طه", arti: "Ta Ha", ayat: 135, tempat: "Makkiyah" },
  { nomor: 21, nama: "Al-Anbiya'", arab: "الأنبياء", arti: "Para Nabi", ayat: 112, tempat: "Makkiyah" },
  { nomor: 22, nama: "Al-Hajj", arab: "الحج", arti: "Haji", ayat: 78, tempat: "Madaniyah" },
  { nomor: 23, nama: "Al-Mu'minun", arab: "المؤمنون", arti: "Orang Mukmin", ayat: 118, tempat: "Makkiyah" },
  { nomor: 24, nama: "An-Nur", arab: "النور", arti: "Cahaya", ayat: 64, tempat: "Madaniyah" },
  { nomor: 25, nama: "Al-Furqan", arab: "الفرقان", arti: "Pembeda", ayat: 77, tempat: "Makkiyah" },
  { nomor: 26, nama: "Asy-Syu'ara'", arab: "الشعراء", arti: "Para Penyair", ayat: 227, tempat: "Makkiyah" },
  { nomor: 27, nama: "An-Naml", arab: "النمل", arti: "Semut", ayat: 93, tempat: "Makkiyah" },
  { nomor: 28, nama: "Al-Qasas", arab: "القصص", arti: "Kisah-Kisah", ayat: 88, tempat: "Makkiyah" },
  { nomor: 29, nama: "Al-'Ankabut", arab: "العنكبوت", arti: "Laba-Laba", ayat: 69, tempat: "Makkiyah" },
  { nomor: 30, nama: "Ar-Rum", arab: "الروم", arti: "Bangsa Romawi", ayat: 60, tempat: "Makkiyah" },
  { nomor: 31, nama: "Luqman", arab: "لقمان", arti: "Luqman", ayat: 34, tempat: "Makkiyah" },
  { nomor: 32, nama: "As-Sajdah", arab: "السجدة", arti: "Sujud", ayat: 30, tempat: "Makkiyah" },
  { nomor: 33, nama: "Al-Ahzab", arab: "الأحزاب", arti: "Golongan Bersekutu", ayat: 73, tempat: "Madaniyah" },
  { nomor: 34, nama: "Saba'", arab: "سبأ", arti: "Kaum Saba'", ayat: 54, tempat: "Makkiyah" },
  { nomor: 35, nama: "Fatir", arab: "فاطر", arti: "Pencipta", ayat: 45, tempat: "Makkiyah" },
  { nomor: 36, nama: "Ya-Sin", arab: "يس", arti: "Ya Sin", ayat: 83, tempat: "Makkiyah" },
  { nomor: 37, nama: "As-Saffat", arab: "الصافات", arti: "Barisan-Barisan", ayat: 182, tempat: "Makkiyah" },
  { nomor: 38, nama: "Sad", arab: "ص", arti: "Sad", ayat: 88, tempat: "Makkiyah" },
  { nomor: 39, nama: "Az-Zumar", arab: "الزمر", arti: "Rombongan", ayat: 75, tempat: "Makkiyah" },
  { nomor: 40, nama: "Gafir", arab: "غافر", arti: "Maha Pengampun", ayat: 85, tempat: "Makkiyah" },
  { nomor: 41, nama: "Fussilat", arab: "فصلت", arti: "Dijelaskan", ayat: 54, tempat: "Makkiyah" },
  { nomor: 42, nama: "Asy-Syura", arab: "الشورى", arti: "Musyawarah", ayat: 53, tempat: "Makkiyah" },
  { nomor: 43, nama: "Az-Zukhruf", arab: "الزخرف", arti: "Perhiasan Emas", ayat: 89, tempat: "Makkiyah" },
  { nomor: 44, nama: "Ad-Dukhan", arab: "الدخان", arti: "Kabut", ayat: 59, tempat: "Makkiyah" },
  { nomor: 45, nama: "Al-Jasiyah", arab: "الجاثية", arti: "Berlutut", ayat: 37, tempat: "Makkiyah" },
  { nomor: 46, nama: "Al-Ahqaf", arab: "الأحقاف", arti: "Bukit Pasir", ayat: 35, tempat: "Makkiyah" },
  { nomor: 47, nama: "Muhammad", arab: "محمد", arti: "Nabi Muhammad", ayat: 38, tempat: "Madaniyah" },
  { nomor: 48, nama: "Al-Fath", arab: "الفتح", arti: "Kemenangan", ayat: 29, tempat: "Madaniyah" },
  { nomor: 49, nama: "Al-Hujurat", arab: "الحجرات", arti: "Kamar-Kamar", ayat: 18, tempat: "Madaniyah" },
  { nomor: 50, nama: "Qaf", arab: "ق", arti: "Qaf", ayat: 45, tempat: "Makkiyah" },
  { nomor: 51, nama: "Az-Zariyat", arab: "الذاريات", arti: "Angin yang Menerbangkan", ayat: 60, tempat: "Makkiyah" },
  { nomor: 52, nama: "At-Tur", arab: "الطور", arti: "Bukit Tursina", ayat: 49, tempat: "Makkiyah" },
  { nomor: 53, nama: "An-Najm", arab: "النجم", arti: "Bintang", ayat: 62, tempat: "Makkiyah" },
  { nomor: 54, nama: "Al-Qamar", arab: "القمر", arti: "Bulan", ayat: 55, tempat: "Makkiyah" },
  { nomor: 55, nama: "Ar-Rahman", arab: "الرحمن", arti: "Maha Pengasih", ayat: 78, tempat: "Madaniyah" },
  { nomor: 56, nama: "Al-Waqi'ah", arab: "الواقعة", arti: "Hari Kiamat", ayat: 96, tempat: "Makkiyah" },
  { nomor: 57, nama: "Al-Hadid", arab: "الحديد", arti: "Besi", ayat: 29, tempat: "Madaniyah" },
  { nomor: 58, nama: "Al-Mujadalah", arab: "المجادلة", arti: "Gugatan", ayat: 22, tempat: "Madaniyah" },
  { nomor: 59, nama: "Al-Hasyr", arab: "الحشر", arti: "Pengusiran", ayat: 24, tempat: "Madaniyah" },
  { nomor: 60, nama: "Al-Mumtahanah", arab: "الممتحنة", arti: "Perempuan yang Diuji", ayat: 13, tempat: "Madaniyah" },
  { nomor: 61, nama: "As-Saff", arab: "الصف", arti: "Barisan", ayat: 14, tempat: "Madaniyah" },
  { nomor: 62, nama: "Al-Jumu'ah", arab: "الجمعة", arti: "Jumat", ayat: 11, tempat: "Madaniyah" },
  { nomor: 63, nama: "Al-Munafiqun", arab: "المنافقون", arti: "Orang Munafik", ayat: 11, tempat: "Madaniyah" },
  { nomor: 64, nama: "At-Tagabun", arab: "التغابن", arti: "Pengungkapan Kesalahan", ayat: 18, tempat: "Madaniyah" },
  { nomor: 65, nama: "At-Talaq", arab: "الطلاق", arti: "Talak", ayat: 12, tempat: "Madaniyah" },
  { nomor: 66, nama: "At-Tahrim", arab: "التحريم", arti: "Pengharaman", ayat: 12, tempat: "Madaniyah" },
  { nomor: 67, nama: "Al-Mulk", arab: "الملك", arti: "Kerajaan", ayat: 30, tempat: "Makkiyah" },
  { nomor: 68, nama: "Al-Qalam", arab: "القلم", arti: "Pena", ayat: 52, tempat: "Makkiyah" },
  { nomor: 69, nama: "Al-Haqqah", arab: "الحاقة", arti: "Hari Kiamat", ayat: 52, tempat: "Makkiyah" },
  { nomor: 70, nama: "Al-Ma'arij", arab: "المعارج", arti: "Tempat Naik", ayat: 44, tempat: "Makkiyah" },
  { nomor: 71, nama: "Nuh", arab: "نوح", arti: "Nabi Nuh", ayat: 28, tempat: "Makkiyah" },
  { nomor: 72, nama: "Al-Jinn", arab: "الجن", arti: "Jin", ayat: 28, tempat: "Makkiyah" },
  { nomor: 73, nama: "Al-Muzzammil", arab: "المزمل", arti: "Berselimut", ayat: 20, tempat: "Makkiyah" },
  { nomor: 74, nama: "Al-Muddassir", arab: "المدثر", arti: "Berkemul", ayat: 56, tempat: "Makkiyah" },
  { nomor: 75, nama: "Al-Qiyamah", arab: "القيامة", arti: "Hari Kiamat", ayat: 40, tempat: "Makkiyah" },
  { nomor: 76, nama: "Al-Insan", arab: "الإنسان", arti: "Manusia", ayat: 31, tempat: "Madaniyah" },
  { nomor: 77, nama: "Al-Mursalat", arab: "المرسلات", arti: "Malaikat yang Diutus", ayat: 50, tempat: "Makkiyah" },
  { nomor: 78, nama: "An-Naba'", arab: "النبأ", arti: "Berita Besar", ayat: 40, tempat: "Makkiyah" },
  { nomor: 79, nama: "An-Nazi'at", arab: "النازعات", arti: "Malaikat yang Mencabut", ayat: 46, tempat: "Makkiyah" },
  { nomor: 80, nama: "'Abasa", arab: "عبس", arti: "Bermuka Masam", ayat: 42, tempat: "Makkiyah" },
  { nomor: 81, nama: "At-Takwir", arab: "التكوير", arti: "Penggulungan", ayat: 29, tempat: "Makkiyah" },
  { nomor: 82, nama: "Al-Infitar", arab: "الانفطار", arti: "Terbelah", ayat: 19, tempat: "Makkiyah" },
  { nomor: 83, nama: "Al-Mutaffifin", arab: "المطففين", arti: "Orang Curang", ayat: 36, tempat: "Makkiyah" },
  { nomor: 84, nama: "Al-Insyiqaq", arab: "الانشقاق", arti: "Terbelah", ayat: 25, tempat: "Makkiyah" },
  { nomor: 85, nama: "Al-Buruj", arab: "البروج", arti: "Gugusan Bintang", ayat: 22, tempat: "Makkiyah" },
  { nomor: 86, nama: "At-Tariq", arab: "الطارق", arti: "Yang Datang Malam Hari", ayat: 17, tempat: "Makkiyah" },
  { nomor: 87, nama: "Al-A'la", arab: "الأعلى", arti: "Maha Tinggi", ayat: 19, tempat: "Makkiyah" },
  { nomor: 88, nama: "Al-Gasyiyah", arab: "الغاشية", arti: "Hari Pembalasan", ayat: 26, tempat: "Makkiyah" },
  { nomor: 89, nama: "Al-Fajr", arab: "الفجر", arti: "Fajar", ayat: 30, tempat: "Makkiyah" },
  { nomor: 90, nama: "Al-Balad", arab: "البلد", arti: "Negeri", ayat: 20, tempat: "Makkiyah" },
  { nomor: 91, nama: "Asy-Syams", arab: "الشمس", arti: "Matahari", ayat: 15, tempat: "Makkiyah" },
  { nomor: 92, nama: "Al-Lail", arab: "الليل", arti: "Malam", ayat: 21, tempat: "Makkiyah" },
  { nomor: 93, nama: "Ad-Duha", arab: "الضحى", arti: "Waktu Duha", ayat: 11, tempat: "Makkiyah" },
  { nomor: 94, nama: "Asy-Syarh", arab: "الشرح", arti: "Lapang", ayat: 8, tempat: "Makkiyah" },
  { nomor: 95, nama: "At-Tin", arab: "التين", arti: "Buah Tin", ayat: 8, tempat: "Makkiyah" },
  { nomor: 96, nama: "Al-'Alaq", arab: "العلق", arti: "Segumpal Darah", ayat: 19, tempat: "Makkiyah" },
  { nomor: 97, nama: "Al-Qadr", arab: "القدر", arti: "Kemuliaan", ayat: 5, tempat: "Makkiyah" },
  { nomor: 98, nama: "Al-Bayyinah", arab: "البينة", arti: "Bukti Nyata", ayat: 8, tempat: "Madaniyah" },
  { nomor: 99, nama: "Az-Zalzalah", arab: "الزلزلة", arti: "Keguncangan", ayat: 8, tempat: "Madaniyah" },
  { nomor: 100, nama: "Al-'Adiyat", arab: "العاديات", arti: "Kuda Perang", ayat: 11, tempat: "Makkiyah" },
  { nomor: 101, nama: "Al-Qari'ah", arab: "القارعة", arti: "Hari Kiamat", ayat: 11, tempat: "Makkiyah" },
  { nomor: 102, nama: "At-Takasur", arab: "التكاثر", arti: "Bermegah-Megahan", ayat: 8, tempat: "Makkiyah" },
  { nomor: 103, nama: "Al-'Asr", arab: "العصر", arti: "Waktu", ayat: 3, tempat: "Makkiyah" },
  { nomor: 104, nama: "Al-Humazah", arab: "الهمزة", arti: "Pengumpat", ayat: 9, tempat: "Makkiyah" },
  { nomor: 105, nama: "Al-Fil", arab: "الفيل", arti: "Gajah", ayat: 5, tempat: "Makkiyah" },
  { nomor: 106, nama: "Quraisy", arab: "قريش", arti: "Suku Quraisy", ayat: 4, tempat: "Makkiyah" },
  { nomor: 107, nama: "Al-Ma'un", arab: "الماعون", arti: "Barang Berguna", ayat: 7, tempat: "Makkiyah" },
  { nomor: 108, nama: "Al-Kausar", arab: "الكوثر", arti: "Nikmat yang Banyak", ayat: 3, tempat: "Makkiyah" },
  { nomor: 109, nama: "Al-Kafirun", arab: "الكافرون", arti: "Orang Kafir", ayat: 6, tempat: "Makkiyah" },
  { nomor: 110, nama: "An-Nasr", arab: "النصر", arti: "Pertolongan", ayat: 3, tempat: "Madaniyah" },
  { nomor: 111, nama: "Al-Lahab", arab: "المسد", arti: "Sabut Api", ayat: 5, tempat: "Makkiyah" },
  { nomor: 112, nama: "Al-Ikhlas", arab: "الإخلاص", arti: "Ikhlas", ayat: 4, tempat: "Makkiyah" },
  { nomor: 113, nama: "Al-Falaq", arab: "الفلق", arti: "Waktu Subuh", ayat: 5, tempat: "Makkiyah" },
  { nomor: 114, nama: "An-Nas", arab: "الناس", arti: "Manusia", ayat: 6, tempat: "Makkiyah" },
];

/** Cari surah berdasarkan nomor 1–114; null bila di luar rentang. */
export function cariSurah(nomor: number): InfoSurah | null {
  if (!Number.isInteger(nomor) || nomor < 1 || nomor > 114) return null;
  return DAFTAR_SURAH[nomor - 1] ?? null;
}

/** Total ayat seluruh Al-Qur'an menurut katalog ini (acuan: 6236). */
export function totalAyatQuran(): number {
  return DAFTAR_SURAH.reduce((jumlah, surah) => jumlah + surah.ayat, 0);
}
