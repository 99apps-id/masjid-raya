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
import { awalPekan, labelPekan, tanggalSedang } from "@/lib/format";
import { getPetaPengaturan } from "@/lib/settings";
import { normalisasiLokasi } from "@/lib/kota";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Jadwal Petugas" };

const LABEL_PERAN: Record<string, string> = {
  imam: "Imam",
  khatib: "Khatib",
  bilal: "Bilal",
  muadzin: "Muadzin",
};

const URUTAN_PERAN = ["imam", "khatib", "bilal", "muadzin"];

export default async function AdminPetugasPage() {
  const [petugas, pengaturan] = await Promise.all([
    prisma.petugasJadwal.findMany({ orderBy: { tanggal: "desc" } }),
    getPetaPengaturan(),
  ]);

  const zona = normalisasiLokasi(pengaturan.lokasi_default).zona;

  // Kelompokkan per pekan (Senin–Minggu); pekan terbaru di atas.
  const perPekan = new Map<string, typeof petugas>();
  for (const item of petugas) {
    const kunci = awalPekan(item.tanggal, zona);
    const daftar = perPekan.get(kunci) ?? [];
    daftar.push(item);
    perPekan.set(kunci, daftar);
  }
  const pekan = [...perPekan.entries()].sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div>
      <KepalaAdmin
        kicker="Konten"
        judul="Jadwal Petugas"
        keterangan="Rotasi petugas ibadah mingguan: imam, khatib, bilal, dan muadzin. Dikelompokkan per pekan."
        aksi={
          <TautanAksi href="/admin/petugas/tambah">
            <IkonTambah className="h-4 w-4" />
            Tambah petugas
          </TautanAksi>
        }
      />

      <div className="mt-8 space-y-8">
        {pekan.length === 0 ? (
          <KartuAdmin>
            <AdminKosong
              pesan="Belum ada jadwal petugas. Tambahkan penugasan pertama."
              aksi={{ href: "/admin/petugas/tambah", label: "Tambah petugas" }}
            />
          </KartuAdmin>
        ) : (
          pekan.map(([kunci, daftar]) => {
            const terurut = [...daftar].sort(
              (a, b) =>
                URUTAN_PERAN.indexOf(a.peran) - URUTAN_PERAN.indexOf(b.peran)
            );
            return (
              <section key={kunci}>
                <h2 className="section-title">
                  Pekan {labelPekan(kunci)}
                </h2>
                <div className="rule mt-3" />
                <div className="mt-4">
                  <KartuAdmin>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[44rem]">
                        <thead>
                          <tr className="border-b border-forest-900/10 bg-forest-50/70 text-left">
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                              Peran
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                              Nama
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                              Tanggal
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                              Keterangan
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-400">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-forest-900/10">
                          {terurut.map((item) => (
                            <tr
                              key={item.id}
                              className="transition hover:bg-forest-50/50"
                            >
                              <td className="px-6 py-4">
                                <span className="chip">
                                  {LABEL_PERAN[item.peran] ?? item.peran}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-medium text-forest-900">
                                {item.nama}
                              </td>
                              <td className="px-6 py-4 text-sm text-ink-500">
                                {tanggalSedang(item.tanggal, zona)}
                              </td>
                              <td className="px-6 py-4 text-sm text-ink-500">
                                {item.keterangan || "—"}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-5">
                                  <Link
                                    href={`/admin/petugas/${item.id}/edit`}
                                    className="inline-flex items-center gap-1.5 text-sm text-forest-700 transition hover:text-forest-600"
                                  >
                                    <IkonPensil className="h-4 w-4" />
                                    Edit
                                  </Link>
                                  <TombolHapus
                                    endpoint={`/api/admin/petugas/${item.id}`}
                                    nama={item.nama}
                                    jenis="petugas"
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </KartuAdmin>
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
