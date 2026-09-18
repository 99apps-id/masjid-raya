import prisma from "@/lib/prisma";
import type { Kota, Zona } from "@/lib/kota";
import { normalisasiLokasi } from "@/lib/kota";
import { hisabWaktuShalat } from "@/lib/hisab";
import {
  awalHariUtc,
  hijriahLokal,
  kunciTanggal,
  tambahMenit,
  tambahMenitIhtiyati,
  type JadwalHarian,
  type PrayerTimes,
} from "@/lib/waktu";

/**
 * Modul ini hanya boleh dipakai di server karena menyentuh database. Semua
 * utilitas waktu murni tinggal di `waktu.ts` agar bisa dipakai komponen klien.
 */

export * from "@/lib/waktu";

/** Offset Dhuha dari syuruq, mengikuti kebiasaan jadwal Kemenag RI. */
const OFFSET_DHUHA_MENIT = 18;
const TIMEOUT_ALADHAN_MS = 8000;

/** Offset jam dari UTC untuk setiap zona waktu Indonesia. */
export const OFFSET_ZONA_JAM: Record<Zona, number> = {
  "Asia/Jakarta": 7,
  "Asia/Makassar": 8,
  "Asia/Jayapura": 9,
};

export type SumberJadwal = "hisab" | "aladhan";

function rapikanWaktu(nilai: unknown, fallback: string): string {
  if (typeof nilai !== "string") return fallback;
  const dipotong = nilai.trim().slice(0, 5);
  return /^\d{2}:\d{2}$/.test(dipotong) ? dipotong : fallback;
}

/**
 * Hisab lokal: selalu tersedia, tidak bergantung layanan pihak ketiga, dan
 * dapat dihitung untuk tanggal mana pun. Ini sumber utama jadwal.
 */
export function hitungJadwalLokal(
  kota: Kota,
  kunciTanggalHari: string,
  ihtiyatiMenit: number
): PrayerTimes {
  const dasar = hisabWaktuShalat({
    latitude: kota.lat,
    longitude: kota.lon,
    offsetZonaJam: OFFSET_ZONA_JAM[kota.zona],
    tanggal: kunciTanggalHari,
  });

  return {
    imsak: tambahMenitIhtiyati(dasar.imsak, ihtiyatiMenit),
    subuh: tambahMenitIhtiyati(dasar.subuh, ihtiyatiMenit),
    terbit: tambahMenitIhtiyati(dasar.terbit, ihtiyatiMenit),
    dhuha: tambahMenitIhtiyati(
      tambahMenit(dasar.terbit, OFFSET_DHUHA_MENIT),
      ihtiyatiMenit
    ),
    zuhur: tambahMenitIhtiyati(dasar.zuhur, ihtiyatiMenit),
    ashar: tambahMenitIhtiyati(dasar.ashar, ihtiyatiMenit),
    maghrib: tambahMenitIhtiyati(dasar.maghrib, ihtiyatiMenit),
    isya: tambahMenitIhtiyati(dasar.isya, ihtiyatiMenit),
  };
}

/**
 * Ambil jadwal dari Aladhan API memakai metode 20 (Kementerian Agama RI).
 * Hanya dipakai bila admin memilihnya secara eksplisit; hasilnya bisa berbeda
 * beberapa menit karena layanan ini tidak menambahkan ihtiyati.
 */
