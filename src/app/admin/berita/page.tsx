import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  AdminKosong,
  KartuAdmin,
  KepalaAdmin,
  TautanAksi,
} from "@/components/admin/AdminShell";
import TombolHapus from "@/components/admin/TombolHapus";
import { IkonPensil, IkonTambah } from "@/components/Ikon";
import { tanggalSedang } from "@/lib/format";
import { getPetaPengaturan } from "@/lib/settings";
import { normalisasiLokasi } from "@/lib/kota";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Berita" };

export default async function AdminBeritaPage() {
  const [berita, pengaturan] = await Promise.all([
    prisma.berita.findMany({ orderBy: { createdAt: "desc" } }),
    getPetaPengaturan(),
  ]);

  const zona = normalisasiLokasi(pengaturan.lokasi_default).zona;

  return (
    <div>
      <KepalaAdmin
        kicker="Konten"
        judul="Berita & Pengumuman"
        keterangan="Tulisan berstatus draf tidak tampil di halaman publik."
        aksi={
          <TautanAksi href="/admin/berita/tambah">
            <IkonTambah className="h-4 w-4" />
            Tulis berita
          </TautanAksi>
        }
      />

      <div className="mt-8">
        <KartuAdmin>
          {berita.length === 0 ? (
            <AdminKosong
              pesan="Belum ada berita."
              aksi={{ href: "/admin/berita/tambah", label: "Tulis berita" }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[46rem]">
                <thead>
                  <tr className="border-b border-forest-900/10 bg-forest-50/70 text-left">
                    {["Judul", "Kategori", "Status", "Tanggal terbit", "Gambar"].map(
                      (kolom) => (
                        <th
                          key={kolom}
                          className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400"
                        >
                          {kolom}
                        </th>
                      )
                    )}
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-900/10">
                  {berita.map((item) => (
                    <tr key={item.id} className="transition hover:bg-forest-50/50">
                      <td className="max-w-sm px-6 py-4">
                        <Link
                          href={`/admin/berita/${item.id}/edit`}
                          className="font-medium text-forest-900 transition hover:text-forest-700"
                        >
                          {item.judul}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="chip">
                          {item.kategori === "pengumuman" ? "Pengumuman" : "Berita"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                            item.published
                              ? "bg-forest-100 text-forest-800"
                              : "bg-brass/15 text-brass-600"
                          }`}
                        >
                          {item.published ? "Tayang" : "Draf"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-500">
                        {item.publishedAt
                          ? tanggalSedang(item.publishedAt, zona)
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-500">
                        {item.gambar ? "Ada" : "Belum ada"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-5">
                          <Link
                            href={`/admin/berita/${item.id}/edit`}
                            className="inline-flex items-center gap-1.5 text-sm text-forest-700 transition hover:text-forest-600"
                          >
                            <IkonPensil className="h-4 w-4" />
                            Edit
                          </Link>
                          <TombolHapus
                            endpoint={`/api/admin/berita/${item.id}`}
                            nama={item.judul}
                            jenis="berita"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </KartuAdmin>
      </div>
    </div>
  );
}
