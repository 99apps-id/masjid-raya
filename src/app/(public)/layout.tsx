import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ambilProfil } from "@/lib/profil";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const branding = await ambilProfil();

  return (
    <div className="relative flex flex-1 flex-col bg-paper text-ink">
      {/* Pola geometri samar, senada dengan beranda, supaya halaman terasa satu keluarga. */}
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
