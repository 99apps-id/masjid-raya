import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getPetaPengaturan, pengaturanAngka } from "@/lib/settings";
import { ambilProfil } from "@/lib/profil";
import { LABEL_ZONA } from "@/lib/kota";
import {
  getJadwalHarian,
  hijriahLokal,
  keMenit,
  kunciTanggal,
  menitHari,
  URUTAN_SHALAT,
} from "@/lib/prayer-times";
import { tanggalRingkas, tanggalSedang } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { IkonJam, IkonKalender, IkonLokasi } from "@/components/Ikon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard Jamaah",
};

export default async function JamaahDashboard() {
  const [pengaturan, branding] = await Promise.all([
    getPetaPengaturan(),
    ambilProfil(),
  ]);

  const hijriahOffsetHari = pengaturanAngka(pengaturan, "hijriah_offset_hari", {
    min: -2,
    max: 2,
  });
  const jadwal = await getJadwalHarian(pengaturan.lokasi_default, kunciTanggal(), {
    hijriahOffsetHari,
  });
  const zona = jadwal?.zona ?? "Asia/Jakarta";
  const sekarangMenit = menitHari(new Date(), zona);

  const hariIni = new Date();
  const [kegiatan, berita, agenda] = await Promise.all([
    prisma.kegiatan.findMany({
      where: { tanggalMulai: { gte: hariIni } },
      orderBy: { tanggalMulai: "asc" },
      take: 6,
    }),
    prisma.berita.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    prisma.agenda.findMany({
      where: { tanggal: { gte: hariIni } },
      orderBy: { tanggal: "asc" },
      take: 5,
    }),
  ]);

  const menitShalat = URUTAN_SHALAT.map((waktu) => ({
    ...waktu,
    nilai: jadwal?.[waktu.key] ?? "-",
    menit: keMenit(jadwal?.[waktu.key]),
  }));

  const berikutnya =
    menitShalat.find((item) => item.menit !== null && item.menit > sekarangMenit) ??
    null;

  return (
    <div className="page-shell">
      <PageHeader
        kicker={jadwal?.hijriah || hijriahLokal(new Date(), zona, hijriahOffsetHari)}
        title="Dashboard Jamaah"
        lead={`Ringkasan jadwal, agenda, dan kabar terbaru ${branding.nama}.`}
      />

      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="surface p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-title flex items-center gap-2.5">
              <IkonJam className="h-5 w-5 text-forest-600" />
              Jadwal Shalat Hari Ini
            </h2>
            <span className="chip">{LABEL_ZONA[zona]}</span>
          </div>
          <div className="rule mt-4" />

          {jadwal ? (
            <>
              <p className="meta mt-4">
                {jadwal.lokasi}
                {jadwal.provinsi ? `, ${jadwal.provinsi}` : ""} ·{" "}
                {tanggalSedang(new Date(), zona)}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {menitShalat.map((item) => {
                  const aktif = berikutnya?.key === item.key;
                  return (
                    <div
                      key={item.key}
                      className={`rounded-xl border p-4 text-center ${
                        aktif
                          ? "border-brass/50 bg-brass/12"
                          : "border-forest-900/10 bg-white/60"
                      }`}
                    >
                      <p className="text-xs font-medium uppercase tracking-widest text-ink-400">
                        {item.nama}
                      </p>
                      <p
                        className={`mt-1.5 text-xl font-semibold tabular-nums ${
                          aktif ? "text-brass-600" : "text-forest-800"
                        }`}
                      >
                        {item.nilai}
                      </p>
                      {aktif && (
                        <p className="mt-1 text-xs uppercase tracking-widest text-brass">
                          Berikutnya
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="mt-6 text-sm text-ink-400">
              Jadwal shalat hari ini belum tersedia.
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <Link href="/kegiatan" className="surface p-6 transition hover:border-forest-700/30">
            <p className="meta">Kegiatan Mendatang</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-forest-900">
              {kegiatan.length}
            </p>
          </Link>
          <Link href="/kegiatan" className="surface p-6 transition hover:border-forest-700/30">
            <p className="meta">Agenda Terdekat</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-forest-900">
              {agenda.length}
            </p>
          </Link>
        </div>
      </section>

      {agenda.length > 0 && (
        <section className="mt-14">
          <h2 className="section-title">Agenda Mendatang</h2>
          <div className="rule mt-4" />
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {agenda.map((item) => (
              <div key={item.id} className="surface p-6">
                <p className="text-sm font-medium text-brass">
                  {tanggalRingkas(item.tanggal, zona)}
                </p>
                <h3 className="mt-2 font-semibold leading-snug text-forest-900">
                  {item.nama}
                </h3>
                <div className="mt-3 space-y-1.5 text-sm text-ink-500">
                  {item.waktu && (
                    <p className="flex items-center gap-2">
                      <IkonJam className="h-4 w-4 shrink-0 text-forest-400" />
                      {item.waktu}
                    </p>
                  )}
                  {item.lokasi && (
                    <p className="flex items-center gap-2">
                      <IkonLokasi className="h-4 w-4 shrink-0 text-forest-400" />
                      {item.lokasi}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {kegiatan.length > 0 && (
        <section className="mt-14">
          <h2 className="section-title">Kegiatan Terdekat</h2>
          <div className="rule mt-4" />
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {kegiatan.map((item) => (
              <article key={item.id} className="surface flex flex-col overflow-hidden">
                {item.gambar && (
                  // eslint-disable-next-line @next/next/no-img-element -- berkas
                  // unggahan berukuran kecil, tidak perlu optimasi Next.
                  <img
                    src={item.gambar}
                    alt={item.nama}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-semibold leading-snug text-forest-900">
                    {item.nama}
                  </h3>
                  {item.deskripsi && (
                    <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-500">
                      {item.deskripsi}
                    </p>
                  )}
                  <div className="mt-4 space-y-1.5 border-t border-forest-900/10 pt-4 text-sm text-ink-500">
                    <p className="flex items-center gap-2">
                      <IkonKalender className="h-4 w-4 shrink-0 text-forest-400" />
                      {tanggalSedang(item.tanggalMulai, zona)}
                    </p>
                    {item.lokasi && (
                      <p className="flex items-center gap-2">
                        <IkonLokasi className="h-4 w-4 shrink-0 text-forest-400" />
                        {item.lokasi}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {berita.length > 0 && (
        <section className="mt-14">
          <h2 className="section-title">Berita Terbaru</h2>
          <div className="rule mt-4" />
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {berita.map((item) => (
              <Link
                key={item.id}
                href={`/berita/${item.id}`}
                className="surface flex flex-col p-6 transition hover:border-forest-700/30"
              >
                <span className="chip w-fit">
                  {item.kategori === "pengumuman" ? "Pengumuman" : "Berita"}
                </span>
                <h3 className="mt-3 font-semibold leading-snug text-forest-900">
                  {item.judul}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-500">
                  {item.isi}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
