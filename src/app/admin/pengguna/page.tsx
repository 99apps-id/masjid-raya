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

export const metadata: Metadata = { title: "Pengguna" };

const LABEL_PERAN: Record<string, string> = {
  admin: "Admin",
  pengurus: "Pengurus",
  jamaah: "Jamaah",
};

export default async function AdminPenggunaPage() {
  const [pengguna, pengaturan] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    getPetaPengaturan(),
  ]);

  const zona = normalisasiLokasi(pengaturan.lokasi_default).zona;

  return (
    <div>
      <KepalaAdmin
        kicker="Administrasi"
        judul="Pengguna"
        keterangan="Kelola akun yang dapat masuk ke panel: admin, pengurus, dan jamaah. Sandi setiap akun dapat direset dari sini."
        aksi={
          <TautanAksi href="/admin/pengguna/tambah">
            <IkonTambah className="h-4 w-4" />
            Tambah pengguna
          </TautanAksi>
        }
      />

      <div className="mt-8">
        <KartuAdmin>
          {pengguna.length === 0 ? (
            <AdminKosong
              pesan="Belum ada pengguna."
              aksi={{ href: "/admin/pengguna/tambah", label: "Tambah pengguna" }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[46rem]">
                <thead>
                  <tr className="border-b border-forest-900/10 bg-forest-50/70 text-left">
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Surel
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Peran
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Dibuat
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-900/10">
                  {pengguna.map((item) => (
                    <tr key={item.id} className="transition hover:bg-forest-50/50">
                      <td className="px-6 py-4 font-medium text-forest-900">
                        {item.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-500">{item.email}</td>
                      <td className="px-6 py-4">
                        <span className="chip">{LABEL_PERAN[item.role] ?? item.role}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-500">
                        {tanggalSedang(item.createdAt, zona)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-5">
                          <Link
                            href={`/admin/pengguna/${item.id}/edit`}
                            className="inline-flex items-center gap-1.5 text-sm text-forest-700 transition hover:text-forest-600"
                          >
                            <IkonPensil className="h-4 w-4" />
                            Edit
                          </Link>
                          <TombolHapus
                            endpoint={`/api/admin/pengguna/${item.id}`}
                            nama={item.name || item.email}
                            jenis="pengguna"
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
