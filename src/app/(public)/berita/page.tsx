import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import { IkonPanah } from "@/components/Ikon";
import { tanggalSedang } from "@/lib/format";
import { ambilProfil } from "@/lib/profil";
import { getPetaPengaturan } from "@/lib/settings";
import { normalisasiLokasi } from "@/lib/kota";

// Berita diterbitkan lewat panel admin; halaman ini harus selalu membaca data
// terbaru, bukan hasil render saat build.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await ambilProfil();
  return {
    title: "Berita & Pengumuman",
    description: `Kabar terbaru dan pengumuman resmi ${branding.nama}.`,
  };
}

export default async function BeritaPage() {
  const [branding, pengaturan, berita] = await Promise.all([
    ambilProfil(),
    getPetaPengaturan(),
    prisma.berita.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  const zona = normalisasiLokasi(pengaturan.lokasi_default).zona;

  return (
    <div className="page-shell">
      <PageHeader
        kicker="Kabar Masjid"
        title="Berita & Pengumuman"
        lead={`Kegiatan, laporan, dan pengumuman resmi dari ${branding.nama}.`}
      />

      {berita.length > 0 ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {berita.map((item) => (
            <article
              key={item.id}
              className="surface flex flex-col overflow-hidden transition hover:border-forest-700/30"
            >
              {item.gambar && (
                // eslint-disable-next-line @next/next/no-img-element -- berkas
                // unggahan berukuran kecil, tidak perlu optimasi Next.
                <img
                  src={item.gambar}
                  alt={item.judul}
                  className="h-44 w-full object-cover"
                  loading="lazy"
                />
              )}
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="chip">
                    {item.kategori === "pengumuman" ? "Pengumuman" : "Berita"}
                  </span>
                  {item.publishedAt && (
                    <time className="meta">{tanggalSedang(item.publishedAt, zona)}</time>
                  )}
                </div>

                <h2 className="mt-4 text-lg font-semibold leading-snug text-forest-900">
                  {item.judul}
                </h2>
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-500">
                  {item.isi}
                </p>

                <Link
                  href={`/berita/${item.id}`}
                  className="link-hairline mt-5 inline-flex items-center gap-1.5 text-sm font-medium"
                >
                  Baca selengkapnya
                  <IkonPanah className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-12 text-sm text-ink-400">Belum ada berita.</p>
      )}
    </div>
  );
}
