import Link from "next/link";
import LogoMasjid from "@/components/LogoMasjid";
import KreditAplikasi from "@/components/KreditAplikasi";
import { ambilProfil } from "@/lib/profil";

const TAUTAN = [
  { href: "/jadwal", label: "Jadwal Shalat" },
  { href: "/khutbah", label: "Jadwal Khutbah" },
  { href: "/kegiatan", label: "Kegiatan" },
  { href: "/berita", label: "Berita" },
  { href: "/galeri", label: "Galeri" },
  { href: "/petugas", label: "Jadwal Petugas" },
  { href: "/kas", label: "Laporan Kas" },
  { href: "/profil", label: "Profil Masjid" },
];

export default async function Footer() {
  // Kontak dan nama diambil dari profil masjid supaya footer tidak pernah
  // menampilkan identitas yang berbeda dari isi database.
  const branding = await ambilProfil();

  return (
    <footer className="mt-auto border-t border-forest-900/10 bg-forest-50/60">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMasjid
                nama={branding.nama}
                logo={branding.logo}
                className="h-7 w-7 shrink-0 text-forest-700"
                dekoratif
              />
              <span className="text-lg font-semibold tracking-tight text-forest-900">
                {branding.nama}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
              {branding.deskripsi ??
                "Pusat ibadah, pembinaan, dan kegiatan sosial masyarakat."}
            </p>
          </div>

          <div>
            <h2 className="kicker">Tautan</h2>
            <ul className="mt-4 space-y-2.5">
              {TAUTAN.map((tautan) => (
                <li key={tautan.href}>
                  <Link
                    href={tautan.href}
                    className="text-sm text-ink-500 transition hover:text-forest-700"
                  >
                    {tautan.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="kicker">Kontak</h2>
            <ul className="mt-4 space-y-3 text-sm text-ink-500">
              {branding.alamat && (
                <li className="leading-relaxed">{branding.alamat}</li>
              )}
              {branding.kontak && (
                <li>
                  <span className="text-ink-400">Telepon </span>
                  <a href={`tel:${branding.kontak}`} className="link-hairline">
                    {branding.kontak}
                  </a>
                </li>
              )}
              {branding.email && (
                <li>
                  <span className="text-ink-400">Surel </span>
                  <a href={`mailto:${branding.email}`} className="link-hairline">
                    {branding.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Atribusi produk: tetap menampilkan nama aplikasi, pengembang, dan
            surel dukungan meskipun identitas masjid di atas diganti. */}
        <div className="mt-12 flex flex-col gap-4 border-t border-forest-900/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="meta">
            © {new Date().getFullYear()} {branding.nama}. Seluruh hak cipta
            dilindungi.
          </p>
          <KreditAplikasi className="sm:text-right" />
        </div>
      </div>
    </footer>
  );
}
