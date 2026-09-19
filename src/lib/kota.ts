/**
 * Katalog lokasi jadwal shalat.
 *
 * Setiap entri memuat koordinat kota (derajat desimal) sehingga jadwal dapat
 * dihitung dari titik pasti alih-alih mengandalkan geocoding nama kota di
 * penyedia API. Koordinat sudah diverifikasi terhadap layanan geocoding
 * Open-Meteo (selisih <= 0,05 derajat ~ 12 detik waktu surya untuk 92 dari 98
 * kota; sisanya dikoreksi manual karena geocoder menemukan kota bernama sama di
 * provinsi lain).
 *
 * Modul ini murni data + fungsi tanpa akses database maupun jaringan, jadi aman
 * diimpor komponen klien (dropdown admin) maupun server.
 */

export type Zona = "Asia/Jakarta" | "Asia/Makassar" | "Asia/Jayapura";

export const ZONA_DEFAULT: Zona = "Asia/Jakarta";

export interface Kota {
  nama: string;
  provinsi: string;
  /** Zona waktu resmi Indonesia untuk provinsi tersebut. */
  zona: Zona;
  lat: number;
  lon: number;
}

/** Label ringkas zona waktu, mis. "WIB (UTC+7)". */
export const LABEL_ZONA: Record<Zona, string> = {
  "Asia/Jakarta": "WIB (UTC+7)",
  "Asia/Makassar": "WITA (UTC+8)",
  "Asia/Jayapura": "WIT (UTC+9)",
};

