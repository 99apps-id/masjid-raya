import { redirect } from "next/navigation";
import { getServerAuth } from "@/lib/get-server-auth";

/**
 * Penjagaan server-side untuk sub-panel admin yang hanya boleh diakses peran
 * `admin` (Ustadz, Pengurus, Profil, Pengaturan).
 *
 * Middleware NextAuth hanya membedakan "sudah masuk" vs belum dan mengizinkan
 * peran `pengurus` masuk ke seluruh `/admin/*`, sehingga tanpa lapisan ini
 * seorang pengurus dapat membuka halaman tersebut lewat URL langsung — sementara
 * API-nya sudah dibatasi admin. Layout yang membungkus fungsi ini menutup celah
 * broken access control pada tingkat halaman.
 */
export default async function ProteksiAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role } = await getServerAuth();

  if (!user) redirect("/login?callbackUrl=/admin");
  // Pengurus tetap diarahkan ke dasbornya (/admin), bukan ditolak mentah.
  if (role !== "admin") redirect("/admin");

  return <>{children}</>;
}
