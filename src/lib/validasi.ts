import { z } from "zod";

/**
 * Skema validasi bersama untuk seluruh route admin.
 *
 * Sebelumnya hanya dua route yang divalidasi; route lainnya meneruskan isi
 * permintaan apa adanya ke Prisma, sehingga satu permintaan berisi field asing
 * atau bertipe salah bisa menimbulkan galat 500 sekaligus membocorkan detail
 * internal. Semua skema di sini "strict": field yang tidak dikenal ditolak.
 */

const pesanTanggal = "Format tanggal harus YYYY-MM-DD";

/** Tanggal kalender YYYY-MM-DD yang benar-benar ada (mis. menolak 2026-02-31). */
export const tanggalKalender = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, pesanTanggal)
  .refine((nilai) => {
    const [y, m, d] = nilai.split("-").map(Number);
    const probe = new Date(Date.UTC(y!, m! - 1, d!));
    return (
      probe.getUTCFullYear() === y &&
      probe.getUTCMonth() === m! - 1 &&
      probe.getUTCDate() === d
    );
  }, "Tanggal tidak ada pada kalender");

export const waktuHHMM = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format waktu harus HH:MM");

/** Teks wajib dengan panjang terbatas, spasi di ujung dibuang. */
function teksWajib(maks: number, nama: string) {
  return z
    .string({ message: `${nama} wajib diisi` })
    .trim()
    .min(1, `${nama} wajib diisi`)
    .max(maks, `${nama} maksimal ${maks} karakter`);
}

/** Teks opsional: string kosong diubah menjadi null supaya kolom DB bersih. */
function teksOpsional(maks: number) {
  return z
    .union([z.string().trim().max(maks, `Maksimal ${maks} karakter`), z.null()])
    .optional()
    .transform((nilai) =>
      nilai === undefined || nilai === null || nilai === "" ? null : nilai
    );
}

/** Folder unggahan yang sah — selaras dengan JENIS_UPLOAD di lib/upload.ts. */
const FOLDER_UNGGAHAN = "(?:ustadz|kegiatan|berita|adzan|profil)";
const POLA_MEDIA = new RegExp(
  `^\\/api\\/media\\/${FOLDER_UNGGAHAN}\\/[A-Za-z0-9][A-Za-z0-9._-]{0,127}$`
);

/** Tautan berkas yang disimpan di database: hasil unggahan kita atau https. */
function tautanBerkas(nama: string) {
  return z
    .union([z.string().trim().max(500), z.null()])
    .optional()
    .transform((nilai) =>
      nilai === undefined || nilai === null || nilai === "" ? null : nilai
    )
    .refine(
      (nilai) =>
        nilai === null ||
        (POLA_MEDIA.test(nilai) && !nilai.includes("..")) ||
        (() => {
          try {
            return new URL(nilai).protocol === "https:";
          } catch {
            return false;
          }
        })(),
      `${nama} harus berkas hasil unggahan atau tautan https`
    );
}

/**
 * Tanggal opsional. String kosong diperlakukan sebagai "tidak diisi" (null),
 * bukan sebagai tanggal tidak valid — form HTML mengirim "" untuk input
 * tanggal yang dibiarkan kosong.
 */
const tanggalOpsional = z
  .union([tanggalKalender, z.literal(""), z.null()])
  .optional()
  .transform((nilai) => (nilai === undefined || nilai === "" ? null : nilai));

/** Waktu jam opsional (HH:MM); string kosong diperlakukan sebagai tidak diisi. */
const waktuOpsional = z
  .union([waktuHHMM, z.literal(""), z.null()])
  .optional()
  .transform((nilai) => (nilai === undefined || nilai === "" ? null : nilai));

/** Ubah "true"/"false"/1/0 menjadi boolean, tolak yang lain. */
export const saklar = z.union([
  z.boolean(),
  z.literal("true").transform(() => true),
  z.literal("false").transform(() => false),
  z.literal(1).transform(() => true),
  z.literal(0).transform(() => false),
]);

export const ustadzSchema = z
  .strictObject({
    nama: teksWajib(120, "Nama"),
    spesialisasi: teksOpsional(160),
    bio: teksOpsional(2000),
    foto: tautanBerkas("Foto"),
  })
  .partial();

/** Versi simpan penuh: nama tetap wajib. */
export const ustadzBuatSchema = ustadzSchema.extend({
  nama: teksWajib(120, "Nama"),
});

export const pengurusSchema = z
  .strictObject({
    nama: teksWajib(120, "Nama"),
    jabatan: teksWajib(120, "Jabatan"),
    foto: tautanBerkas("Foto"),
    urutan: z.coerce.number().int("Urutan harus bilangan bulat").min(0).max(9999),
  })
  .partial();

