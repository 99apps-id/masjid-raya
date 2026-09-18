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
import { formatRupiah, tanggalSedang } from "@/lib/format";
import { getPetaPengaturan } from "@/lib/settings";
import { normalisasiLokasi } from "@/lib/kota";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Laporan Kas" };

export default async function AdminKasPage() {
  const [transaksi, pengaturan] = await Promise.all([
    prisma.kasTransaksi.findMany({ orderBy: { tanggal: "desc" } }),
    getPetaPengaturan(),
  ]);

  const zona = normalisasiLokasi(pengaturan.lokasi_default).zona;

  // Rekap dihitung dari seluruh baris; jumlahnya kecil sehingga cukup di sini.
  const masuk = transaksi
    .filter((t) => t.jenis === "masuk")
    .reduce((total, t) => total + t.jumlah, 0);
  const keluar = transaksi
    .filter((t) => t.jenis === "keluar")
    .reduce((total, t) => total + t.jumlah, 0);
  const saldo = masuk - keluar;

  const ringkasan = [
    { label: "Total pemasukan", nilai: formatRupiah(masuk), warna: "text-forest-700" },
    { label: "Total pengeluaran", nilai: formatRupiah(keluar), warna: "text-red-700" },
    { label: "Saldo", nilai: formatRupiah(saldo), warna: "text-forest-900" },
  ];

  return (
    <div>
      <KepalaAdmin
        kicker="Keuangan"
        judul="Laporan Kas"
        keterangan="Catatan pemasukan dan pengeluaran kas masjid. Saldo dihitung otomatis dari seluruh transaksi."
        aksi={
          <TautanAksi href="/admin/kas/tambah">
            <IkonTambah className="h-4 w-4" />
            Catat transaksi
          </TautanAksi>
        }
      />

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {ringkasan.map((item) => (
          <div key={item.label} className="surface p-6">
            <p className="text-sm text-ink-400">{item.label}</p>
            <p className={`mt-2 text-2xl font-semibold tabular-nums ${item.warna}`}>
              {item.nilai}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <KartuAdmin>
          {transaksi.length === 0 ? (
            <AdminKosong
              pesan="Belum ada transaksi kas. Catat pemasukan atau pengeluaran pertama."
              aksi={{ href: "/admin/kas/tambah", label: "Catat transaksi" }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[52rem]">
                <thead>
                  <tr className="border-b border-forest-900/10 bg-forest-50/70 text-left">
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Jenis
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Keterangan
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Jumlah
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-900/10">
                  {transaksi.map((item) => {
                    const masukRow = item.jenis === "masuk";
                    return (
                      <tr key={item.id} className="transition hover:bg-forest-50/50">
                        <td className="px-6 py-4 text-sm text-ink-500">
                          {tanggalSedang(item.tanggal, zona)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              masukRow
                                ? "bg-forest-100 text-forest-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {masukRow ? "Masuk" : "Keluar"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-forest-900">
                          {item.keterangan}
                        </td>
                        <td className="px-6 py-4 text-sm text-ink-500">
                          {item.kategori || "—"}
                        </td>
                        <td
                          className={`px-6 py-4 text-right text-sm font-medium tabular-nums ${
                            masukRow ? "text-forest-700" : "text-red-700"
                          }`}
                        >
                          {masukRow ? "+" : "−"}
                          {formatRupiah(item.jumlah)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-5">
                            <Link
                              href={`/admin/kas/${item.id}/edit`}
                              className="inline-flex items-center gap-1.5 text-sm text-forest-700 transition hover:text-forest-600"
                            >
                              <IkonPensil className="h-4 w-4" />
                              Edit
                            </Link>
                            <TombolHapus
                              endpoint={`/api/admin/kas/${item.id}`}
                              nama={item.keterangan}
                              jenis="transaksi kas"
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
