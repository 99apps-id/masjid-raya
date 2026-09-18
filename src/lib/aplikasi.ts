/**
 * Identitas aplikasi.
 *
 * Berbeda dari identitas masjid (nama, alamat, logo) yang bebas diganti
 * pengelola, nilai di sini tetap: inilah nama produk beserta pengembangnya dan
 * selalu tampil pada kredit footer di halaman publik maupun panel admin.
 */
export const APLIKASI = {
  nama: "Masjid Raya Pro",
  pengembang: "99Apps.id Studio",
  surel: "support@99apps.id",
} as const;

/** Satu baris kredit siap tampil: nama aplikasi — pengembang — surel. */
export function teksKredit(): string {
  return `${APLIKASI.nama} — dikembangkan oleh ${APLIKASI.pengembang}`;
}
