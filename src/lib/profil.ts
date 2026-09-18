import { cache } from "react";
import prisma from "@/lib/prisma";
import { APLIKASI } from "@/lib/aplikasi";

/**
 * Identitas masjid yang dipakai seluruh antarmuka (judul halaman, navbar,
 * footer, papan informasi, favicon).
 *
 * Nilainya berasal dari tabel profil_masjid sehingga nama, alamat, logo, dan
 * favicon bisa diganti pengelola tanpa menyentuh kode. Semua fungsi di sini
 * aman dipanggil dari server component dan tahan gagal: bila database belum
 * tersedia, nilai bawaan yang dipakai sehingga halaman tidak pernah blank.
 */

export const NAMA_MASJID_BAWAAN = APLIKASI.nama;

export interface Branding {
  nama: string;
  alamat: string | null;
  deskripsi: string | null;
  logo: string | null;
  favicon: string | null;
  kontak: string | null;
  email: string | null;
}

export const BRANDING_BAWAAN: Branding = {
  nama: NAMA_MASJID_BAWAAN,
  alamat: null,
  deskripsi: null,
  logo: null,
  favicon: null,
  kontak: null,
  email: null,
};

/**
 * Ambil profil masjid. Diringkas per permintaan dengan `cache()` React karena
 * layout, navbar, dan footer memanggilnya pada render yang sama.
 */
export const ambilProfil = cache(async (): Promise<Branding> => {
  try {
    const baris = await prisma.profilMasjid.findFirst({
      orderBy: { createdAt: "asc" },
    });
    if (!baris) return BRANDING_BAWAAN;

    return {
      nama: baris.nama?.trim() || NAMA_MASJID_BAWAAN,
      alamat: baris.alamat,
      deskripsi: baris.deskripsi,
      logo: baris.logo,
      favicon: baris.favicon,
      kontak: baris.kontak,
      email: baris.email,
    };
  } catch {
    return BRANDING_BAWAAN;
  }
});

/** Favicon yang dipakai: favicon khusus bila ada, selain itu logo. */
export function ikonBranding(branding: Branding): string | null {
  return branding.favicon || branding.logo || null;
}
