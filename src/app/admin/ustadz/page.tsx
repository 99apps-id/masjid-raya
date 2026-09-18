import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { AdminKosong, KartuAdmin, KepalaAdmin, TautanAksi } from "@/components/admin/AdminShell";
import TombolHapus from "@/components/admin/TombolHapus";
import { IkonPensil, IkonTambah } from "@/components/Ikon";
import { inisialNama } from "@/lib/format";

// Data dikelola lewat panel: halaman harus membaca database setiap permintaan,
// bukan hasil render saat build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Ustadz & Penceramah" };

export default async function AdminUstadzPage() {
  const ustadz = await prisma.ustadz.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <KepalaAdmin
        kicker="Konten"
        judul="Ustadz & Penceramah"
        keterangan="Kelola profil penceramah beserta fotonya. Foto tampil pada halaman profil masjid."
        aksi={
          <TautanAksi href="/admin/ustadz/tambah">
            <IkonTambah className="h-4 w-4" />
            Tambah ustadz
          </TautanAksi>
        }
      />

      <div className="mt-8">
        <KartuAdmin>
          {ustadz.length === 0 ? (
            <AdminKosong
              pesan="Belum ada data ustadz. Tambahkan penceramah pertama agar halaman profil tidak kosong."
              aksi={{ href: "/admin/ustadz/tambah", label: "Tambah ustadz" }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[44rem]">
                <thead>
                  <tr className="border-b border-forest-900/10 bg-forest-50/70 text-left">
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Spesialisasi
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Foto
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-900/10">
                  {ustadz.map((item) => (
                    <tr key={item.id} className="transition hover:bg-forest-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.foto ? (
                            // eslint-disable-next-line @next/next/no-img-element -- foto unggahan
                            <img
                              src={item.foto}
                              alt={item.nama}
                              className="h-9 w-9 rounded-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-100 text-xs font-semibold text-forest-700">
                              {inisialNama(item.nama)}
                            </span>
                          )}
                          <span className="font-medium text-forest-900">
                            {item.nama}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-500">
                        {item.spesialisasi || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-500">
                        {item.foto ? "Ada" : "Belum ada"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-5">
                          <Link
                            href={`/admin/ustadz/${item.id}/edit`}
                            className="inline-flex items-center gap-1.5 text-sm text-forest-700 transition hover:text-forest-600"
                          >
                            <IkonPensil className="h-4 w-4" />
                            Edit
                          </Link>
                          <TombolHapus
                            endpoint={`/api/admin/ustadz/${item.id}`}
                            nama={item.nama}
                            jenis="ustadz"
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