export const KOTA_INDONESIA: Kota[] = [
  // Aceh
  { nama: "Banda Aceh", provinsi: "Aceh", zona: "Asia/Jakarta", lat: 5.5483, lon: 95.3238 },
  { nama: "Lhokseumawe", provinsi: "Aceh", zona: "Asia/Jakarta", lat: 5.1801, lon: 97.1507 },
  { nama: "Sabang", provinsi: "Aceh", zona: "Asia/Jakarta", lat: 5.8933, lon: 95.3214 },
  { nama: "Meulaboh", provinsi: "Aceh", zona: "Asia/Jakarta", lat: 4.1363, lon: 96.1285 },
  // Sumatera Utara
  { nama: "Medan", provinsi: "Sumatera Utara", zona: "Asia/Jakarta", lat: 3.5952, lon: 98.6722 },
  { nama: "Pematangsiantar", provinsi: "Sumatera Utara", zona: "Asia/Jakarta", lat: 2.9595, lon: 99.0687 },
  { nama: "Binjai", provinsi: "Sumatera Utara", zona: "Asia/Jakarta", lat: 3.6001, lon: 98.4852 },
  { nama: "Padang Sidempuan", provinsi: "Sumatera Utara", zona: "Asia/Jakarta", lat: 1.3783, lon: 99.2708 },
  { nama: "Tebing Tinggi", provinsi: "Sumatera Utara", zona: "Asia/Jakarta", lat: 3.3284, lon: 99.1624 },
  // Sumatera Barat
  { nama: "Padang", provinsi: "Sumatera Barat", zona: "Asia/Jakarta", lat: -0.9492, lon: 100.3543 },
  { nama: "Bukittinggi", provinsi: "Sumatera Barat", zona: "Asia/Jakarta", lat: -0.3055, lon: 100.3692 },
  // Riau
  { nama: "Pekanbaru", provinsi: "Riau", zona: "Asia/Jakarta", lat: 0.5071, lon: 101.4478 },
  { nama: "Dumai", provinsi: "Riau", zona: "Asia/Jakarta", lat: 1.6667, lon: 101.45 },
  // Kepulauan Riau
  { nama: "Batam", provinsi: "Kepulauan Riau", zona: "Asia/Jakarta", lat: 1.0456, lon: 104.0305 },
  { nama: "Tanjungpinang", provinsi: "Kepulauan Riau", zona: "Asia/Jakarta", lat: 0.9186, lon: 104.455 },
  // Jambi
  { nama: "Jambi", provinsi: "Jambi", zona: "Asia/Jakarta", lat: -1.6101, lon: 103.6131 },
  // Sumatera Selatan
  { nama: "Palembang", provinsi: "Sumatera Selatan", zona: "Asia/Jakarta", lat: -2.9167, lon: 104.7458 },
  { nama: "Lubuklinggau", provinsi: "Sumatera Selatan", zona: "Asia/Jakarta", lat: -3.2966, lon: 102.8614 },
  { nama: "Prabumulih", provinsi: "Sumatera Selatan", zona: "Asia/Jakarta", lat: -3.4341, lon: 104.2357 },
  // Bengkulu
  { nama: "Bengkulu", provinsi: "Bengkulu", zona: "Asia/Jakarta", lat: -3.8004, lon: 102.2655 },
  // Lampung
  { nama: "Bandar Lampung", provinsi: "Lampung", zona: "Asia/Jakarta", lat: -5.3971, lon: 105.2668 },
  { nama: "Metro", provinsi: "Lampung", zona: "Asia/Jakarta", lat: -5.1131, lon: 105.3067 },
  // Kepulauan Bangka Belitung
  { nama: "Pangkalpinang", provinsi: "Kepulauan Bangka Belitung", zona: "Asia/Jakarta", lat: -2.1316, lon: 106.1169 },
  // DKI Jakarta
  { nama: "Jakarta", provinsi: "DKI Jakarta", zona: "Asia/Jakarta", lat: -6.2088, lon: 106.8456 },
  // Jawa Barat
  { nama: "Bekasi", provinsi: "Jawa Barat", zona: "Asia/Jakarta", lat: -6.2383, lon: 106.9756 },
  { nama: "Depok", provinsi: "Jawa Barat", zona: "Asia/Jakarta", lat: -6.4025, lon: 106.7942 },
  { nama: "Bogor", provinsi: "Jawa Barat", zona: "Asia/Jakarta", lat: -6.5971, lon: 106.806 },
  { nama: "Bandung", provinsi: "Jawa Barat", zona: "Asia/Jakarta", lat: -6.9175, lon: 107.6191 },
  { nama: "Cirebon", provinsi: "Jawa Barat", zona: "Asia/Jakarta", lat: -6.732, lon: 108.5523 },
  { nama: "Sukabumi", provinsi: "Jawa Barat", zona: "Asia/Jakarta", lat: -6.9277, lon: 106.93 },
  { nama: "Tasikmalaya", provinsi: "Jawa Barat", zona: "Asia/Jakarta", lat: -7.35, lon: 108.2167 },
  { nama: "Cimahi", provinsi: "Jawa Barat", zona: "Asia/Jakarta", lat: -6.8722, lon: 107.5425 },
  { nama: "Garut", provinsi: "Jawa Barat", zona: "Asia/Jakarta", lat: -7.2103, lon: 107.9025 },
  { nama: "Karawang", provinsi: "Jawa Barat", zona: "Asia/Jakarta", lat: -6.3227, lon: 107.3376 },
  { nama: "Purwakarta", provinsi: "Jawa Barat", zona: "Asia/Jakarta", lat: -6.5566, lon: 107.4436 },
  { nama: "Subang", provinsi: "Jawa Barat", zona: "Asia/Jakarta", lat: -6.5716, lon: 107.7583 },
  { nama: "Indramayu", provinsi: "Jawa Barat", zona: "Asia/Jakarta", lat: -6.3373, lon: 108.3262 },
  // Banten
  { nama: "Tangerang", provinsi: "Banten", zona: "Asia/Jakarta", lat: -6.1781, lon: 106.63 },
  { nama: "Serang", provinsi: "Banten", zona: "Asia/Jakarta", lat: -6.1104, lon: 106.15 },
  // Jawa Tengah
  { nama: "Semarang", provinsi: "Jawa Tengah", zona: "Asia/Jakarta", lat: -6.9932, lon: 110.4203 },
  { nama: "Surakarta", provinsi: "Jawa Tengah", zona: "Asia/Jakarta", lat: -7.5561, lon: 110.8317 },
  { nama: "Magelang", provinsi: "Jawa Tengah", zona: "Asia/Jakarta", lat: -7.47, lon: 110.2177 },
  { nama: "Purwokerto", provinsi: "Jawa Tengah", zona: "Asia/Jakarta", lat: -7.424, lon: 109.2396 },
  { nama: "Tegal", provinsi: "Jawa Tengah", zona: "Asia/Jakarta", lat: -6.8694, lon: 109.1402 },
  { nama: "Kudus", provinsi: "Jawa Tengah", zona: "Asia/Jakarta", lat: -6.8048, lon: 110.8405 },
  { nama: "Pekalongan", provinsi: "Jawa Tengah", zona: "Asia/Jakarta", lat: -6.8886, lon: 109.6753 },
  { nama: "Klaten", provinsi: "Jawa Tengah", zona: "Asia/Jakarta", lat: -7.7057, lon: 110.6061 },
  { nama: "Cilacap", provinsi: "Jawa Tengah", zona: "Asia/Jakarta", lat: -7.7267, lon: 109.0094 },
  { nama: "Salatiga", provinsi: "Jawa Tengah", zona: "Asia/Jakarta", lat: -7.3305, lon: 110.5084 },
  // DI Yogyakarta
  { nama: "Yogyakarta", provinsi: "DI Yogyakarta", zona: "Asia/Jakarta", lat: -7.7971, lon: 110.3706 },
  // Jawa Timur
  { nama: "Surabaya", provinsi: "Jawa Timur", zona: "Asia/Jakarta", lat: -7.2575, lon: 112.7521 },
  { nama: "Malang", provinsi: "Jawa Timur", zona: "Asia/Jakarta", lat: -7.9666, lon: 112.6326 },
  { nama: "Kediri", provinsi: "Jawa Timur", zona: "Asia/Jakarta", lat: -7.8167, lon: 112.0167 },
  { nama: "Jember", provinsi: "Jawa Timur", zona: "Asia/Jakarta", lat: -8.1689, lon: 113.7021 },
  { nama: "Madiun", provinsi: "Jawa Timur", zona: "Asia/Jakarta", lat: -7.6298, lon: 111.5239 },
  { nama: "Sidoarjo", provinsi: "Jawa Timur", zona: "Asia/Jakarta", lat: -7.4478, lon: 112.7183 },
  { nama: "Probolinggo", provinsi: "Jawa Timur", zona: "Asia/Jakarta", lat: -7.7543, lon: 113.2159 },
  { nama: "Banyuwangi", provinsi: "Jawa Timur", zona: "Asia/Jakarta", lat: -8.2192, lon: 114.3691 },
  { nama: "Pasuruan", provinsi: "Jawa Timur", zona: "Asia/Jakarta", lat: -7.6469, lon: 112.9075 },
  { nama: "Gresik", provinsi: "Jawa Timur", zona: "Asia/Jakarta", lat: -7.1567, lon: 112.6555 },
  { nama: "Bangkalan", provinsi: "Jawa Timur", zona: "Asia/Jakarta", lat: -7.0455, lon: 112.7381 },
  // Bali
  { nama: "Denpasar", provinsi: "Bali", zona: "Asia/Makassar", lat: -8.65, lon: 115.2167 },
  { nama: "Singaraja", provinsi: "Bali", zona: "Asia/Makassar", lat: -8.1121, lon: 115.0882 },
  // Nusa Tenggara Barat
  { nama: "Mataram", provinsi: "Nusa Tenggara Barat", zona: "Asia/Makassar", lat: -8.5833, lon: 116.1167 },
  // Nusa Tenggara Timur
  { nama: "Kupang", provinsi: "Nusa Tenggara Timur", zona: "Asia/Makassar", lat: -10.1772, lon: 123.607 },
  // Kalimantan Barat
  { nama: "Pontianak", provinsi: "Kalimantan Barat", zona: "Asia/Jakarta", lat: -0.0263, lon: 109.3425 },
  { nama: "Singkawang", provinsi: "Kalimantan Barat", zona: "Asia/Jakarta", lat: 0.9046, lon: 108.9853 },
  { nama: "Ketapang", provinsi: "Kalimantan Barat", zona: "Asia/Jakarta", lat: -1.8207, lon: 109.9769 },
  // Kalimantan Tengah
  { nama: "Palangkaraya", provinsi: "Kalimantan Tengah", zona: "Asia/Jakarta", lat: -2.208, lon: 113.9165 },
  { nama: "Sampit", provinsi: "Kalimantan Tengah", zona: "Asia/Jakarta", lat: -2.5333, lon: 112.95 },
  // Kalimantan Selatan
  { nama: "Banjarmasin", provinsi: "Kalimantan Selatan", zona: "Asia/Makassar", lat: -3.3186, lon: 114.5944 },
  { nama: "Banjarbaru", provinsi: "Kalimantan Selatan", zona: "Asia/Makassar", lat: -3.4408, lon: 114.8283 },
  // Kalimantan Timur
  { nama: "Samarinda", provinsi: "Kalimantan Timur", zona: "Asia/Makassar", lat: -0.5022, lon: 117.1536 },
  { nama: "Balikpapan", provinsi: "Kalimantan Timur", zona: "Asia/Makassar", lat: -1.2379, lon: 116.8529 },
  // Kalimantan Utara
  { nama: "Tarakan", provinsi: "Kalimantan Utara", zona: "Asia/Makassar", lat: 3.3274, lon: 117.5759 },
  { nama: "Tanjung Selor", provinsi: "Kalimantan Utara", zona: "Asia/Makassar", lat: 2.8375, lon: 117.3665 },
  // Sulawesi Utara
  { nama: "Manado", provinsi: "Sulawesi Utara", zona: "Asia/Makassar", lat: 1.4748, lon: 124.8421 },
  { nama: "Bitung", provinsi: "Sulawesi Utara", zona: "Asia/Makassar", lat: 1.4404, lon: 125.1216 },
  // Sulawesi Tengah
  { nama: "Palu", provinsi: "Sulawesi Tengah", zona: "Asia/Makassar", lat: -0.8917, lon: 119.8707 },
  // Sulawesi Selatan
  { nama: "Makassar", provinsi: "Sulawesi Selatan", zona: "Asia/Makassar", lat: -5.1477, lon: 119.4327 },
  // Sulawesi Tenggara
  { nama: "Kendari", provinsi: "Sulawesi Tenggara", zona: "Asia/Makassar", lat: -3.9778, lon: 122.515 },
  { nama: "Baubau", provinsi: "Sulawesi Tenggara", zona: "Asia/Makassar", lat: -5.4695, lon: 122.6166 },
  // Gorontalo
  { nama: "Gorontalo", provinsi: "Gorontalo", zona: "Asia/Makassar", lat: 0.5375, lon: 123.0625 },
  // Sulawesi Barat
  { nama: "Mamuju", provinsi: "Sulawesi Barat", zona: "Asia/Makassar", lat: -2.6767, lon: 118.8885 },
  // Maluku
  { nama: "Ambon", provinsi: "Maluku", zona: "Asia/Jayapura", lat: -3.6954, lon: 128.1814 },
  { nama: "Banda Neira", provinsi: "Maluku", zona: "Asia/Jayapura", lat: -4.5258, lon: 129.8981 },
  { nama: "Tual", provinsi: "Maluku", zona: "Asia/Jayapura", lat: -5.6369, lon: 132.7469 },
  // Maluku Utara
  { nama: "Ternate", provinsi: "Maluku Utara", zona: "Asia/Jayapura", lat: 0.79, lon: 127.38 },
  { nama: "Sofifi", provinsi: "Maluku Utara", zona: "Asia/Jayapura", lat: 0.7369, lon: 127.5804 },
  // Papua
  { nama: "Jayapura", provinsi: "Papua", zona: "Asia/Jayapura", lat: -2.5337, lon: 140.7181 },
  { nama: "Biak", provinsi: "Papua", zona: "Asia/Jayapura", lat: -1.1767, lon: 136.082 },
  // Papua Barat
  { nama: "Manokwari", provinsi: "Papua Barat", zona: "Asia/Jayapura", lat: -0.8615, lon: 134.062 },
  { nama: "Fakfak", provinsi: "Papua Barat", zona: "Asia/Jayapura", lat: -2.9265, lon: 132.2967 },
  // Papua Barat Daya
  { nama: "Sorong", provinsi: "Papua Barat Daya", zona: "Asia/Jayapura", lat: -0.8833, lon: 131.25 },
  // Papua Selatan
  { nama: "Merauke", provinsi: "Papua Selatan", zona: "Asia/Jayapura", lat: -8.4932, lon: 140.4018 },
  // Papua Tengah
  { nama: "Timika", provinsi: "Papua Tengah", zona: "Asia/Jayapura", lat: -4.6141, lon: 136.6768 },
  { nama: "Nabire", provinsi: "Papua Tengah", zona: "Asia/Jayapura", lat: -3.35, lon: 135.4833 },
  // Papua Pegunungan
  { nama: "Wamena", provinsi: "Papua Pegunungan", zona: "Asia/Jayapura", lat: -4.0996, lon: 138.945 },
];

