import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import { ambilProfil } from "@/lib/profil";
import { getPetaPengaturan } from "@/lib/settings";
import { normalisasiLokasi } from "@/lib/kota";
import { awalPekan, labelPekan, tanggalSedang } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await ambilProfil();
  return {
    title: "Jadwal Petugas",
    description: `Rotasi petugas ibadah mingguan ${branding.nama}: imam, khatib, bilal, dan muadzin.`,
  };
}

const LABEL_PERAN: Record<string, string> = {
  imam: "Imam",
  khatib: "Khatib",
  bilal: "Bilal",
  muadzin: "Muadzin",
};

const URUTAN_PERAN = ["imam", "khatib", "bilal", "muadzin"];

export default async function PetugasPage() {
  const [branding, pengaturan, petugas] = await Promise.all([
    ambilProfil(),
    getPetaPengaturan(),
    prisma.petugasJadwal.findMany({ orderBy: { tanggal: "asc" } }),
  ]);

  const zona = normalisasiLokasi(pengaturan.lokasi_default).zona;

  const perPekan = new Map<string, typeof petugas>();
  for (const item of petugas) {
    const kunci = awalPekan(item.tanggal, zona);
    const daftar = perPekan.get(kunci) ?? [];
    daftar.push(item);
    perPekan.set(kunci, daftar);
  }
  const pekan = [...perPekan.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="page-shell">
      <PageHeader
        kicker="Petugas Ibadah"
        title="Jadwal Petugas"
        lead={`Rotasi petugas ibadah mingguan di ${branding.nama}.`}
      />

      {pekan.length === 0 ? (
        <p className="mt-12 text-sm text-ink-400">
          Jadwal petugas belum dipublikasikan.
        </p>
      ) : (
        pekan.map(([kunci, daftar]) => {
          const terurut = [...daftar].sort(
            (a, b) => URUTAN_PERAN.indexOf(a.peran) - URUTAN_PERAN.indexOf(b.peran)
          );
          return (
            <section key={kunci} className="mt-12">
              <h2 className="section-title">Pekan {labelPekan(kunci)}</h2>
              <div className="rule mt-4" />
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {terurut.map((item) => (
                  <div key={item.id} className="surface p-6">
                    <p className="kicker">{LABEL_PERAN[item.peran] ?? item.peran}</p>
                    <p className="mt-2 font-semibold leading-snug text-forest-900">
                      {item.nama}
                    </p>
                    <p className="mt-1 text-sm text-ink-400">
                      {tanggalSedang(item.tanggal, zona)}
                    </p>
                    {item.keterangan && (
                      <p className="mt-2 text-sm leading-relaxed text-ink-500">
                        {item.keterangan}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