export const pengurusBuatSchema = pengurusSchema.extend({
  nama: teksWajib(120, "Nama"),
  jabatan: teksWajib(120, "Jabatan"),
  urutan: z.coerce.number().int().min(0).max(9999).default(0),
});

export const kegiatanSchema = z
  .strictObject({
    nama: teksWajib(160, "Nama kegiatan"),
    deskripsi: teksOpsional(4000),
    tanggalMulai: tanggalKalender,
    tanggalSelesai: tanggalOpsional,
    lokasi: teksOpsional(160),
    gambar: tautanBerkas("Gambar"),
  })
  .partial();

export const kegiatanBuatSchema = kegiatanSchema.extend({
  nama: teksWajib(160, "Nama kegiatan"),
  tanggalMulai: tanggalKalender,
});

export const kategoriBerita = z.enum(["berita", "pengumuman"]);

export const beritaSchema = z
  .strictObject({
    judul: teksWajib(200, "Judul"),
    isi: z
      .string()
      .trim()
      .min(1, "Isi berita wajib diisi")
      .max(20000, "Isi berita maksimal 20000 karakter"),
    gambar: tautanBerkas("Gambar"),
    kategori: kategoriBerita,
    published: saklar,
  })
  .partial();

export const beritaBuatSchema = beritaSchema.extend({
  judul: teksWajib(200, "Judul"),
  isi: z
    .string()
    .trim()
    .min(1, "Isi berita wajib diisi")
    .max(20000, "Isi berita maksimal 20000 karakter"),
});

export const khutbahSchema = z
  .strictObject({
    tanggal: tanggalKalender,
    tema: teksWajib(200, "Tema"),
    penceramah: teksWajib(160, "Penceramah"),
    lokasi: teksOpsional(160),
  })
  .partial();

export const khutbahBuatSchema = khutbahSchema.extend({
  tanggal: tanggalKalender,
  tema: teksWajib(200, "Tema"),
  penceramah: teksWajib(160, "Penceramah"),
});

export const agendaSchema = z
  .strictObject({
    nama: teksWajib(160, "Nama agenda"),
    tanggal: tanggalKalender,
    waktu: waktuOpsional,
    lokasi: teksOpsional(160),
    deskripsi: teksOpsional(4000),
  })
  .partial();

export const agendaBuatSchema = agendaSchema.extend({
  nama: teksWajib(160, "Nama agenda"),
  tanggal: tanggalKalender,
});

/** Tautan berkas WAJIB (mis. foto galeri): harus diisi dan bentuknya sah. */
function tautanBerkasWajib(nama: string) {
  return z
    .string({ message: `${nama} wajib diisi` })
    .trim()
    .min(1, `${nama} wajib diisi`)
    .max(500, `${nama} maksimal 500 karakter`)
    .refine(
      (nilai) =>
        (POLA_MEDIA.test(nilai) && !nilai.includes("..")) ||
        (() => {
          try {
            return new URL(nilai).protocol === "https:";
          } catch {
            return false;
          }
        })(),
      `${nama} harus berkas hasil unggahan atau tautan https`
    );
}

/* ------------------------------- Kas masjid ------------------------------ */

export const jenisKas = z.enum(["masuk", "keluar"]);

const jumlahRupiah = z.coerce
  .number({ message: "Jumlah wajib berupa angka" })
  .int("Jumlah harus bilangan bulat rupiah")
  .positive("Jumlah harus lebih dari nol")
  .max(1_000_000_000_000, "Jumlah terlalu besar");

export const kasSchema = z
  .strictObject({
    tanggal: tanggalKalender,
    jenis: jenisKas,
    kategori: teksOpsional(80),
    keterangan: teksWajib(200, "Keterangan"),
    jumlah: jumlahRupiah,
  })
  .partial();

export const kasBuatSchema = kasSchema.extend({
  tanggal: tanggalKalender,
  jenis: jenisKas,
  keterangan: teksWajib(200, "Keterangan"),
  jumlah: jumlahRupiah,
});

/* -------------------------------- Galeri -------------------------------- */

export const galeriSchema = z
  .strictObject({
    judul: teksWajib(160, "Judul"),
    deskripsi: teksOpsional(2000),
    gambar: tautanBerkas("Foto"),
    urutan: z.coerce.number().int("Urutan harus bilangan bulat").min(0).max(9999),
  })
  .partial();

export const galeriBuatSchema = galeriSchema.extend({
  judul: teksWajib(160, "Judul"),
  gambar: tautanBerkasWajib("Foto"),
});

/* --------------------------- Petugas ibadah ----------------------------- */

export const peranPetugas = z.enum(["imam", "khatib", "bilal", "muadzin"]);

export const petugasSchema = z
  .strictObject({
    tanggal: tanggalKalender,
    peran: peranPetugas,
    nama: teksWajib(120, "Nama petugas"),
    keterangan: teksOpsional(200),
  })
  .partial();

