import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import { IkonJam, IkonKalender, IkonLokasi } from "@/components/Ikon";
import { tanggalRingkas, tanggalSedang } from "@/lib/format";
import { ambilProfil } from "@/lib/profil";
import { getPetaPengaturan } from "@/lib/settings";
import { normalisasiLokasi } from "@/lib/kota";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await ambilProfil();
  return {
    title: "Kegiatan & Agenda",
    description: `Jadwal kegiatan dan agenda mendatang ${branding.nama}.`,
  };
}

export default async function KegiatanPage() {
  const [branding, pengaturan, kegiatan, agenda] = await Promise.all([
    ambilProfil(),
    getPetaPengaturan(),
    prisma.kegiatan.findMany({ orderBy: { tanggalMulai: "desc" } }),
    prisma.agenda.findMany({
      where: { tanggal: { gte: new Date() } },
      orderBy: { tanggal: "asc" },
      take: 9,
    }),
  ]);

  const zona = normalisasiLokasi(pengaturan.lokasi_default).zona;

  return (
    <div className="page-shell">
      <PageHeader
        kicker="Agenda Jamaah"
        title="Kegiatan & Agenda"
        lead={`Kajian rutin, kegiatan sosial, dan program pembinaan ${branding.nama}.`}
      />

      {agenda.length > 0 && (
        <section className="mt-12">
          <h2 className="section-title">Agenda Mendatang</h2>
          <div className="rule mt-4" />
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {agenda.map((item) => (
              <div key={item.id} className="surface p-6">
                <p className="text-sm font-medium text-brass">
                  {tanggalRingkas(item.tanggal, zona)}
                </p>
                <h3 className="mt-2 font-semibold leading-snug text-forest-900">
                  {item.nama}
                </h3>
                <div className="mt-3 space-y-1.5 text-sm text-ink-500">
                  {item.waktu && (
                    <p className="flex items-center gap-2">
                      <IkonJam className="h-4 w-4 shrink-0 text-forest-400" />
                      {item.waktu}
                    </p>
                  )}
                  {item.lokasi && (
                    <p className="flex items-center gap-2">
                      <IkonLokasi className="h-4 w-4 shrink-0 text-forest-400" />
                      {item.lokasi}
                    </p>
                  )}
                </div>
                {item.deskripsi && (
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-400">
                    {item.deskripsi}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-14">
        <h2 className="section-title">Semua Kegiatan</h2>
        <div className="rule mt-4" />

        {kegiatan.length > 0 ? (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {kegiatan.map((item) => (
              <article
                key={item.id}
                className="surface flex flex-col overflow-hidden transition hover:border-forest-700/30"
              >
                {/* Foto kegiatan diunggah dari panel admin. */}
                {item.gambar ? (
                  // eslint-disable-next-line @next/next/no-img-element -- berkas
                  // unggahan berukuran kecil, tidak perlu optimasi Next.
                  <img
                    src={item.gambar}
                    alt={item.nama}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="girih-pattern-terang h-44 w-full bg-forest-700"
                  />
                )}

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-semibold leading-snug text-forest-900">
                    {item.nama}
                  </h3>
                  {item.deskripsi && (
                    <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-500">
                      {item.deskripsi}
                    </p>
                  )}
                  <div className="mt-4 space-y-1.5 border-t border-forest-900/10 pt-4 text-sm text-ink-500">
                    <p className="flex items-center gap-2">
                      <IkonKalender className="h-4 w-4 shrink-0 text-forest-400" />
                      {tanggalSedang(item.tanggalMulai, zona)}
                    </p>
                    {item.tanggalSelesai && (
                      <p className="flex items-center gap-2">
                        <IkonKalender className="h-4 w-4 shrink-0 text-forest-400" />
                        s.d. {tanggalSedang(item.tanggalSelesai, zona)}
                      </p>
                    )}
                    {item.lokasi && (
                      <p className="flex items-center gap-2">
                        <IkonLokasi className="h-4 w-4 shrink-0 text-forest-400" />
                        {item.lokasi}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-sm text-ink-400">Belum ada kegiatan.</p>
        )}
      </section>
    </div>
  );
}
