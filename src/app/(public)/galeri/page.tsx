import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import { ambilProfil } from "@/lib/profil";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await ambilProfil();
  return {
    title: "Galeri",
    description: `Kumpulan foto kegiatan dan fasilitas ${branding.nama}.`,
  };
}

export default async function GaleriPage() {
  const [branding, galeri] = await Promise.all([
    ambilProfil(),
    prisma.galeri.findMany({
      orderBy: [{ urutan: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <div className="page-shell">
      <PageHeader
        kicker="Album"
        title="Galeri"
        lead={`Dokumentasi kegiatan, fasilitas, dan momen kebersamaan di ${branding.nama}.`}
      />

      {galeri.length === 0 ? (
        <p className="mt-12 text-sm text-ink-400">
          Belum ada foto yang dibagikan.
        </p>
      ) : (
        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {galeri.map((item) => (
            <figure
              key={item.id}
              className="surface flex flex-col overflow-hidden transition hover:border-forest-700/30"
            >
              {/* Foto galeri diunggah dari panel admin. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.gambar}
                alt={item.judul}
                className="h-48 w-full object-cover"
                loading="lazy"
              />
              <figcaption className="flex flex-1 flex-col p-6">
                <h2 className="font-semibold leading-snug text-forest-900">
                  {item.judul}
                </h2>
                {item.deskripsi && (
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">
                    {item.deskripsi}
                  </p>
                )}
              </figcaption>
            </figure>
          ))}
        </section>
      )}
    </div>
  );
}