export const KOTA_DEFAULT: Kota = {
  nama: "Jakarta",
  provinsi: "DKI Jakarta",
  zona: "Asia/Jakarta",
  lat: -6.2088,
  lon: 106.8456,
};

export function cariKota(nama?: string | null): Kota | null {
  const bersih = (nama ?? "").trim().toLowerCase();
  if (!bersih) return null;
  return (
    KOTA_INDONESIA.find((k) => k.nama.toLowerCase() === bersih) ?? null
  );
}

/**
 * Hitung jarak lingkaran besar (Haversine) antara dua titik koordinat dalam kilometer.
 */
export function hitungJarakKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius bumi dalam km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Cari kota Indonesia terdekat berdasarkan koordinat lintang/bujur (GPS atau Jaringan).
 * Jika koordinat berada di luar wilayah Indonesia (jarak > 1000 km) atau tidak valid,
 * secara otomatis jatuh kembali ke default Jakarta.
 */
export function cariKotaTerdekat(lat: number, lon: number): Kota {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return KOTA_DEFAULT;
  }

  let terdekat: Kota = KOTA_DEFAULT;
  let jarakMinimal = Infinity;

  for (const k of KOTA_INDONESIA) {
    const jarak = hitungJarakKm(lat, lon, k.lat, k.lon);
    if (jarak < jarakMinimal) {
      jarakMinimal = jarak;
      terdekat = k;
    }
  }

  // Jika jarak ke kota Indonesia terdekat > 1000 km (di luar Indonesia),
  // default kembali ke Jakarta.
  if (jarakMinimal > 1000) {
    return KOTA_DEFAULT;
  }

  return terdekat;
}

