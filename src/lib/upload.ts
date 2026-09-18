import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Penyimpanan berkas unggahan (foto ustadz/kegiatan, suara adzan).
 *
 * Prinsip keamanan yang dipakai:
 *  - Berkas TIDAK ditulis ke `public/` (jadi tidak pernah disajikan statis
 *    maupun masuk bundel build) melainkan ke direktori `uploads/` di luar
 *    direktori sumber, lalu dilayani lewat route `/api/media/...` yang
 *    menetapkan `Content-Type` dan `X-Content-Type-Options: nosniff`.
 *  - Jenis berkas ditentukan dari isi berkas (magic bytes), bukan dari
 *    `Content-Type` maupun nama berkas yang dikirim klien.
 *  - Nama berkas selalu dibuat ulang secara acak sehingga nama kiriman klien
 *    tidak pernah menyentuh sistem berkas: tidak ada path traversal, tidak ada
 *    eksekusi ganda ekstensi.
 */

export type JenisUnggahan = "gambar" | "audio";

export const JENIS_UPLOAD = [
  "ustadz",
  "kegiatan",
  "berita",
  "adzan",
  "profil",
] as const;
export type FolderUnggahan = (typeof JENIS_UPLOAD)[number];

/** Folder mana menerima jenis berkas apa, dan batas ukurannya. */
export const ATURAN_FOLDER: Record<
  FolderUnggahan,
  { jenis: JenisUnggahan; maksByte: number; label: string }
> = {
  ustadz: { jenis: "gambar", maksByte: 5 * 1024 * 1024, label: "Foto ustadz" },
  kegiatan: { jenis: "gambar", maksByte: 5 * 1024 * 1024, label: "Foto kegiatan" },
  berita: { jenis: "gambar", maksByte: 5 * 1024 * 1024, label: "Gambar berita" },
  adzan: { jenis: "audio", maksByte: 15 * 1024 * 1024, label: "Suara adzan" },
  profil: { jenis: "gambar", maksByte: 3 * 1024 * 1024, label: "Logo masjid" },
};

export function folderUnggahanValid(nilai: string): nilai is FolderUnggahan {
  return (JENIS_UPLOAD as readonly string[]).includes(nilai);
}

interface JenisBerkas {
  ekstensi: string;
  mime: string;
}

