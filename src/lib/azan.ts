/**
 * Katalog pilihan suara adzan.
 *
 * Modul ini murni data + fungsi tanpa akses jaringan/database sehingga aman
 * diimpor komponen klien (dropdown admin maupun papan informasi).
 *
 * Selain dua belas pilihan yang tersedia, admin dapat mengunggah berkas adzan
 * sendiri (.mp3/.ogg/.wav/.m4a) atau menempelkan tautan https. Karena adzan
 * adalah suara khas masjid, pemilihan tetap diserahkan ke pengurus.
 */

export interface PilihanAdzan {
  id: string;
  nama: string;
  keterangan: string;
  /** Tautan absolut (https) untuk pilihan bawaan. */
  url: string;
}

/** Id khusus untuk menandai bahwa suara diambil dari unggahan/tautan admin. */
export const ID_ADZAN_KUSTOM = "kustom";

/** Awalan berkas unggahan adzan yang dilayani aplikasi sendiri. */
export const AWALAN_MEDIA_ADZAN = "/api/media/azan/";

/**
 * Dua belas variasi adzan dari arsip IslamCan (berkas mp3 mandiri, sudah
 * diperiksa tersedia dan dapat diputar langsung peramban).
 */
export const PILIHAN_ADZAN: PilihanAdzan[] = Array.from({ length: 12 }, (_, i) => {
  const nomor = i + 1;
  return {
    id: `adzan-${nomor}`,
    nama: `Adzan — Variasi ${nomor}`,
    keterangan: `Rekaman adzan variasi ${nomor} dari arsip IslamCan`,
    url: `https://www.islamcan.com/audio/adhan/azan${nomor}.mp3`,
  };
});

export const PILIHAN_ADZAN_KUSTOM: PilihanAdzan = {
  id: ID_ADZAN_KUSTOM,
  nama: "Suara kustom (unggahan / tautan sendiri)",
  keterangan: "Pakai berkas adzan yang diunggah atau tautan https milik Anda",
  url: "",
};

/**
 * Pilihan rekaman adzan khusus Subuh yang menyertakan lafaz tatswib:
 * « الصَّلَاةُ خَيْرٌ مِنَ النَّوْمِ » (Ash-shalatu khairum minan-naum).
 */
export const PILIHAN_ADZAN_SUBUH: PilihanAdzan[] = [
  {
    id: "adzan-subuh-bawaan",
    nama: "Adzan Subuh — Syaikh Misyari Rasyid (dengan Tatswib)",
    keterangan: "Rekaman merdu lengkap dengan lafaz Ash-shalatu khairum minan-naum (offline)",
    url: "/audio/adzan-subuh.mp3",
  },
  {
    id: "adzan-subuh-makkah",
    nama: "Adzan Subuh — Masjidil Haram Makkah",
    keterangan: "Rekaman kumandang adzan fajar dari Masjidil Haram Makkah Al-Mukarramah",
    url: "https://raw.githubusercontent.com/AalianKhan/adhans/master/adhan_fajr.mp3",
  },
];

export function cariPilihanAdzan(id?: string | null): PilihanAdzan | null {
  if (!id) return null;
  if (id === ID_ADZAN_KUSTOM) return PILIHAN_ADZAN_KUSTOM;
  return PILIHAN_ADZAN.find((p) => p.id === id) ?? null;
}

export function cariPilihanAdzanSubuh(id?: string | null): PilihanAdzan | null {
  if (!id) return null;
  if (id === ID_ADZAN_KUSTOM) return PILIHAN_ADZAN_KUSTOM;
  return PILIHAN_ADZAN_SUBUH.find((p) => p.id === id) ?? null;
}

/**
 * Tautan suara hanya diterima bila https (tidak boleh http agar tidak diblokir
 * sebagai mixed content) atau berkas yang dilayani aplikasi ini sendiri.
 */
export function urlSuaraValid(url: string): boolean {
  const bersih = url.trim();
  if (!bersih) return false;
  if (bersih.startsWith(AWALAN_MEDIA_ADZAN)) {
    return /^\/api\/media\/azan\/[A-Za-z0-9._-]+$/.test(bersih);
  }
  try {
    const u = new URL(bersih);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Tentukan tautan adzan yang benar-benar dipakai pemutar, berdasarkan pilihan
 * dan tautan kustom. Mengembalikan string kosong bila tidak ada yang sah.
 */
export function resolveAdzanUrl(
  pilihanId?: string | null,
  urlKustom?: string | null
): string {
  const kustom = (urlKustom ?? "").trim();
  const pilihan = cariPilihanAdzan(pilihanId);

  if (pilihan?.id === ID_ADZAN_KUSTOM || !pilihan) {
    return urlSuaraValid(kustom) ? kustom : "";
  }

  // Bila admin sudah menyediakan tautan kustom, hormati itu.
  if (urlSuaraValid(kustom)) return kustom;

  return pilihan.url;
}

/** Nama pilihan adzan yang sedang aktif, untuk ditampilkan di panel admin. */
export function namaPilihanAdzan(
  pilihanId?: string | null,
  urlKustom?: string | null
): string {
  if (urlSuaraValid(urlKustom ?? "")) {
    return pilihanId === ID_ADZAN_KUSTOM
      ? "Suara kustom"
      : `Suara kustom (mengalahkan ${
          cariPilihanAdzan(pilihanId)?.nama ?? "pilihan bawaan"
        })`;
  }
  return cariPilihanAdzan(pilihanId)?.nama ?? "Tidak ada";
}

/**
 * Tentukan tautan adzan Subuh yang dipakai pemutar.
 * Bila belum ditentukan, otomatis menggunakan adzan subuh bawaan (dengan tatswib).
 */
export function resolveAdzanSubuhUrl(
  pilihanId?: string | null,
  urlKustom?: string | null
): string {
  const kustom = (urlKustom ?? "").trim();
  if (urlSuaraValid(kustom)) return kustom;

  const pilihan = cariPilihanAdzanSubuh(pilihanId ?? "adzan-subuh-bawaan");
  if (pilihan?.url) return pilihan.url;

  return "/audio/adzan-subuh.mp3";
}

/** Nama pilihan adzan Subuh yang sedang aktif untuk label admin. */
export function namaPilihanAdzanSubuh(
  pilihanId?: string | null,
  urlKustom?: string | null
): string {
  if (urlSuaraValid(urlKustom ?? "")) {
    return pilihanId === ID_ADZAN_KUSTOM
      ? "Suara kustom"
      : `Suara kustom (mengalahkan ${
          cariPilihanAdzanSubuh(pilihanId)?.nama ?? "pilihan bawaan"
        })`;
  }
  return cariPilihanAdzanSubuh(pilihanId ?? "adzan-subuh-bawaan")?.nama ?? "Bawaan Subuh (dengan Tatswib)";
}

