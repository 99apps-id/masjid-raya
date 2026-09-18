import { ZONA_DEFAULT, type Zona } from "@/lib/kota";
import {
  bulanHijriah,
  detikHari,
  hijriahLokal,
  keMenit,
  SHALAT_WAJIB,
  type PrayerTimes,
} from "@/lib/waktu";

/**
 * Perhitungan papan informasi: jam berjalan, hitung mundur ke waktu shalat
 * berikutnya, kemajuan interval, dan hitung mundur iqomah.
 *
 * Fungsi ini murni (tanpa akses database) dan dipakai BERSAMA oleh server
 * component dan komponen klien. Karena keduanya memakai rumus yang sama,
 * halaman pertama kali dirender sudah menampilkan angka sebenarnya — bukan
 * "--:--:--" — sekaligus bebas dari ketidakcocokan hidrasi.
 */

export interface BarisShalat {
  key: keyof PrayerTimes;
  nama: string;
  menit: number;
}

export interface RingkasanPapan {
  jamTampil: string;
  tanggalPanjang: string;
  hijriah: string;
  bulan: string;
  baris: BarisShalat[];
  berikutnyaKey: keyof PrayerTimes | null;
  berikutnyaNama: string;
  berikutnyaJam: string;
  hitungMundur: number | null;
  /** Kemajuan dari waktu shalat sebelumnya ke berikutnya, 0–100. */
  persen: number;
  iqomahKey: keyof PrayerTimes | null;
  iqomahNama: string | null;
  iqomahSisa: number | null;
}

const SATU_HARI_MENIT = 24 * 60;

function duaDigit(nilai: number): string {
  return String(nilai).padStart(2, "0");
}

/** "3:48:51" bila lebih dari satu jam, selain itu "48:51". */
export function formatDurasi(totalDetik: number): string {
  const aman = Math.max(0, Math.floor(totalDetik));
  const jam = Math.floor(aman / 3600);
  const menit = Math.floor((aman % 3600) / 60);
  const detik = aman % 60;
  return jam > 0
    ? `${jam}:${duaDigit(menit)}:${duaDigit(detik)}`
    : `${duaDigit(menit)}:${duaDigit(detik)}`;
}

export function jamMenitDariMenit(menit: number): string {
  const normal = ((menit % SATU_HARI_MENIT) + SATU_HARI_MENIT) % SATU_HARI_MENIT;
  return `${duaDigit(Math.floor(normal / 60))}:${duaDigit(normal % 60)}`;
}

export function ringkasPapan(
  waktu: Date,
  jadwal: (PrayerTimes & { hijriah?: string | null; zona?: Zona }) | null,
  iqomahMenit: number,
  zonaDiminta?: Zona,
  hijriahOffsetHari = 0
): RingkasanPapan {
  // Zona diturunkan dari jadwal yang sedang tampil supaya jam, tanggal, dan
  // hitung mundur memakai waktu setempat masjid (WIB/WITA/WIT).
  const zona: Zona = zonaDiminta ?? jadwal?.zona ?? ZONA_DEFAULT;
  const detikSekarang = detikHari(waktu, zona);
  const menitSekarang = Math.floor(detikSekarang / 60);

  const baris: BarisShalat[] = [];
  for (const shalat of SHALAT_WAJIB) {
    const menit = keMenit(jadwal?.[shalat.key] ?? null);
    if (menit !== null) baris.push({ key: shalat.key, nama: shalat.nama, menit });
  }

  const dasar = {
    jamTampil: `${duaDigit(Math.floor(detikSekarang / 3600) % 24)}:${duaDigit(
      Math.floor((detikSekarang % 3600) / 60)
    )}:${duaDigit(detikSekarang % 60)}`,
    tanggalPanjang: new Intl.DateTimeFormat("id-ID", {
      timeZone: zona,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(waktu),
    hijriah:
      jadwal?.hijriah || hijriahLokal(waktu, zona, hijriahOffsetHari),
    bulan: bulanHijriah(waktu, zona, hijriahOffsetHari),
    baris,
  };

  if (baris.length === 0) {
    return {
      ...dasar,
      berikutnyaKey: null,
      berikutnyaNama: "-",
      berikutnyaJam: "--:--",
      hitungMundur: null,
      persen: 0,
      iqomahKey: null,
      iqomahNama: null,
      iqomahSisa: null,
    };
  }

  // Sebelum waktu shalat pertama hari ini, seluruh hitungan digeser satu hari
  // ke depan agar tidak menghasilkan angka negatif.
  const berikutnyaHariIni = baris.find((item) => item.menit > menitSekarang);
  const geserHari = berikutnyaHariIni ? 0 : SATU_HARI_MENIT;

  const berikutnya = berikutnyaHariIni ?? baris[0];
  const detikSekarangAbs = detikSekarang + geserHari * 60;
  const menitTargetAbs = berikutnya.menit + geserHari;

  const hitungMundur = Math.max(
    0,
    menitTargetAbs * 60 - detikSekarangAbs
  );

  const sebelumnyaHariIni = [...baris]
    .reverse()
    .find((item) => item.menit <= menitSekarang);
  const menitAwalAbs = sebelumnyaHariIni
    ? sebelumnyaHariIni.menit
    : baris[baris.length - 1].menit;

  const totalInterval = Math.max(1, menitTargetAbs - menitAwalAbs);
  const lewat = Math.max(
    0,
    Math.min(totalInterval, Math.floor(detikSekarangAbs / 60) - menitAwalAbs)
  );
  const persen = Math.round((lewat / totalInterval) * 100);

  const sedangIqomah = baris.find((item) => {
    const lewatIqomah = detikSekarangAbs - item.menit * 60;
    return lewatIqomah >= 0 && lewatIqomah <= iqomahMenit * 60;
  });

  return {
    ...dasar,
    berikutnyaKey: berikutnya.key,
    berikutnyaNama: berikutnya.nama,
    berikutnyaJam: jamMenitDariMenit(berikutnya.menit),
    hitungMundur,
    persen,
    iqomahKey: sedangIqomah?.key ?? null,
    iqomahNama: sedangIqomah?.nama ?? null,
    iqomahSisa: sedangIqomah
      ? Math.max(0, iqomahMenit * 60 - (detikSekarangAbs - sedangIqomah.menit * 60))
      : null,
  };
}
