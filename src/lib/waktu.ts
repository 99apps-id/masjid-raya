/**
 * Utilitas waktu murni (tanpa akses database) sehingga aman diimpor oleh
 * komponen klien maupun server. Logika pengambilan jadwal ada di
 * `prayer-times.ts` yang khusus berjalan di server.
 *
 * Semua fungsi di sini menerima parameter `zona` (zona waktu IANA) karena
 * Indonesia memakai tiga zona: WIB, WITA, dan WIT. Sebelumnya seluruh aplikasi
 * memakai Asia/Jakarta secara tetap, sehingga masjid di Makassar atau Jayapura
 * menampilkan jam, tanggal, dan hitung mundur yang salah satu/dua jam.
 */

import { ZONA_DEFAULT, type Zona } from "./kota";

/** Milidetik dalam satu hari, dipakai untuk menggeser kalender Hijriah. */
const MS_PER_HARI = 86_400_000;

export interface PrayerTimes {
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  zuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export interface JadwalHarian extends PrayerTimes {
  lokasi: string;
  provinsi: string | null;
  /** Zona waktu IANA yang berlaku di lokasi ini. */
  zona: Zona;
  /** Kalender Masehi zona waktu lokasi, format YYYY-MM-DD. */
  tanggal: string;
  /** Contoh: "6 Rabiul Akhir 1448 H". */
  hijriah: string | null;
  /** Asal angka: hasil hitung sendiri, API Aladhan, atau suntingan admin. */
  sumber: "hisab" | "aladhan" | "manual";
  /** Benar bila dilayani dari cache database (bukan dihitung saat itu). */
  dariCache?: boolean;
}

export const BULAN_HIJRIAH = [
  "Muharram",
  "Safar",
  "Rabiul Awal",
  "Rabiul Akhir",
  "Jumadil Awal",
  "Jumadil Akhir",
  "Rajab",
  "Sya'ban",
  "Ramadhan",
  "Syawal",
  "Dzulqa'dah",
  "Dzulhijjah",
];

export const URUTAN_SHALAT: { key: keyof PrayerTimes; nama: string }[] = [
  { key: "imsak", nama: "Imsak" },
  { key: "subuh", nama: "Subuh" },
  { key: "terbit", nama: "Terbit" },
  { key: "dhuha", nama: "Dhuha" },
  { key: "zuhur", nama: "Zuhur" },
  { key: "ashar", nama: "Ashar" },
  { key: "maghrib", nama: "Maghrib" },
  { key: "isya", nama: "Isya" },
];

/** Waktu shalat wajib, dipakai untuk menentukan shalat berikutnya. */
export const SHALAT_WAJIB: { key: keyof PrayerTimes; nama: string }[] = [
  { key: "subuh", nama: "Subuh" },
  { key: "zuhur", nama: "Zuhur" },
  { key: "ashar", nama: "Ashar" },
  { key: "maghrib", nama: "Maghrib" },
  { key: "isya", nama: "Isya" },
];

interface BagianWaktu {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
}

/** Pecah sebuah instan menjadi komponen waktu dinding pada zona tertentu. */
export function bagianWaktu(date: Date = new Date(), zona: string = ZONA_DEFAULT): BagianWaktu {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: zona,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const bagian: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    bagian[part.type] = part.value;
  }

  return {
    year: bagian.year,
    month: bagian.month,
    day: bagian.day,
    // en-CA memakai "24" untuk tengah malam pada hour12: false.
    hour: bagian.hour === "24" ? "00" : bagian.hour,
    minute: bagian.minute,
    second: bagian.second,
  };
}

/** Kunci tanggal Masehi pada zona tertentu: YYYY-MM-DD. */
export function kunciTanggal(date: Date = new Date(), zona: string = ZONA_DEFAULT): string {
  const { year, month, day } = bagianWaktu(date, zona);
  return `${year}-${month}-${day}`;
}

/** Menit sejak tengah malam menurut jam dinding pada zona tertentu. */
export function menitHari(date: Date = new Date(), zona: string = ZONA_DEFAULT): number {
  const { hour, minute } = bagianWaktu(date, zona);
  return Number(hour) * 60 + Number(minute);
}

