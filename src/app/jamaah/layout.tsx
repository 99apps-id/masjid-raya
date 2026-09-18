import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ambilProfil } from "@/lib/profil";

/**
 * Layout dashboard jamaah.
 *
 * Sebelumnya layout ini memakai latar hitam (`bg-black text-gray-100`)
 * sementara Navbar dan Footer bertema terang, sehingga teks dan tautan nyaris
 * tidak terbaca. Sekarang memakai tema terang yang sama dengan halaman publik.
 */
export default async function JamaahLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const branding = await ambilProfil();

  return (
    <div className="relative flex flex-1 flex-col bg-paper text-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 girih-pattern opacity-[0.05]"
      />
      <div className="relative flex flex-1 flex-col">
        <Navbar nama={branding.nama} logo={branding.logo} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