/**
 * Ubah masukan bebas menjadi kota kanonik. Nama yang tidak dikenal tetap
 * diteruskan (agar admin bebas memakai kota di luar daftar) namun dipinjamkan
 * zonanya dari provinsi terdekat bila ada kecocokan sebagian.
 * Jika tidak terisi/kosong, default adalah Jakarta.
 */
export function normalisasiLokasi(input?: string | null): {
  kota: string;
  provinsi: string | null;
  zona: Zona;
  koordinat: { lat: number; lon: number } | null;
} {
  const bersih = (input ?? "").trim();
  if (!bersih) {
    const bawaan = cariKota("Jakarta") ?? KOTA_DEFAULT;
    return {
      kota: bawaan.nama,
      provinsi: bawaan.provinsi,
      zona: bawaan.zona,
      koordinat: { lat: bawaan.lat, lon: bawaan.lon },
    };
  }

  const tepat = cariKota(bersih);
  if (tepat) {
    return {
      kota: tepat.nama,
      provinsi: tepat.provinsi,
      zona: tepat.zona,
      koordinat: { lat: tepat.lat, lon: tepat.lon },
    };
  }

  const mirip = KOTA_INDONESIA.find((k) =>
    k.nama.toLowerCase().includes(bersih.toLowerCase())
  );
  if (mirip) {
    return {
      kota: mirip.nama,
      provinsi: mirip.provinsi,
      zona: mirip.zona,
      koordinat: { lat: mirip.lat, lon: mirip.lon },
    };
  }

  return {
    kota: bersih,
    provinsi: null,
    zona: ZONA_DEFAULT,
    koordinat: null,
  };
}

/** Provinsi unik untuk pengelompokan dropdown, terurut abjad. */
export function provinsiTerurut(): string[] {
  return [...new Set(KOTA_INDONESIA.map((k) => k.provinsi))].sort((a, b) =>
    a.localeCompare(b, "id")
  );
}

/** Kota dikelompokkan per provinsi, siap dipakai elemen <optgroup>. */
export function kotaPerProvinsi(): { provinsi: string; kota: Kota[] }[] {
  return provinsiTerurut().map((provinsi) => ({
    provinsi,
    kota: KOTA_INDONESIA.filter((k) => k.provinsi === provinsi),
  }));
}
