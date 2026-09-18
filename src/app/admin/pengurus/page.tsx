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
import { inisialNama } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Pengurus" };

export default async function AdminPengurusPage() {
  const pengurus = await prisma.pengurus.findMany({
    orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div>
      <KepalaAdmin
        kicker="Konten"
        judul="Pengurus Masjid"
        keterangan="Susunan takmir yang tampil pada halaman profil masjid."
        aksi={
          <TautanAksi href="/admin/pengurus/tambah">
            <IkonTambah className="h-4 w-4" />
            Tambah pengurus
          </TautanAksi>
        }
      />

      <div className="mt-8">
        <KartuAdmin>
          {pengurus.length === 0 ? (
            <AdminKosong
              pesan="Belum ada data pengurus."
              aksi={{ href: "/admin/pengurus/tambah", label: "Tambah pengurus" }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem]">
                <thead>
                  <tr className="border-b border-forest-900/10 bg-forest-50/70 text-left">
                    {["Nama", "Jabatan", "Urutan", "Foto"].map((kolom) => (
                      <th
                        key={kolom}
                        className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400"
                      >
                        {kolom}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-900/10">
                  {pengurus.map((item) => (
                    <tr key={item.id} className="transition hover:bg-forest-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.foto ? (
                            // eslint-disable-next-line @next/next/no-img-element -- foto unggahan
                            <img
                              src={item.foto}
                              alt=""
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
                        {item.jabatan}
                      </td>
                      <td className="px-6 py-4 text-sm tabular-nums text-ink-500">
                        {item.urutan}
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-500">
                        {item.foto ? "Ada" : "Belum ada"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-5">
                          <Link
                            href={`/admin/pengurus/${item.id}/edit`}
                            className="inline-flex items-center gap-1.5 text-sm text-forest-700 transition hover:text-forest-600"
                          >
                            <IkonPensil className="h-4 w-4" />
                            Edit
                          </Link>
                          <TombolHapus
                            endpoint={`/api/admin/pengurus/${item.id}`}
                            nama={item.nama}
                            jenis="pengurus"
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
