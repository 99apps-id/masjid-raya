/**
 * Pembatas laju sederhana berbasis memori (sliding window).
 *
 * Catatan penting: penyimpanan berada di memori proses, jadi pada penerapan
 * multi-instance batasnya berlaku per instance, bukan global. Ini tetap jauh
 * lebih baik daripada tanpa pembatas sama sekali, karena mematikan serangan
 * tebak sandi otomatis yang datang beruntun ke satu instance. Untuk skala
 * besar, ganti `simpanan` dengan Redis tanpa mengubah pemanggilnya.
 */

interface Catatan {
  /** Cap waktu (ms) setiap percobaan yang masih di dalam jendela. */
  percobaan: number[];
}

const simpanan = new Map<string, Catatan>();
let terakhirBersih = Date.now();

/** Buang catatan kedaluwarsa agar memori tidak tumbuh tanpa batas. */
function bersihkanSesekali(jendelaTerpanjangMs: number): void {
  const sekarang = Date.now();
  if (sekarang - terakhirBersih < 60_000) return;
  terakhirBersih = sekarang;

  for (const [kunci, catatan] of simpanan) {
    catatan.percobaan = catatan.percobaan.filter(
      (waktu) => sekarang - waktu < jendelaTerpanjangMs
    );
    if (catatan.percobaan.length === 0) simpanan.delete(kunci);
  }
}

export interface HasilBatas {
  /** Apakah permintaan ini boleh dilanjutkan. */
  boleh: boolean;
  /** Sisa kuota pada jendela berjalan. */
  sisa: number;
  /** Detik sampai kuota terisi lagi (0 bila masih boleh). */
  tungguDetik: number;
}

/**
 * Periksa dan catat satu percobaan.
 *
 * @param kunci    penanda unik, mis. `login:1.2.3.4` atau `upload:userid`
 * @param batas    jumlah percobaan maksimum dalam jendela
 * @param jendelaMs panjang jendela dalam milidetik
 */
export function batasiLaju(
  kunci: string,
  batas: number,
  jendelaMs: number
): HasilBatas {
  bersihkanSesekali(jendelaMs);

  const sekarang = Date.now();
  const catatan = simpanan.get(kunci) ?? { percobaan: [] };
  catatan.percobaan = catatan.percobaan.filter(
    (waktu) => sekarang - waktu < jendelaMs
  );

  if (catatan.percobaan.length >= batas) {
    const tertua = catatan.percobaan[0];
    const tungguMs = Math.max(0, jendelaMs - (sekarang - tertua));
    simpanan.set(kunci, catatan);
    return { boleh: false, sisa: 0, tungguDetik: Math.ceil(tungguMs / 1000) };
  }

  catatan.percobaan.push(sekarang);
  simpanan.set(kunci, catatan);
  return { boleh: true, sisa: batas - catatan.percobaan.length, tungguDetik: 0 };
}

/** Anggap berhasil (mis. login benar) sehingga kuota kesalahan direset. */
export function hapusBatasLaju(kunci: string): void {
  simpanan.delete(kunci);
}

/**
 * Ambil alamat klien dari header proxy. Dipakai sebagai bagian kunci pembatas
 * laju; bila tidak tersedia, jatuh ke "tidak-diketahui" sehingga pembatasnya
 * tetap berlaku secara global, bukan terbuka.
 */
export function alamatKlien(header: Headers): string {
  const diteruskan = header.get("x-forwarded-for");
  if (diteruskan) return diteruskan.split(",")[0]!.trim();
  return header.get("x-real-ip")?.trim() || "tidak-diketahui";
}