export const petugasBuatSchema = petugasSchema.extend({
  tanggal: tanggalKalender,
  peran: peranPetugas,
  nama: teksWajib(120, "Nama petugas"),
});

export const profilSchema = z
  .strictObject({
    nama: teksWajib(160, "Nama masjid"),
    deskripsi: teksOpsional(4000),
    visi: teksOpsional(2000),
    misi: teksOpsional(2000),
    sejarah: teksOpsional(6000),
    alamat: teksOpsional(300),
    kontak: teksOpsional(80),
    email: z
      .union([z.string().trim().max(160), z.null()])
      .optional()
      .transform((nilai) =>
        nilai === undefined || nilai === null || nilai === "" ? null : nilai
      )
      .refine(
        (nilai) => nilai === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nilai),
        "Format surel tidak sah"
      ),
    logo: tautanBerkas("Logo"),
    favicon: tautanBerkas("Favicon"),
  })
  .partial();

export const jadwalSchema = z
  .strictObject({
    tanggal: tanggalKalender,
    lokasi: teksWajib(64, "Lokasi"),
    provinsi: teksOpsional(64),
    imsak: waktuHHMM,
    subuh: waktuHHMM,
    terbit: waktuHHMM,
    dhuha: waktuHHMM,
    zuhur: waktuHHMM,
    ashar: waktuHHMM,
    maghrib: waktuHHMM,
    isya: waktuHHMM,
  })
  .partial();

export const jadwalSimpanSchema = jadwalSchema.extend({
  tanggal: tanggalKalender,
  lokasi: teksWajib(64, "Lokasi"),
  imsak: waktuHHMM,
  subuh: waktuHHMM,
  zuhur: waktuHHMM,
  ashar: waktuHHMM,
  maghrib: waktuHHMM,
  isya: waktuHHMM,
});

/**
 * Skema ganti sandi mandiri. Dipakai semua peran yang sudah masuk, jadi tidak
 * menyentuh peran sama sekali -- hanya memastikan sandi lama disertakan dan
 * sandi baru cukup panjang serta berbeda dari yang lama.
 */
export const SANDI_MIN = 8;

export const gantiSandiSchema = z
  .strictObject({
    sandiLama: z
      .string({ message: "Sandi lama wajib diisi" })
      .min(1, "Sandi lama wajib diisi")
      .max(200, "Sandi lama terlalu panjang"),
    sandiBaru: z
      .string({ message: "Sandi baru wajib diisi" })
      .min(SANDI_MIN, `Sandi baru minimal ${SANDI_MIN} karakter`)
      .max(200, "Sandi baru terlalu panjang"),
  })
  .refine((data) => data.sandiLama !== data.sandiBaru, {
    message: "Sandi baru harus berbeda dari sandi lama",
    path: ["sandiBaru"],
  });

/**
 * Skema manajemen akun pengguna oleh admin.
 *
 * Peran dibatasi ke tiga nilai yang dikenal; tanpa ini kolom `role` bisa diisi
 * teks sembarang yang akan lolos pemeriksaan peran di API maupun middleware.
 */
export const peranPengguna = z.enum(["admin", "pengurus", "jamaah"]);

const surelPengguna = z
  .string({ message: "Surel wajib diisi" })
  .trim()
  .toLowerCase()
  .min(1, "Surel wajib diisi")
  .max(160, "Surel maksimal 160 karakter")
  .refine(
    (nilai) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nilai),
    "Format surel tidak sah"
  );

export const penggunaBuatSchema = z.strictObject({
  nama: teksWajib(120, "Nama"),
  email: surelPengguna,
  role: peranPengguna,
  sandi: z
    .string({ message: "Sandi wajib diisi" })
    .min(SANDI_MIN, `Sandi minimal ${SANDI_MIN} karakter`)
    .max(200, "Sandi terlalu panjang"),
});

/** Sandi opsional saat menyunting: string kosong berarti "jangan diubah". */
const sandiOpsional = z
  .union([
    z
      .string()
      .min(SANDI_MIN, `Sandi minimal ${SANDI_MIN} karakter`)
      .max(200, "Sandi terlalu panjang"),
    z.literal(""),
  ])
  .optional()
  .transform((nilai) => (nilai === undefined || nilai === "" ? undefined : nilai));

export const penggunaUbahSchema = z.strictObject({
  nama: teksWajib(120, "Nama").optional(),
  email: surelPengguna.optional(),
  role: peranPengguna.optional(),
  sandi: sandiOpsional,
});

/** Ringkas daftar galat zod menjadi pesan yang bisa ditampilkan ke admin. */
export function ringkasGalat(galat: z.ZodError): {
  error: string;
  detail: { field: string; message: string }[];
} {
  return {
    error: "Data yang dikirim tidak valid",
    detail: galat.issues.map((issue) => ({
      field: issue.path.join(".") || "(badan permintaan)",
      message: issue.message,
    })),
  };
}