/** Cocokkan magic bytes. Mengembalikan null bila isi berkas tidak dikenali. */
function kenaliBerkas(isi: Uint8Array): JenisBerkas | null {
  const mulai = (awalan: number[]): boolean =>
    awalan.every((nilai, i) => isi[i] === nilai);

  const teks = (posisi: number, panjang: number): string =>
    String.fromCharCode(...isi.slice(posisi, posisi + panjang));

  // JPEG
  if (mulai([0xff, 0xd8, 0xff])) return { ekstensi: "jpg", mime: "image/jpeg" };
  // PNG
  if (mulai([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { ekstensi: "png", mime: "image/png" };
  }
  // WebP / WAV (keduanya diawali RIFF)
  if (teks(0, 4) === "RIFF") {
    const bentuk = teks(8, 4);
    if (bentuk === "WEBP") return { ekstensi: "webp", mime: "image/webp" };
    if (bentuk === "WAVE") return { ekstensi: "wav", mime: "audio/wav" };
  }
  // GIF
  if (teks(0, 6) === "GIF87a" || teks(0, 6) === "GIF89a") {
    return { ekstensi: "gif", mime: "image/gif" };
  }
  // Ogg (Vorbis/Opus)
  if (teks(0, 4) === "OggS") return { ekstensi: "ogg", mime: "audio/ogg" };
  // MP4/M4A: kotak "ftyp" pada byte 4
  if (teks(4, 4) === "ftyp") {
    const merek = teks(8, 3);
    if (merek === "M4A" || merek === "mp4" || merek === "iso") {
      return { ekstensi: "m4a", mime: "audio/mp4" };
    }
  }
  // MP3: tag ID3 atau sinkronisasi bingkai (0xFFEx/0xFFFx)
  if (teks(0, 3) === "ID3") return { ekstensi: "mp3", mime: "audio/mpeg" };
  if (isi[0] === 0xff && (isi[1]! & 0xe0) === 0xe0) {
    return { ekstensi: "mp3", mime: "audio/mpeg" };
  }

  return null;
}

const EKSTENSI_GAMBAR = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const EKSTENSI_AUDIO = new Set(["mp3", "ogg", "wav", "m4a"]);

export interface BerkasTersimpan {
  /** Tautan relatif yang disimpan di database. */
  url: string;
  namaBerkas: string;
  ukuran: number;
  mime: string;
}

export type HasilUnggahan =
  | { ok: true; berkas: BerkasTersimpan }
  | { ok: false; pesan: string };

/** Direktori dasar penyimpanan; bisa dialihkan lewat env UPLOAD_DIR. */
export function direktoriUnggahan(): string {
  const dariEnv = process.env.UPLOAD_DIR?.trim();
  return dariEnv ? path.resolve(dariEnv) : path.join(process.cwd(), "uploads");
}

/**
 * Validasi lalu simpan satu berkas unggahan.
 *
 * @param berkas  objek File dari FormData
 * @param folder  tujuan; menentukan jenis yang diterima dan batas ukuran
 */
export async function simpanUnggahan(
  berkas: File,
  folder: FolderUnggahan
): Promise<HasilUnggahan> {
  const aturan = ATURAN_FOLDER[folder];

  if (!berkas || typeof berkas.arrayBuffer !== "function") {
    return { ok: false, pesan: "Berkas tidak ditemukan pada permintaan" };
  }
  if (berkas.size === 0) {
    return { ok: false, pesan: "Berkas kosong" };
  }
  if (berkas.size > aturan.maksByte) {
    return {
      ok: false,
      pesan: `Ukuran berkas melebihi batas ${Math.round(aturan.maksByte / 1024 / 1024)} MB`,
    };
  }

  const isi = new Uint8Array(await berkas.arrayBuffer());
  const jenis = kenaliBerkas(isi);

  if (!jenis) {
    return {
      ok: false,
      pesan: "Isi berkas tidak dikenali sebagai gambar atau suara yang didukung",
    };
  }

  const diizinkan =
    aturan.jenis === "gambar"
      ? EKSTENSI_GAMBAR.has(jenis.ekstensi)
      : EKSTENSI_AUDIO.has(jenis.ekstensi);

  if (!diizinkan) {
    return {
      ok: false,
      pesan:
        aturan.jenis === "gambar"
          ? "Berkas ini bukan gambar (jpg, png, webp, atau gif)"
          : "Berkas ini bukan audio yang didukung (mp3, ogg, wav, atau m4a)",
    };
  }

  const namaBerkas = `${randomBytes(16).toString("hex")}.${jenis.ekstensi}`;
  const tujuan = path.join(direktoriUnggahan(), folder);

  try {
    await mkdir(tujuan, { recursive: true });
    await writeFile(path.join(tujuan, namaBerkas), isi);
  } catch (error) {
    console.error("Gagal menulis berkas unggahan:", error);
    return { ok: false, pesan: "Gagal menyimpan berkas di server" };
  }

  return {
    ok: true,
    berkas: {
      url: `/api/media/${folder}/${namaBerkas}`,
      namaBerkas,
      ukuran: berkas.size,
      mime: jenis.mime,
    },
  };
}

/** Nama berkas yang aman: hanya huruf/angka/titik/strip/garis bawah. */
export function namaBerkasAman(nama: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(nama) && !nama.includes("..");
}

/**
 * Tebak MIME dari ekstensi. Dipakai route media sebagai lapis kedua setelah
 * magic bytes sudah diverifikasi saat berkas disimpan.
 */
export function mimeDariEkstensi(nama: string): string {
  const ekstensi = nama.split(".").pop()?.toLowerCase() ?? "";
  switch (ekstensi) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "mp3":
      return "audio/mpeg";
    case "ogg":
      return "audio/ogg";
    case "wav":
      return "audio/wav";
    case "m4a":
      return "audio/mp4";
    default:
      return "application/octet-stream";
  }
}
