import type { Metadata, Viewport } from "next";
import {
  Inter,
  Plus_Jakarta_Sans,
  Marcellus,
  Amiri,
  Amiri_Quran,
  Scheherazade_New,
  Reem_Kufi,
  Lateef,
} from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ambilProfil, ikonBranding } from "@/lib/profil";

/**
 * Font kaligrafi Arab di-self-host via next/font (tanpa CDN @import) agar:
 * - lolos CSP `font-src 'self'` di produksi,
 * - tetap tampil saat TV masjid offline / internet putus,
 * - tidak render-blocking (preload + display: swap).
 *
 * Peran tiap font:
 * - Amiri Quran (400): teks ayat utama — rasm Utsmani paling autentik.
 * - Scheherazade New: cadangan ayat — harakat paling jernih di TV besar.
 * - Amiri (400/700): nama surah, tanggal Hijriah, label Arab pendek.
 * - Reem Kufi: ornamen / watermark kaligrafi geometris (bukan ayat panjang).
 * - Lateef: fallback mungil yang tetap manis bila ketiga di atas gagal.
 */
/**
 * Font Latin: Plus Jakarta Sans (karya desainer Indonesia) untuk seluruh
 * UI/teks Latin — lebih berkarakter dari Inter namun tetap sangat terbaca
 * di TV maupun ponsel. Marcellus untuk judul hero (nama masjid, judul
 * halaman, nama shalat berikutnya): serif pahatan klasik yang selaras
 * dengan estetika arsitektur masjid. Inter dipertahankan khusus untuk
 * terjemahan ayat agar tidak berubah.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-plusjakarta",
});
const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-marcellus",
});
const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-amiri",
});
const amiriQuran = Amiri_Quran({
  subsets: ["arabic", "latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-uthmani",
});
const scheherazade = Scheherazade_New({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-scheherazade",
});
const kufi = Reem_Kufi({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-kufi",
});
const lateef = Lateef({
  subsets: ["arabic", "latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-lateef",
});

/**
 * Judul, deskripsi, dan ikon diambil dari profil masjid sehingga pengelola
 * dapat mengganti nama serta favicon tanpa menyentuh kode.
 */
export async function generateMetadata(): Promise<Metadata> {
  const branding = await ambilProfil();
  const ikon = ikonBranding(branding);

  return {
    metadataBase: new URL(
      process.env.NEXTAUTH_URL ??
        (process.env.NODE_ENV === "production"
          ? (() => {
              throw new Error(
                "NEXTAUTH_URL wajib diisi di produksi. Set URL aplikasi."
              );
            })()
          : "http://localhost:3000")
    ),
    title: {
      default: branding.nama,
      template: `%s | ${branding.nama}`,
    },
    description:
      branding.deskripsi ??
      `Jadwal shalat terkini, agenda kajian, khutbah Jumat, dan kabar kegiatan ${branding.nama}.`,
    applicationName: branding.nama,
    icons: ikon ? { icon: ikon, apple: ikon } : undefined,
  };
}

export const viewport: Viewport = {
  themeColor: "#0a4f33",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${plusJakarta.variable} ${marcellus.variable} ${amiri.variable} ${amiriQuran.variable} ${scheherazade.variable} ${kufi.variable} ${lateef.variable}`}
    >
      <body className="min-h-dvh flex flex-col font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
