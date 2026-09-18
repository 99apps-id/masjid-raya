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
import { URUTAN_SHALAT } from "@/lib/waktu";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Jadwal Shalat" };

const LABEL_SUMBER: Record<string, { teks: string; kelas: string }> = {
  manual: { teks: "Manual", kelas: "bg-brass/15 text-brass-600" },
  hisab: { teks: "Hisab", kelas: "bg-forest-100 text-forest-800" },
  aladhan: { teks: "Aladhan", kelas: "bg-forest-100 text-forest-800" },
};

export default async function AdminJadwalPage() {
  const [jadwal, pengaturan] = await Promise.all([
    prisma.jadwalShalat.findMany({
      orderBy: [{ tanggal: "desc" }, { lokasi: "asc" }],
      take: 120,
    }),
    getPetaPengaturan(),
  ]);

  const zona = normalisasiLokasi(pengaturan.lokasi_default).zona;

  return (
    <div>
      <KepalaAdmin
        kicker="Jadwal"
        judul="Jadwal Shalat"
        keterangan={`Lokasi aktif: ${pengaturan.lokasi_default}. Jadwal harian dihitung otomatis dan dicache di sini; suntingan manual ditandai khusus dan tidak pernah ditimpa perhitungan otomatis.`}
        aksi={
          <TautanAksi href="/admin/jadwal/tambah">
            <IkonTambah className="h-4 w-4" />
            Tambah / koreksi jadwal
          </TautanAksi>
        }
      />

      <div className="mt-8">
        <KartuAdmin>
          {jadwal.length === 0 ? (
            <AdminKosong
              pesan="Belum ada jadwal tersimpan. Jadwal akan terisi otomatis saat papan informasi dibuka, atau tambahkan koreksi manual."
              aksi={{ href: "/admin/jadwal/tambah", label: "Tambah jadwal" }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[60rem]">
                <thead>
                  <tr className="border-b border-forest-900/10 bg-forest-50/70 text-left">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Tanggal
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Lokasi
                    </th>
                    {URUTAN_SHALAT.map((item) => (
                      <th
                        key={item.key}
                        className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400"
                      >
                        {item.nama}
                      </th>
                    ))}
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Sumber
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-900/10">
                  {jadwal.map((item) => {
                    const label = LABEL_SUMBER[item.sumber] ?? LABEL_SUMBER.hisab!;
                    return (
                      <tr key={item.id} className="transition hover:bg-forest-50/50">
                        <td className="whitespace-nowrap px-5 py-3 text-sm text-ink-500">
                          {tanggalSedang(item.tanggal, zona)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-forest-900">
                          {item.lokasi}
                        </td>
                        <td className="px-3 py-3 text-sm tabular-nums text-ink-500">
                          {item.imsak}
                        </td>
                        <td className="px-3 py-3 text-sm tabular-nums text-ink-500">
                          {item.subuh}
                        </td>
                        <td className="px-3 py-3 text-sm tabular-nums text-ink-500">
                          {item.terbit ?? "—"}
                        </td>
                        <td className="px-3 py-3 text-sm tabular-nums text-ink-500">
                          {item.dhuha ?? "—"}
                        </td>
                        <td className="px-3 py-3 text-sm tabular-nums text-ink-500">
                          {item.zuhur}
                        </td>
                        <td className="px-3 py-3 text-sm tabular-nums text-ink-500">
                          {item.ashar}
                        </td>
                        <td className="px-3 py-3 text-sm tabular-nums text-ink-500">
                          {item.maghrib}
                        </td>
                        <td className="px-3 py-3 text-sm tabular-nums text-ink-500">
                          {item.isya}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${label.kelas}`}
                          >
                            {label.teks}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-5">
                            <Link
                              href={`/admin/jadwal/${item.id}/edit`}
                              className="inline-flex items-center gap-1.5 text-sm text-forest-700 transition hover:text-forest-600"
                            >
                              <IkonPensil className="h-4 w-4" />
                              Edit
                            </Link>
                            <TombolHapus
                              endpoint={`/api/admin/jadwal/${item.id}`}
                              nama={`${item.lokasi} ${tanggalSedang(item.tanggal, zona)}`}
                              jenis="jadwal"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </KartuAdmin>
      </div>
    </div>
  );
}