/** Detik sejak tengah malam menurut jam dinding pada zona tertentu. */
export function detikHari(date: Date = new Date(), zona: string = ZONA_DEFAULT): number {
  const { hour, minute, second } = bagianWaktu(date, zona);
  return Number(hour) * 3600 + Number(minute) * 60 + Number(second);
}

/**
 * Titik acuan penyimpanan jadwal pada DB: tengah malam UTC dari tanggal
 * kalender lokal. Dipakai konsisten untuk upsert maupun kueri rentang hari
 * sehingga pencarian tidak meleset karena pergeseran zona waktu.
 */
export function awalHariUtc(kunciTanggalHari: string): Date {
  const [year, month, day] = kunciTanggalHari.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function validKunciTanggal(kunci: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(kunci)) return false;
  const [year, month, day] = kunci.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const probe = new Date(Date.UTC(year, month - 1, day));
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  );
}

export function kunciTanggalValid(kunci: string | null): kunci is string {
  return !!kunci && validKunciTanggal(kunci);
}

/** Tambah sejumlah menit ke string HH:MM. */
export function tambahMenit(waktu: string, menit: number): string {
  const [jam, mnt] = waktu.split(":").map(Number);
  if (Number.isNaN(jam) || Number.isNaN(mnt)) return waktu;
  const total = (jam * 60 + mnt + menit + 24 * 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
    total % 60
  ).padStart(2, "0")}`;
}

/** Ubah HH:MM menjadi menit sejak tengah malam, atau null bila tidak valid. */
export function keMenit(waktu?: string | null): number | null {
  if (!waktu) return null;
  const [jam, mnt] = waktu.split(":").map(Number);
  if (Number.isNaN(jam) || Number.isNaN(mnt)) return null;
  return jam * 60 + mnt;
}

/**
 * Tambah menit ihtiyati (kehati-hatian) ke waktu HH:MM. Dipisah dari
 * `tambahMenit` semata agar maksudnya jelas saat dibaca.
 */
export function tambahMenitIhtiyati(waktu: string, menit: number): string {
  if (!menit) return waktu;
  return tambahMenit(waktu, menit);
}

/**
 * Tanggal Hijriah (Umm al-Qura) dengan nama bulan Indonesia. Dipakai sebagai
 * pelengkap ketika jadwal dilayani dari cache database.
 */
export function hijriahLokal(
  date: Date = new Date(),
  zona: string = ZONA_DEFAULT,
  offsetHari = 0
): string {
  try {
    // Kalender Umm al-Qura sering berbeda satu hari dengan kalender Kemenag RI.
    // `offsetHari` menggeser tanggal sebelum diformat agar pengurus dapat
    // menyelaraskan dengan kalender masjid setempat.
    const target =
      offsetHari === 0 ? date : new Date(date.getTime() + offsetHari * MS_PER_HARI);
    const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      timeZone: zona,
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
    const bagian: Record<string, string> = {};
    for (const part of formatter.formatToParts(target)) {
      bagian[part.type] = part.value;
    }
    const nomorBulan = Number(bagian.month);
    const namaBulan = BULAN_HIJRIAH[nomorBulan - 1];
    const tahun = bagian.year?.replace(/\D/g, "");
    if (!bagian.day || !namaBulan || !tahun) return "";
    return `${Number(bagian.day.replace(/\D/g, ""))} ${namaBulan} ${tahun} H`;
  } catch {
    return "";
  }
}

/** Nama bulan Hijriah berjalan, dipakai untuk mendeteksi Ramadhan. */
export function bulanHijriah(
  date: Date = new Date(),
  zona: string = ZONA_DEFAULT,
  offsetHari = 0
): string {
  try {
    const target =
      offsetHari === 0 ? date : new Date(date.getTime() + offsetHari * MS_PER_HARI);
    const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      timeZone: zona,
      month: "numeric",
    });
    const nomorBulan = Number(formatter.format(target));
    return BULAN_HIJRIAH[nomorBulan - 1] ?? "";
  } catch {
    return "";
  }
}
