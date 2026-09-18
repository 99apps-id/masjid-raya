import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import KreditAplikasi from "@/components/KreditAplikasi";
import { ambilProfil } from "@/lib/profil";
import { getServerAuth } from "@/lib/get-server-auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sabuk pengaman lapis kedua: middleware sudah menjaga /admin, tetapi
  // memeriksa ulang di sini memastikan panel tidak pernah dirender tanpa sesi
  // yang sah walau matcher middleware suatu saat berubah.
  const { user, role } = await getServerAuth();
  if (!user || (role !== "admin" && role !== "pengurus")) {
    redirect("/login?callbackUrl=/admin");
  }

  const branding = await ambilProfil();

  return (
    <div className="flex min-h-dvh flex-1 bg-paper text-ink">
      <AdminSidebar namaMasjid={branding.nama} logo={branding.logo} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 px-6 py-8 lg:px-10 lg:py-10">{children}</div>
        <footer className="border-t border-forest-900/10 px-6 py-6 lg:px-10">
          <KreditAplikasi />
        </footer>
      </div>
    </div>
  );
}
