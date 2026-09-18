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

export const metadata: Metadata = { title: "Khutbah" };

export default async function AdminKhutbahPage() {
  const [khutbah, pengaturan] = await Promise.all([
    prisma.khutbah.findMany({ orderBy: { tanggal: "desc" } }),
    getPetaPengaturan(),
  ]);

  const zona = normalisasiLokasi(pengaturan.lokasi_default).zona;

  return (
    <div>
      <KepalaAdmin
        kicker="Konten"
        judul="Khutbah Jumat"
        keterangan="Jadwal penceramah dan tema khutbah Jumat."
        aksi={
          <TautanAksi href="/admin/khutbah/tambah">
            <IkonTambah className="h-4 w-4" />
            Tambah khutbah
          </TautanAksi>
        }
      />

      <div className="mt-8">
        <KartuAdmin>
          {khutbah.length === 0 ? (
            <AdminKosong
              pesan="Belum ada jadwal khutbah."
              aksi={{ href: "/admin/khutbah/tambah", label: "Tambah khutbah" }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem]">
                <thead>
                  <tr className="border-b border-forest-900/10 bg-forest-50/70 text-left">
                    {["Tanggal", "Tema", "Penceramah"].map((kolom) => (
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
                  {khutbah.map((item) => (
                    <tr key={item.id} className="transition hover:bg-forest-50/50">
                      <td className="px-6 py-4 text-sm text-ink-500">
                        {tanggalSedang(item.tanggal, zona)}
                      </td>
                      <td className="px-6 py-4 font-medium text-forest-900">
                        {item.tema}
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-500">
                        {item.penceramah}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-5">
                          <Link
                            href={`/admin/khutbah/${item.id}/edit`}
                            className="inline-flex items-center gap-1.5 text-sm text-forest-700 transition hover:text-forest-600"
                          >
                            <IkonPensil className="h-4 w-4" />
                            Edit
                          </Link>
                          <TombolHapus
                            endpoint={`/api/admin/khutbah/${item.id}`}
                            nama={item.tema}
                            jenis="khutbah"
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
