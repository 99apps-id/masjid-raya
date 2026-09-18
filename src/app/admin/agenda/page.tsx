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

export const metadata: Metadata = { title: "Agenda" };

export default async function AdminAgendaPage() {
  const [agenda, pengaturan] = await Promise.all([
    prisma.agenda.findMany({ orderBy: { tanggal: "desc" } }),
    getPetaPengaturan(),
  ]);

  const zona = normalisasiLokasi(pengaturan.lokasi_default).zona;

  return (
    <div>
      <KepalaAdmin
        kicker="Konten"
        judul="Agenda"
        keterangan="Agenda kegiatan mendatang yang tampil pada dasbor jamaah. Beda dengan Kegiatan: agenda cukup nama, tanggal, dan waktu."
        aksi={
          <TautanAksi href="/admin/agenda/tambah">
            <IkonTambah className="h-4 w-4" />
            Tambah agenda
          </TautanAksi>
        }
      />

      <div className="mt-8">
        <KartuAdmin>
          {agenda.length === 0 ? (
            <AdminKosong
              pesan="Belum ada agenda. Tambahkan agenda pertama agar dasbor jamaah menampilkan kegiatan mendatang."
              aksi={{ href: "/admin/agenda/tambah", label: "Tambah agenda" }}
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
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Waktu
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Lokasi
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-900/10">
                  {agenda.map((item) => (
                    <tr key={item.id} className="transition hover:bg-forest-50/50">
                      <td className="px-6 py-4 font-medium text-forest-900">
                        {item.nama}
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-500">
                        {tanggalSedang(item.tanggal, zona)}
                      </td>
                      <td className="px-6 py-4 text-sm tabular-nums text-ink-500">
                        {item.waktu || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-500">
                        {item.lokasi || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-5">
                          <Link
                            href={`/admin/agenda/${item.id}/edit`}
                            className="inline-flex items-center gap-1.5 text-sm text-forest-700 transition hover:text-forest-600"
                          >
                            <IkonPensil className="h-4 w-4" />
                            Edit
                          </Link>
                          <TombolHapus
                            endpoint={`/api/admin/agenda/${item.id}`}
                            nama={item.nama}
                            jenis="agenda"
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
