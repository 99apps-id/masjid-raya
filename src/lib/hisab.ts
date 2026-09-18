/**
 * Hisab (perhitungan astronomis) waktu shalat secara lokal.
 *
 * Modul ini murni matematika — tanpa jaringan dan tanpa database — memakai
 * algoritma posisi matahari NOAA. Tujuannya menjadikan jadwal shalat selalu
 * tersedia dan selalu segar untuk tanggal berapa pun, tanpa bergantung pada
 * layanan pihak ketiga (yang bisa kena rate limit atau mati).
 *
 * Parameter sudut mengikuti metode Kementerian Agama RI:
 *   Subuh 20°, Isya 18°, Ashar mazhab Syafi'i (bayangan 1x), ihtiyati 2 menit.
 */

import type { PrayerTimes } from "@/lib/waktu";

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

/** Sudut ketinggian matahari saat terbit/terbenam (refraksi + radius). */
const ALT_TERBIT = -0.833;

/** Parameter metode Kementerian Agama RI. */
export const METODE_KEMENAG = {
  sudutSubuh: 20,
  sudutIsya: 18,
  /** Tambahan keamanan (ihtiyati) dalam menit untuk seluruh waktu. */
  ihtiyatiMenit: 2,
  /** Imsak dihitung sekian menit sebelum Subuh. */
  imsakSebelumSubuhMenit: 10,
  /** Awal Dhuha dihitung sekian menit setelah syuruq. */
  dhuhaSetelahTerbitMenit: 18,
  faktorBayanganAshar: 1,
} as const;

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/** Julian Day untuk tanggal kalender pada tengah malam UT. */
function julianDay(tahun: number, bulan: number, hari: number): number {
  let y = tahun;
  let m = bulan;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    hari +
    b -
    1524.5
  );
}

interface PosisiMatahari {
  /** Deklinasi matahari dalam derajat. */
  deklinasi: number;
  /** Equation of time dalam menit. */
  eqt: number;
}

function posisiMatahari(jd: number): PosisiMatahari {
  const T = (jd - 2451545) / 36525;

  const l0 = mod(280.46646 + T * (36000.76983 + T * 0.0003032), 360);
  const m0 = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);

  const mr = m0 * RAD;
  const c =
    Math.sin(mr) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
    Math.sin(2 * mr) * (0.019993 - 0.000101 * T) +
    Math.sin(3 * mr) * 0.000289;

  const trueLong = l0 + c;
  const omega = 125.04 - 1934.136 * T;
  const appLong = trueLong - 0.00569 - 0.00478 * Math.sin(omega * RAD);

  const obliq0 =
    23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const obliq = obliq0 + 0.00256 * Math.cos(omega * RAD);

  const deklinasi =
    Math.asin(Math.sin(obliq * RAD) * Math.sin(appLong * RAD)) * DEG;

  const y = Math.tan((obliq * RAD) / 2) ** 2;
  const eqt =
    4 *
    DEG *
    (y * Math.sin(2 * l0 * RAD) -
      2 * e * Math.sin(mr) +
      4 * e * y * Math.sin(mr) * Math.cos(2 * l0 * RAD) -
      0.5 * y * y * Math.sin(4 * l0 * RAD) -
      1.25 * e * e * Math.sin(2 * mr));

  return { deklinasi, eqt };
}

/**
 * Sudut jam (derajat) saat matahari berada pada ketinggian `altitudeDerajat`.
 * `null` bila matahari tidak pernah mencapai ketinggian itu pada hari tersebut
 * (mis. lintang sangat tinggi), sehingga pemanggil bisa memakai nilai bawaan.
 */
function sudutJam(
  latitude: number,
  deklinasi: number,
  altitudeDerajat: number
): number | null {
  const cosH =
    (Math.sin(altitudeDerajat * RAD) -
      Math.sin(latitude * RAD) * Math.sin(deklinasi * RAD)) /
    (Math.cos(latitude * RAD) * Math.cos(deklinasi * RAD));

  if (!Number.isFinite(cosH) || cosH > 1 || cosH < -1) return null;
  return Math.acos(cosH) * DEG;
}

function menitKeHHMM(menitTotal: number): string {
  const normal = Math.round(mod(menitTotal, 24 * 60));
  const jam = Math.floor(normal / 60);
  const menit = normal % 60;
  return `${String(jam).padStart(2, "0")}:${String(menit).padStart(2, "0")}`;
}

export interface ParameterHisab {
  latitude: number;
  longitude: number;
  /**
   * Offset zona waktu dalam jam dari UTC (WIB 7, WITA 8, WIT 9). Nilai
   * non-bulat didukung bila suatu saat perlu.
   */
  offsetZonaJam: number;
  /** Tanggal lokal, format YYYY-MM-DD. */
  tanggal: string;
}

/**
 * Hitung waktu shalat untuk satu hari. Seluruh nilai sudah dibulatkan ke menit
 * dan sudah ditambahkan ihtiyati, siap dipakai langsung.
 */
export function hisabWaktuShalat(param: ParameterHisab): PrayerTimes {
  const { latitude, longitude, offsetZonaJam, tanggal } = param;
  const [tahun, bulan, hari] = tanggal.split("-").map(Number);

  // Titik tengah hari lokal didekati dengan menggeser bujur, mengikuti
  // konvensi yang dipakai perpustakaan hisab pada umumnya.
  const jd = julianDay(tahun, bulan, hari) - longitude / 360;
  const { deklinasi, eqt } = posisiMatahari(jd);

  // Waktu tengah hari matahari (solar noon) dalam menit dari tengah malam lokal.
  const tengahHari = 720 - 4 * longitude - eqt + 60 * offsetZonaJam;

  const hTerbit = sudutJam(latitude, deklinasi, ALT_TERBIT) ?? 90;
  const hSubuh = sudutJam(latitude, deklinasi, -METODE_KEMENAG.sudutSubuh) ?? 120;
  const hIsya = sudutJam(latitude, deklinasi, -METODE_KEMENAG.sudutIsya) ?? 120;

  // Ashar: ketinggian matahari saat panjang bayangan = faktor x panjang benda.
  const tinggiAshar =
    Math.atan(
      1 / (METODE_KEMENAG.faktorBayanganAshar + Math.tan(Math.abs(latitude - deklinasi) * RAD))
    ) * DEG;
  const hAshar = sudutJam(latitude, deklinasi, tinggiAshar) ?? 60;

  const terbit = tengahHari - 4 * hTerbit;
  const subuh = tengahHari - 4 * hSubuh;
  const isya = tengahHari + 4 * hIsya;
  const ashar = tengahHari + 4 * hAshar;

  const ihtiyati = METODE_KEMENAG.ihtiyatiMenit;

  return {
    imsak: menitKeHHMM(subuh - METODE_KEMENAG.imsakSebelumSubuhMenit - ihtiyati),
    subuh: menitKeHHMM(subuh + ihtiyati),
    terbit: menitKeHHMM(terbit + ihtiyati),
    dhuha: menitKeHHMM(terbit + METODE_KEMENAG.dhuhaSetelahTerbitMenit + ihtiyati),
    zuhur: menitKeHHMM(tengahHari + ihtiyati),
    ashar: menitKeHHMM(ashar + ihtiyati),
    maghrib: menitKeHHMM(tengahHari + 4 * hTerbit + ihtiyati),
    isya: menitKeHHMM(isya + ihtiyati),
  };
}
