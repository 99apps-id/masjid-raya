"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import LogoMasjid from "@/components/LogoMasjid";
import {
  IkonAgenda,
  IkonAkun,
  IkonDasbor,
  IkonDokumen,
  IkonGambar,
  IkonGir,
  IkonGrup,
  IkonJam,
  IkonKalender,
  IkonKas,
  IkonKunci,
  IkonMikrofon,
  IkonPengguna,
  IkonPerisai,
  IkonPetugas,
} from "@/components/Ikon";

const MENU = [
  { href: "/admin", label: "Dashboard", Ikon: IkonDasbor, roles: ["admin", "pengurus"] },
  { href: "/admin/jadwal", label: "Jadwal Shalat", Ikon: IkonJam, roles: ["admin", "pengurus"] },
  { href: "/admin/khutbah", label: "Khutbah", Ikon: IkonMikrofon, roles: ["admin", "pengurus"] },
  { href: "/admin/kegiatan", label: "Kegiatan", Ikon: IkonKalender, roles: ["admin", "pengurus"] },
  { href: "/admin/agenda", label: "Agenda", Ikon: IkonAgenda, roles: ["admin", "pengurus"] },
  { href: "/admin/berita", label: "Berita", Ikon: IkonDokumen, roles: ["admin", "pengurus"] },
  { href: "/admin/galeri", label: "Galeri Foto", Ikon: IkonGambar, roles: ["admin", "pengurus"] },
  { href: "/admin/petugas", label: "Jadwal Petugas", Ikon: IkonPetugas, roles: ["admin", "pengurus"] },
  { href: "/admin/kas", label: "Laporan Kas", Ikon: IkonKas, roles: ["admin", "pengurus"] },
  { href: "/admin/ustadz", label: "Ustadz", Ikon: IkonPengguna, roles: ["admin"] },
  { href: "/admin/pengurus", label: "Pengurus", Ikon: IkonGrup, roles: ["admin"] },
  { href: "/admin/pengguna", label: "Pengguna", Ikon: IkonAkun, roles: ["admin"] },
  { href: "/admin/profil", label: "Profil & Logo", Ikon: IkonPerisai, roles: ["admin"] },
  { href: "/admin/pengaturan", label: "Pengaturan", Ikon: IkonGir, roles: ["admin"] },
  { href: "/akun/sandi", label: "Ganti Sandi", Ikon: IkonKunci, roles: ["admin", "pengurus"] },
];

export default function AdminSidebar({
  namaMasjid,
  logo,
}: {
  namaMasjid: string;
  logo?: string | null;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  const menu = MENU.filter((item) => role && item.roles.includes(role));

  return (
    <aside className="hidden w-64 shrink-0 border-r border-forest-900/10 bg-forest-50/50 md:block">
      <div className="sticky top-0 flex h-dvh flex-col p-5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <LogoMasjid
            nama={namaMasjid}
            logo={logo}
            className="h-7 w-7 shrink-0 text-forest-700"
            dekoratif
          />
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold tracking-tight text-forest-900">
              {namaMasjid}
            </span>
            <span className="block text-xs text-ink-400">Panel Pengelola</span>
          </span>
        </Link>

        <nav className="mt-8 space-y-1 overflow-y-auto">
          {menu.map((item) => {
            const aktif =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${aktif ? "nav-item-aktif" : ""}`}
              >
                <item.Ikon className="h-4 w-4 shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-forest-900/10 pt-5">
          <Link href="/" className="nav-item">
            <IkonDasbor className="h-4 w-4 shrink-0" />
            <span>Lihat Situs</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
