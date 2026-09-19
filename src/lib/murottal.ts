/**
 * Katalog pilihan suara murottal (reciter) untuk papan informasi.
 *
 * Modul ini murni data + fungsi tanpa akses jaringan/database sehingga aman
 * diimpor komponen klien (dropdown admin maupun papan informasi).
 *
 * Seluruh rekaman diambil dari arsip EveryAyah
 * (`https://everyayah.com/data/<subdir>/SS SAAA.mp3`, S = surah, A = ayat)
 * yang pola berkasnya sudah terbukti stabil per ayat. Setiap subdirektori di
 * bawah ini sudah diperiksa langsung (HTTP 200 untuk Al-Fatihah : 1 maupun
 * ayat tengah/akhir surah) sebelum dimasukkan katalog.
 */

export interface PilihanMurottal {
  /** Id ringkas yang disimpan di pengaturan (`murottal_reciter`). */
  id: string;
  /** Nama reciter untuk dropdown admin. */
  nama: string;
  /** Keterangan gaya/kualitas rekaman. */
  keterangan: string;
  /** Subdirektori EveryAyah tempat berkas mp3 per ayat berada. */
  subdir: string;
}

/** Id reciter bawaan (Mishary Rashid Alafasy) — sama seperti sebelum fitur ini ada. */
export const ID_MUROTTAL_BAWAAN = "alafasy";

/** Subdirektori EveryAyah untuk reciter bawaan. */
export const SUBDIR_MUROTTAL_BAWAAN = "Alafasy_128kbps";

export const PILIHAN_MUROTTAL: PilihanMurottal[] = [
  {
    id: "alafasy",
    nama: "Mishary Rashid Alafasy",
    keterangan: "Murattal jernih 128 kbps, favorit papan informasi",
    subdir: "Alafasy_128kbps",
  },
  {
    id: "abdul-basit",
    nama: "Abdul Basit Abdul Samad",
    keterangan: "Murattal legendaris Mesir, tempo tartil",
    subdir: "Abdul_Basit_Murattal_64kbps",
  },
  {
    id: "husary",
    nama: "Mahmoud Khalil Al-Husary",
    keterangan: "Murattal 128 kbps, tajwid sangat terjaga",
    subdir: "Husary_128kbps",
  },
  {
    id: "husary-muallim",
    nama: "Al-Husary Muallim",
    keterangan: "Dengan pengulangan per ayat — cocok untuk hafalan",
    subdir: "Husary_Muallim_128kbps",
  },
  {
    id: "minshawi",
    nama: "Mohamed Siddiq El-Minshawi",
    keterangan: "Murattal 128 kbps, suara lembut dan tenang",
    subdir: "Minshawy_Murattal_128kbps",
  },
  {
    id: "maher",
    nama: "Maher Al-Muaiqly",
    keterangan: "Imam Masjidil Haram, murattal 128 kbps",
    subdir: "MaherAlMuaiqly128kbps",
  },
  {
    id: "sudais",
    nama: "Abdurrahman As-Sudais",
    keterangan: "Imam Masjidil Haram, murattal 192 kbps",
    subdir: "Abdurrahmaan_As-Sudais_192kbps",
  },
  {
    id: "shuraym",
    nama: "Saood ash-Shuraym",
    keterangan: "Imam Masjidil Haram, murattal 128 kbps",
    subdir: "Saood_ash-Shuraym_128kbps",
  },
  {
    id: "hudhaify",
    nama: "Ali Al-Hudhaify",
    keterangan: "Imam Masjid Nabawi, murattal 128 kbps",
    subdir: "Hudhaify_128kbps",
  },
  {
    id: "juhany",
    nama: "Abdullah Awwad Al-Juhany",
    keterangan: "Imam Masjidil Haram, murattal 128 kbps",
    subdir: "Abdullaah_3awwaad_Al-Juhaynee_128kbps",
  },
  {
    id: "ghamdi",
    nama: "Saad Al-Ghamdi",
    keterangan: "Murattal populer, kualitas 40 kbps",
    subdir: "Ghamadi_40kbps",
  },
  {
    id: "ajamy",
    nama: "Ahmed ibn Ali Al-Ajamy",
    keterangan: "Murattal 128 kbps, irama khas",
    subdir: "Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net",
  },
];

export function cariPilihanMurottal(id?: string | null): PilihanMurottal | null {
  if (!id) return null;
  return PILIHAN_MUROTTAL.find((p) => p.id === id) ?? null;
}

/** Subdirektori EveryAyah yang dipakai pemutar; jatuh ke bawaan bila id tak dikenal. */
export function subdirMurottal(id?: string | null): string {
  return cariPilihanMurottal(id)?.subdir ?? SUBDIR_MUROTTAL_BAWAAN;
}

/** Nama reciter yang sedang aktif, untuk ditampilkan di panel admin. */
export function namaPilihanMurottal(id?: string | null): string {
  return cariPilihanMurottal(id)?.nama ?? "Mishary Rashid Alafasy (bawaan)";
}
