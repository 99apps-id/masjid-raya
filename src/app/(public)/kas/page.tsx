import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import { ambilProfil } from "@/lib/profil";
import { getPetaPengaturan } from "@/lib/settings";
import { normalisasiLokasi } from "@/lib/kota";
import { formatRupiah, tanggalSedang } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await ambilProfil();
  return {
    title: "Laporan Kas",
    description: `Transparansi pemasukan dan pengeluaran kas ${branding.nama}.`,
  };
}

export default async function KasPage() {
  const [branding, pengaturan, transaksi] = await Promise.all([
    ambilProfil(),
    getPetaPengaturan(),
    prisma.kasTransaksi.findMany({ orderBy: { tanggal: "desc" } }),
  ]);

  const zona = normalisasiLokasi(pengaturan.lokasi_default).zona;

  const masuk = transaksi
    .filter((t) => t.jenis === "masuk")
    .reduce((total, t) => total + t.jumlah, 0);
  const keluar = transaksi
    .filter((t) => t.jenis === "keluar")
    .reduce((total, t) => total + t.jumlah, 0);

  // Kelompokkan per bulan (label zona waktu masjid) untuk rekap bulanan.
  const labelBulan = (tanggal: Date) =>
    new Intl.DateTimeFormat("id-ID", {
      timeZone: zona,
      month: "long",
      year: "numeric",
    }).format(tanggal);

  const perBulan = new Map<string, typeof transaksi>();
  for (const item of transaksi) {
    const kunci = labelBulan(item.tanggal);
    const daftar = perBulan.get(kunci) ?? [];
    daftar.push(item);
    perBulan.set(kunci, daftar);
  }

  return (
    <div className="page-shell">
      <PageHeader
        kicker="Transparansi"
        title="Laporan Kas"
        lead={`Catatan pemasukan dan pengeluaran kas ${branding.nama}, dibuka untuk jamaah.`}
      />

      <section className="mt-10 grid gap-5 sm:grid-cols-3">
        <div className="surface p-6">
          <p className="meta">Total pemasukan</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-forest-700">
            {formatRupiah(masuk)}
          </p>
        </div>
        <div className="surface p-6">
          <p className="meta">Total pengeluaran</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-red-700">
            {formatRupiah(keluar)}
          </p>
        </div>
        <div className="surface p-6">
          <p className="meta">Saldo akhir</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-forest-900">
            {formatRupiah(masuk - keluar)}
          </p>
        </div>
      </section>

      {perBulan.size === 0 ? (
        <p className="mt-12 text-sm text-ink-400">
          Belum ada transaksi kas yang dicatat.
        </p>
      ) : (
        [...perBulan.entries()].map(([bulan, daftar]) => {
          const masukBulan = daftar
            .filter((t) => t.jenis === "masuk")
            .reduce((total, t) => total + t.jumlah, 0);
          const keluarBulan = daftar
            .filter((t) => t.jenis === "keluar")
            .reduce((total, t) => total + t.jumlah, 0);

          return (
            <section key={bulan} className="mt-12">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="section-title">{bulan}</h2>
                <p className="text-sm tabular-nums text-ink-500">
                  Masuk {formatRupiah(masukBulan)} · Keluar{" "}
                  {formatRupiah(keluarBulan)} · Selisih{" "}
                  <span
                    className={
                      masukBulan - keluarBulan >= 0
                        ? "text-forest-700"
                        : "text-red-700"
                    }
                  >
                    {formatRupiah(masukBulan - keluarBulan)}
                  </span>
                </p>
              </div>
              <div className="rule mt-4" />

              <div className="surface mt-6 overflow-x-auto">
                <table className="w-full min-w-[40rem]">
                  <thead>
                    <tr className="border-b border-forest-900/10 bg-forest-50/70 text-left">
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                        Tanggal
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-900/10">
                    {daftar.map((item) => {
                      const masukRow = item.jenis === "masuk";
                      return (
                        <tr key={item.id}>
                          <td className="px-6 py-3.5 text-sm text-ink-500">
                            {tanggalSedang(item.tanggal, zona)}
                          </td>
                          <td className="px-6 py-3.5 text-sm text-forest-900">
                            {item.keterangan}
                          </td>
                          <td className="px-6 py-3.5 text-sm text-ink-500">
                            {item.kategori || "—"}
                          </td>
                          <td
                            className={`px-6 py-3.5 text-right text-sm font-medium tabular-nums ${
                              masukRow ? "text-forest-700" : "text-red-700"
                            }`}
                          >
                            {masukRow ? "+" : "−"}
                            {formatRupiah(item.jumlah)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
