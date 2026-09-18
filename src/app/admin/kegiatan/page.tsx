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

export const metadata: Metadata = { title: "Kegiatan" };

export default async function AdminKegiatanPage() {
  const [kegiatan, pengaturan] = await Promise.all([
    prisma.kegiatan.findMany({ orderBy: { tanggalMulai: "desc" } }),
    getPetaPengaturan(),
  ]);

  const zona = normalisasiLokasi(pengaturan.lokasi_default).zona;

  return (
    <div>
      <KepalaAdmin
        kicker="Konten"
        judul="Kegiatan"
        keterangan="Kegiatan dan agenda masjid beserta fotonya, tampil pada halaman Kegiatan."
        aksi={
          <TautanAksi href="/admin/kegiatan/tambah">
            <IkonTambah className="h-4 w-4" />
            Tambah kegiatan
          </TautanAksi>
        }
      />

      <div className="mt-8">
        <KartuAdmin>
          {kegiatan.length === 0 ? (
            <AdminKosong
              pesan="Belum ada kegiatan terjadwal."
              aksi={{ href: "/admin/kegiatan/tambah", label: "Tambah kegiatan" }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[48rem]">
                <thead>
                  <tr className="border-b border-forest-900/10 bg-forest-50/70 text-left">
                    {["Kegiatan", "Mulai", "Selesai", "Lokasi", "Foto"].map((kolom) => (
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
                  {kegiatan.map((item) => (
                    <tr key={item.id} className="transition hover:bg-forest-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.gambar ? (
                            // eslint-disable-next-line @next/next/no-img-element -- foto unggahan
                            <img
                              src={item.gambar}
                              alt=""
                              className="h-9 w-12 rounded object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div
                              aria-hidden="true"
                              className="h-9 w-12 rounded bg-forest-100"
                            />
                          )}
                          <span className="font-medium text-forest-900">
                            {item.nama}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-500">
                        {tanggalSedang(item.tanggalMulai, zona)}
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-500">
                        {item.tanggalSelesai
                          ? tanggalSedang(item.tanggalSelesai, zona)
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-500">
                        {item.lokasi || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-500">
                        {item.gambar ? "Ada" : "Belum ada"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-5">
                          <Link
                            href={`/admin/kegiatan/${item.id}/edit`}
                            className="inline-flex items-center gap-1.5 text-sm text-forest-700 transition hover:text-forest-600"
                          >
                            <IkonPensil className="h-4 w-4" />
                            Edit
                          </Link>
                          <TombolHapus
                            endpoint={`/api/admin/kegiatan/${item.id}`}
                            nama={item.nama}
                            jenis="kegiatan"
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
