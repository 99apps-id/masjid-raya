"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import LogoMasjid from "@/components/LogoMasjid";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/jadwal", label: "Jadwal Shalat" },
  { href: "/khutbah", label: "Khutbah" },
  { href: "/kegiatan", label: "Kegiatan" },
  { href: "/berita", label: "Berita" },
  { href: "/galeri", label: "Galeri" },
  { href: "/petugas", label: "Petugas" },
  { href: "/kas", label: "Kas" },
  { href: "/profil", label: "Profil" },
];

function IkonMenu({ terbuka }: { terbuka: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {terbuka ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

interface NavbarProps {
  /** Nama masjid dari profil, dipakai sebagai merek di kiri atas. */
  nama: string;
  logo?: string | null;
}

export default function Navbar({ nama, logo }: NavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = (session?.user as { role?: string } | undefined)?.role;
  const panelHref = role === "jamaah" ? "/jamaah" : "/admin";
  const panelLabel = role === "admin" ? "Panel Admin" : "Dashboard";

  return (
    <nav className="sticky top-0 z-50 border-b border-forest-900/10 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <LogoMasjid
            nama={nama}
            logo={logo}
            className="h-7 w-7 shrink-0 text-forest-700"
            dekoratif
          />
          <span className="truncate text-lg font-semibold tracking-tight text-forest-900">
            {nama}
          </span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => {
            const aktif =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 text-sm transition ${
                  aktif
                    ? "text-forest-800"
                    : "text-ink-500 hover:text-forest-700"
                }`}
              >
                {link.label}
                {aktif && (
                  <span className="absolute -bottom-0.5 left-0 h-px w-full bg-brass" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {session ? (
            <>
              <Link href="/akun/sandi" className="btn btn-quiet py-2">
                Ganti Sandi
              </Link>
              <Link href={panelHref} className="btn btn-primary py-2">
                {panelLabel}
              </Link>
              <button onClick={() => signOut()} className="btn btn-quiet py-2">
                Keluar
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary py-2">
              Masuk
            </Link>
          )}
        </div>

        <button
          type="button"
          className="text-forest-800 lg:hidden"
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((sebelumnya) => !sebelumnya)}
        >
          <IkonMenu terbuka={mobileOpen} />
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-forest-900/10 bg-paper px-4 pb-5 pt-4 lg:hidden">
          <div className="space-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm text-ink-500 transition hover:text-forest-700"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-forest-900/10 pt-4">
            {session ? (
              <>
                <Link
                  href="/akun/sandi"
                  className="btn btn-quiet py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  Ganti Sandi
                </Link>
                <Link
                  href={panelHref}
                  className="btn btn-primary py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  {panelLabel}
                </Link>
                <button onClick={() => signOut()} className="btn btn-quiet py-2">
                  Keluar
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="btn btn-primary py-2"
                onClick={() => setMobileOpen(false)}
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