async function fetchAladhan(
  kota: Kota,
  kunciTanggalHari: string
): Promise<PrayerTimes | null> {
  const [year, month, day] = kunciTanggalHari.split("-");
  const url = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${kota.lat}&longitude=${kota.lon}&method=20`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_ALADHAN_MS);

  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      data?: { timings?: Record<string, string> };
    };
    const timings = json.data?.timings;
    if (!timings) return null;

    const terbitMentah = rapikanWaktu(timings.Sunrise, "06:00");
    return {
      imsak: rapikanWaktu(timings.Imsak, "04:30"),
      subuh: rapikanWaktu(timings.Fajr, "04:45"),
      terbit: terbitMentah,
      dhuha: tambahMenit(terbitMentah, OFFSET_DHUHA_MENIT),
      zuhur: rapikanWaktu(timings.Dhuhr, "12:05"),
      ashar: rapikanWaktu(timings.Asr, "15:15"),
      maghrib: rapikanWaktu(timings.Maghrib, "18:10"),
      isya: rapikanWaktu(timings.Isha, "19:15"),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function bacaDatabase(
  kota: string,
  kunciTanggalHari: string
): Promise<JadwalHarian | null> {
  const awal = awalHariUtc(kunciTanggalHari);
  const akhir = new Date(awal.getTime() + 24 * 60 * 60 * 1000);

  const baris = await prisma.jadwalShalat.findFirst({
    where: {
      tanggal: { gte: awal, lt: akhir },
      lokasi: kota,
    },
    orderBy: { createdAt: "desc" },
  });
  if (!baris) return null;

  const kanonik = normalisasiLokasi(baris.lokasi);
  const sumber: JadwalHarian["sumber"] =
    baris.sumber === "manual" || baris.sumber === "aladhan" ? baris.sumber : "hisab";

  return {
    imsak: baris.imsak,
    subuh: baris.subuh,
    terbit: baris.terbit ?? "-",
    dhuha: baris.dhuha ?? "-",
    zuhur: baris.zuhur,
    ashar: baris.ashar,
    maghrib: baris.maghrib,
    isya: baris.isya,
    lokasi: baris.lokasi,
    provinsi: baris.provinsi,
    zona: kanonik.zona,
    tanggal: kunciTanggalHari,
    hijriah: null,
    sumber,
    dariCache: true,
  };
}

/** Berapa hari ke depan/belakang yang boleh disimpan ke cache. */
const JENDELA_CACHE_HARI = { mundur: 1, maju: 2 };

/**
 * Cache hanya ditulis untuk tanggal di sekitar hari ini. Tanpa batas ini,
 * permintaan dengan tanggal sembarang (mis. dari perayap) akan membuat baris
 * baru tanpa henti dan menggelembungkan database — sementara halaman hanya
 * pernah menampilkan jadwal hari ini dan beberapa hari sekitarnya.
 */
function dalamJendelaCache(kunciTarget: string, zona: Zona): boolean {
  const hariIni = kunciTanggal(new Date(), zona);
  const selisihHari =
    (awalHariUtc(kunciTarget).getTime() - awalHariUtc(hariIni).getTime()) / 86_400_000;
  return selisihHari >= -JENDELA_CACHE_HARI.mundur && selisihHari <= JENDELA_CACHE_HARI.maju;
}

async function simpanKeDatabase(
  kota: Kota,
  kunciTanggalHari: string,
  times: PrayerTimes,
  sumber: "hisab" | "aladhan"
): Promise<void> {
  if (!dalamJendelaCache(kunciTanggalHari, kota.zona)) return;

  const tanggal = awalHariUtc(kunciTanggalHari);
  try {
    // Jadwal yang sudah disunting admin adalah keputusan manusia (mis. koreksi
    // sesuai jadwal masjid setempat) dan tidak boleh ditimpa perhitungan
    // otomatis.
    const tersimpan = await prisma.jadwalShalat.findUnique({
      where: { tanggal_lokasi: { tanggal, lokasi: kota.nama } },
      select: { sumber: true },
    });
    if (tersimpan?.sumber === "manual") return;

    // Tabel memakai unique (tanggal, lokasi). Upsert dipakai alih-alih
    // hapus-lalu-buat agar dua permintaan bersamaan tidak saling menabrak
    // batasan unik.
    await prisma.jadwalShalat.upsert({
      where: { tanggal_lokasi: { tanggal, lokasi: kota.nama } },
      update: { provinsi: kota.provinsi, sumber, ...times },
      create: { tanggal, lokasi: kota.nama, provinsi: kota.provinsi, sumber, ...times },
    });
  } catch (error) {
    console.error("Gagal menyimpan cache jadwal:", error);
  }
}

export interface OpsiJadwal {
  /** Lewati cache database dan hitung ulang (dipakai saat pengaturan berubah). */
  segarkan?: boolean;
  /** Sumber perhitungan yang dipilih admin. */
  sumber?: SumberJadwal;
  /** Tambahan keamanan (ihtiyati) dalam menit. */
  ihtiyatiMenit?: number;
  /** Penyesuaian tanggal Hijriah (hari) mengikuti pengaturan admin. */
  hijriahOffsetHari?: number;
}

/**
 * Jadwal shalat terkini untuk satu lokasi pada satu tanggal kalender lokal.
 *
 * Urutan sumber:
 *   1. baris database hari itu (hasil hisab yang di-cache, atau jadwal yang
 *      disunting admin secara manual — suntingan admin harus selalu menang);
 *   2. hisab lokal (selalu berhasil, tidak butuh jaringan);
 *   3. Aladhan API, hanya bila admin memilih sumber itu dan hisab tidak boleh
 *      dipakai.
 */
export async function getJadwalHarian(
  lokasiInput?: string | null,
  kunciTanggalHari: string = kunciTanggal(),
  opsi: OpsiJadwal = {}
): Promise<JadwalHarian | null> {
  const kanonik = normalisasiLokasi(lokasiInput);
  const kotaKanonik = kanonik.koordinat
    ? { nama: kanonik.kota, provinsi: kanonik.provinsi ?? "", zona: kanonik.zona, lat: kanonik.koordinat.lat, lon: kanonik.koordinat.lon }
    : null;

  if (!opsi.segarkan) {
    try {
      const dariDb = await bacaDatabase(kanonik.kota, kunciTanggalHari);
      if (dariDb) {
        // Baris cache tidak menyimpan tanggal Hijriah; lengkapi di sini agar
        // konsumen (halaman & API) tidak perlu menghitung ulang, sekaligus
        // menghormati penyesuaian admin.
        return dariDb.hijriah
          ? dariDb
          : {
              ...dariDb,
              hijriah: hijriahLokal(
                new Date(),
                kanonik.zona,
                opsi.hijriahOffsetHari ?? 0
              ),
            };
      }
    } catch (error) {
      console.error("Gagal membaca jadwal dari database:", error);
    }
  }

  const ihtiyati = opsi.ihtiyatiMenit ?? 2;

  if (kotaKanonik && opsi.sumber !== "aladhan") {
    const times = hitungJadwalLokal(kotaKanonik, kunciTanggalHari, ihtiyati);
    await simpanKeDatabase(kotaKanonik, kunciTanggalHari, times, "hisab");
    return {
      ...times,
      lokasi: kanonik.kota,
      provinsi: kanonik.provinsi,
      zona: kanonik.zona,
      tanggal: kunciTanggalHari,
      hijriah: hijriahLokal(new Date(), kanonik.zona, opsi.hijriahOffsetHari ?? 0),
      sumber: "hisab",
    };
  }

  if (kotaKanonik) {
    const dariApi = await fetchAladhan(kotaKanonik, kunciTanggalHari);
    if (dariApi) {
      await simpanKeDatabase(kotaKanonik, kunciTanggalHari, dariApi, "aladhan");
      return {
        ...dariApi,
        lokasi: kanonik.kota,
        provinsi: kanonik.provinsi,
        zona: kanonik.zona,
        tanggal: kunciTanggalHari,
        hijriah: hijriahLokal(new Date(), kanonik.zona, opsi.hijriahOffsetHari ?? 0),
        sumber: "aladhan",
      };
    }
    // Aladhan sedang tidak bisa dihubungi: jatuh ke hisab agar jadwal tetap ada.
    const cadangan = hitungJadwalLokal(kotaKanonik, kunciTanggalHari, ihtiyati);
    await simpanKeDatabase(kotaKanonik, kunciTanggalHari, cadangan, "hisab");
    return {
      ...cadangan,
      lokasi: kanonik.kota,
      provinsi: kanonik.provinsi,
      zona: kanonik.zona,
      tanggal: kunciTanggalHari,
      hijriah: hijriahLokal(new Date(), kanonik.zona, opsi.hijriahOffsetHari ?? 0),
      sumber: "hisab",
    };
  }

  return null;
}

/** Daftar lokasi yang pernah tersimpan, untuk keperluan pratinjau admin. */
export async function daftarLokasiTersimpan(): Promise<{ lokasi: string; jumlahHari: number }[]> {
  const baris = await prisma.jadwalShalat.groupBy({
    by: ["lokasi"],
    _count: { lokasi: true },
    orderBy: { lokasi: "asc" },
  });
  return baris.map((item) => ({ lokasi: item.lokasi, jumlahHari: item._count.lokasi }));
}
