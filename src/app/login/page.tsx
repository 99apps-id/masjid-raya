import type { Metadata } from "next";
import Link from "next/link";
import LogoMasjid from "@/components/LogoMasjid";
import KreditAplikasi from "@/components/KreditAplikasi";
import FormLogin from "@/components/FormLogin";
import { ambilProfil } from "@/lib/profil";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await ambilProfil();
  return {
    title: "Masuk",
    description: `Masuk ke panel pengelola ${branding.nama}.`,
  };
}

export default async function LoginPage() {
  const branding = await ambilProfil();

  return (
    <div className="relative flex min-h-dvh flex-1 items-center justify-center px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 girih-pattern opacity-[0.06]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <span className="arabic select-none text-[26rem] leading-none text-forest-900/[0.04]">
          المسجد
        </span>
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center">
          <LogoMasjid
            nama={branding.nama}
            logo={branding.logo}
            className="mx-auto h-12 w-12 text-forest-700"
            dekoratif
          />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-forest-900">
            {branding.nama}
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Masuk untuk mengelola konten dan jadwal masjid
          </p>
        </div>

        <FormLogin />

        <div className="mt-6 text-center">
          <p className="meta">Hubungi admin masjid untuk mendapatkan akun</p>
          <Link href="/" className="link-hairline mt-3 inline-block text-sm">
            Kembali ke beranda
          </Link>
        </div>

        <div className="mt-10 border-t border-forest-900/10 pt-5 text-center">
          <KreditAplikasi className="inline-block text-center" />
        </div>
      </div>
    </div>
  );
}
