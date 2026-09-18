import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ambilProfil } from "@/lib/profil";
import { getPetaPengaturan } from "@/lib/settings";
import { LABEL_ZONA, normalisasiLokasi } from "@/lib/kota";
import { resolveAdzanUrl } from "@/lib/azan";
import {
  IkonDokumen,
  IkonGir,
  IkonGrup,
  IkonJam,
  IkonKalender,
  IkonMikrofon,
  IkonPengguna,
  IkonPerisai,
} from "@/components/Ikon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Dashboard" };

async function getStats() {
  const [
    jadwalCount,
    khutbahCount,
    kegiatanCount,
    beritaCount,
    ustadzCount,
    pengurusCount,
  ] = await Promise.all([
    prisma.jadwalShalat.count(),
    prisma.khutbah.count(),
    prisma.kegiatan.count(),
    prisma.berita.count(),
    prisma.ustadz.count(),
    prisma.pengurus.count(),
  ]);

  return {
    jadwalCount,
    khutbahCount,
    kegiatanCount,
    beritaCount,
    ustadzCount,
    pengurusCount,
  };
}

export default async function AdminDashboard() {
  const [stats, branding, pengaturan] = await Promise.all([
    getStats(),
    ambilProfil(),
    getPetaPengaturan(),
  ]);

  const kanonik = normalisasiLokasi(pengaturan.lokasi_default);
  const namaAdzan = resolveAdzanUrl(
    pengaturan.adzan_pilihan,
    pengaturan.adzan_audio_url
  )
    ? "Aktif"
    : "Belum ada suara";

  const statCards = [
    { label: "Jadwal Shalat", value: stats.jadwalCount, Ikon: IkonJam, href: "/admin/jadwal" },
    { label: "Khutbah", value: stats.khutbahCount, Ikon: IkonMikrofon, href: "/admin/khutbah" },
    { label: "Kegiatan", value: stats.kegiatanCount, Ikon: IkonKalender, href: "/admin/kegiatan" },
    { label: "Berita", value: stats.beritaCount, Ikon: IkonDokumen, href: "/admin/berita" },
    { label: "Ustadz", value: stats.ustadzCount, Ikon: IkonPengguna, href: "/admin/ustadz" },
    { label: "Pengurus", value: stats.pengurusCount, Ikon: IkonGrup, href: "/admin/pengurus" },
  ];

  const ringkasan = [
    { label: "Masjid", nilai: branding.nama },
    {
      label: "Lokasi jadwal",
      nilai: `${kanonik.kota}${kanonik.provinsi ? `, ${kanonik.provinsi}` : ""}`,
    },
    { label: "Zona waktu", nilai: LABEL_ZONA[kanonik.zona] },
    {
      label: "Metode perhitungan",
      nilai: pengaturan.sumber_jadwal === "aladhan" ? "API Aladhan" : "Hisab lokal",
    },
    {
      label: "Suara adzan",
      nilai: pengaturan.adzan_enabled === "true" ? namaAdzan : "Dimatikan",
    },
    { label: "Jeda iqomah", nilai: `${pengaturan.iqomah_menit} menit` },
  ];

  return (
    <div>
      <header className="border-b border-forest-900/10 pb-8">
        <p className="kicker">Ringkasan</p>
        <h1 className="page-title mt-3">Dashboard</h1>
        <p className="page-lead mt-4">
          Kelola jadwal shalat, khutbah, kegiatan, dan berita {branding.nama}.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="surface group flex items-center justify-between p-6 transition hover:border-forest-700/30"
          >
            <div>
              <p className="text-sm text-ink-400">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-forest-900">
                {stat.value}
              </p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-100 text-forest-700 transition group-hover:bg-forest-200">
              <stat.Ikon className="h-5 w-5" />
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="surface p-6 lg:p-8">
          <h2 className="section-title">Konfigurasi Aktif</h2>
          <div className="rule mt-4" />
          <dl className="mt-5 divide-y divide-forest-900/10">
            {ringkasan.map((baris) => (
              <div
                key={baris.label}
                className="flex items-baseline justify-between gap-6 py-3"
              >
                <dt className="text-sm text-ink-500">{baris.label}</dt>
                <dd className="text-right text-sm font-medium text-forest-900">
                  {baris.nilai}
                </dd>
              </div>
            ))}
          </dl>
          <p className="meta mt-5">
            Perubahan pada lokasi, metode, dan suara adzan dilakukan di halaman
            Pengaturan.
          </p>
        </div>

        <div className="space-y-5">
          <Link
            href="/admin/profil"
            className="surface group flex items-start gap-4 p-6 transition hover:border-forest-700/30"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest-700 transition group-hover:bg-forest-200">
              <IkonPerisai className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold text-forest-900">
                Profil, Alamat &amp; Logo
              </span>
              <span className="mt-1 block text-sm text-ink-500">
                Ganti nama masjid atau mushola, alamat, logo, dan favicon.
              </span>
            </span>
          </Link>

          <Link
            href="/admin/pengaturan"
            className="surface group flex items-start gap-4 p-6 transition hover:border-forest-700/30"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest-700 transition group-hover:bg-forest-200">
              <IkonGir className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold text-forest-900">
                Pengaturan Papan &amp; Suara Adzan
              </span>
              <span className="mt-1 block text-sm text-ink-500">
                Pilih kota jadwal shalat, pilihan suara adzan, ihtiyati, dan
                teks berjalan.
              </span>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
