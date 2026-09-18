import { ZONA_DEFAULT } from "@/lib/kota";

type NilaiTanggal = Date | string | number;

/**
 * Pemformat tanggal berbahasa Indonesia. Zona waktu dapat diberikan agar
 * tanggal mengikuti waktu setempat lokasi masjid (WIB/WITA/WIT), bukan selalu
 * Asia/Jakarta.
 */

/** "Kamis, 18 September 2026" */
export function tanggalPanjang(nilai: NilaiTanggal, zona: string = ZONA_DEFAULT): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: zona,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(nilai));
}

/** "18 September 2026" */
export function tanggalSedang(nilai: NilaiTanggal, zona: string = ZONA_DEFAULT): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: zona,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(nilai));
}

/** "Kam, 18 Sep 2026" */
export function tanggalRingkas(nilai: NilaiTanggal, zona: string = ZONA_DEFAULT): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: zona,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(nilai));
}

/** Inisial nama (maksimal dua kata) untuk lencana bulat pengganti foto. */
export function inisialNama(nama: string): string {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((kata) => kata[0]?.toUpperCase() ?? "")
    .join("");
}

/** Nilai untuk atribut <input type="date"> pada zona tertentu: YYYY-MM-DD. */
export function nilaiInputTanggal(
  nilai: NilaiTanggal,
  zona: string = ZONA_DEFAULT
): string {
  const bagian: Record<string, string> = {};
  for (const part of new Intl.DateTimeFormat("en-CA", {
    timeZone: zona,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(nilai))) {
    bagian[part.type] = part.value;
  }
  return `${bagian.year}-${bagian.month}-${bagian.day}`;
}

/** "Rp1.250.000" — rupiah tanpa sen, dipakai rekap kas. */
export function formatRupiah(nilai: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(nilai);
}

/** Tanggal awal pekan (Senin) sebagai YYYY-MM-DD, dihitung pada zona tertentu. */
export function awalPekan(nilai: NilaiTanggal, zona: string = ZONA_DEFAULT): string {
  const hari = nilaiInputTanggal(nilai, zona);
  const tanggal = new Date(`${hari}T00:00:00.000Z`);
  const geser = (tanggal.getUTCDay() + 6) % 7; // Senin = 0 ... Minggu = 6
  tanggal.setUTCDate(tanggal.getUTCDate() - geser);
  return tanggal.toISOString().slice(0, 10);
}

/** Label rentang pekan dari tanggal Senin, mis. "12 – 18 Jan 2026". */
export function labelPekan(awalIso: string): string {
  const mulai = new Date(`${awalIso}T00:00:00.000Z`);
  const akhir = new Date(mulai);
  akhir.setUTCDate(akhir.getUTCDate() + 6);
  const hari = new Intl.DateTimeFormat("id-ID", {
    timeZone: "UTC",
    day: "numeric",
  });
  const bulan = new Intl.DateTimeFormat("id-ID", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${hari.format(mulai)} – ${bulan.format(akhir)}`;
}
