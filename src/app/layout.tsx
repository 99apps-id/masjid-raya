import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ambilProfil, ikonBranding } from "@/lib/profil";

/**
 * Judul, deskripsi, dan ikon diambil dari profil masjid sehingga pengelola
 * dapat mengganti nama serta favicon tanpa menyentuh kode.
 */
export async function generateMetadata(): Promise<Metadata> {
  const branding = await ambilProfil();
  const ikon = ikonBranding(branding);

  return {
    metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
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
    <html lang="id">
      <body className="min-h-dvh flex flex-col font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
