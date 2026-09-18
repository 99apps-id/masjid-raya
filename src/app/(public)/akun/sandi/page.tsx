import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import FormGantiSandi from "@/components/FormGantiSandi";
import { getServerAuth } from "@/lib/get-server-auth";

// Sesi dibaca per permintaan; tidak boleh di-cache statis.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ganti Sandi",
  description: "Ganti kata sandi akun Anda.",
};

export default async function GantiSandiPage() {
  const { user } = await getServerAuth();

  return (
    <div className="page-shell">
      <PageHeader
        kicker="Akun"
        title="Ganti Sandi"
        lead="Perbarui kata sandi akun Anda. Masukkan sandi yang sekarang untuk memastikan ini benar-benar Anda."
      />

      <div className="mt-10 max-w-xl">
        <FormGantiSandi email={user?.email ?? null} />
      </div>

      <p className="meta mt-6 max-w-xl">
        Setelah diganti, gunakan sandi baru saat masuk berikutnya. Bila Anda tidak
        merasa mengganti sandi, segera hubungi admin masjid.
      </p>
    </div>
  );
}
