import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import { IkonLokasi, IkonMikrofon } from "@/components/Ikon";
import { tanggalPanjang } from "@/lib/format";
import { ambilProfil } from "@/lib/profil";
import { getPetaPengaturan } from "@/lib/settings";
import { normalisasiLokasi } from "@/lib/kota";

// Daftar khutbah dikelola lewat panel admin; tanpa ini halaman ikut dibekukan
// saat build sehingga data baru tidak muncul sampai aplikasi dibangun ulang.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await ambilProfil();
  return {
    title: "Jadwal Khutbah",
    description: `Daftar penceramah dan tema khutbah Jumat ${branding.nama}.`,
  };
}

export default async function KhutbahPage() {
  const [branding, pengaturan, khutbah] = await Promise.all([
    ambilProfil(),
    getPetaPengaturan(),
    prisma.khutbah.findMany({ orderBy: { tanggal: "desc" }, take: 20 }),
  ]);

  const zona = normalisasiLokasi(pengaturan.lokasi_default).zona;

  return (
    <div className="page-shell">
      <PageHeader
        kicker="Jumat Berkah"
        title="Jadwal Khutbah"
        lead={`Daftar penceramah dan tema khutbah Jumat di ${branding.nama}.`}
      />

      {khutbah.length > 0 ? (
        <ul className="mt-10 divide-y divide-forest-900/10 border-y border-forest-900/10">
          {khutbah.map((item) => {
            const akanDatang = item.tanggal.getTime() >= Date.now();
            return (
              <li key={item.id} className="py-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brass">
                      {tanggalPanjang(item.tanggal, zona)}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold leading-snug text-forest-900">
                      {item.tema}
                    </h2>
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-500">
                      <span className="flex items-center gap-2">
                        <IkonMikrofon className="h-4 w-4 text-forest-400" />
                        {item.penceramah}
                      </span>
                      {item.lokasi && (
                        <span className="flex items-center gap-2">
                          <IkonLokasi className="h-4 w-4 text-forest-400" />
                          {item.lokasi}
                        </span>
                      )}
                    </div>
                  </div>

                  {akanDatang && <span className="chip shrink-0">Akan datang</span>}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-12 text-sm text-ink-400">Belum ada jadwal khutbah.</p>
      )}
    </div>
  );
}
