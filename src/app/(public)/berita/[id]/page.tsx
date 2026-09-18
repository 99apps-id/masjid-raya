import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { tanggalPanjang } from "@/lib/format";
import { ambilProfil } from "@/lib/profil";
import { getPetaPengaturan } from "@/lib/settings";
import { normalisasiLokasi } from "@/lib/kota";

// Berita baru harus langsung dapat dibuka tanpa membangun ulang aplikasi.
export const dynamic = "force-dynamic";

async function getBerita(id: string) {
  return prisma.berita.findUnique({ where: { id } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const berita = await getBerita(id);
  return {
    title: berita?.judul ?? "Berita",
    description: berita?.isi?.slice(0, 150),
  };
}

export default async function BeritaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [berita, branding, pengaturan] = await Promise.all([
    getBerita(id),
    ambilProfil(),
    getPetaPengaturan(),
  ]);

  if (!berita || !berita.published) {
    notFound();
  }

  const zona = normalisasiLokasi(pengaturan.lokasi_default).zona;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 lg:py-16">
      <Link
        href="/berita"
        className="link-hairline inline-flex items-center gap-2 text-sm"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 12H5" />
          <path d="m11 18-6-6 6-6" />
        </svg>
        Kembali ke Berita
      </Link>

      <article className="mt-8">
        <div className="flex flex-wrap items-center gap-4">
          <span className="chip">
            {berita.kategori === "pengumuman" ? "Pengumuman" : "Berita"}
          </span>
          {berita.publishedAt && (
            <time className="meta">
              {tanggalPanjang(berita.publishedAt, zona)}
            </time>
          )}
        </div>

        <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-forest-900 sm:text-4xl">
          {berita.judul}
        </h1>

        <div className="rule my-8" />

        {berita.gambar && (
          // eslint-disable-next-line @next/next/no-img-element -- berkas
          // unggahan berukuran kecil, tidak perlu optimasi Next.
          <img
            src={berita.gambar}
            alt={berita.judul}
            className="mb-8 w-full rounded-xl border border-forest-900/10 object-cover"
          />
        )}

        <div className="space-y-5 text-base leading-relaxed text-ink-500">
          {berita.isi
            .split("\n")
            .map((paragraf) => paragraf.trim())
            .filter(Boolean)
            .map((paragraf, indeks) => (
              <p key={indeks}>{paragraf}</p>
            ))}
        </div>
      </article>

      <div className="rule my-10" />
      <p className="meta">{branding.nama}</p>
      <Link href="/berita" className="link-hairline mt-2 inline-block text-sm font-medium">
        Lihat berita lainnya
      </Link>
    </div>
  );
}
