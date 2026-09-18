import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import LogoMasjid from "@/components/LogoMasjid";
import { IkonLokasi, IkonSurel, IkonTelepon } from "@/components/Ikon";
import { inisialNama } from "@/lib/format";
import { ambilProfil } from "@/lib/profil";

// Profil dan daftar pengurus disunting lewat panel admin.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await ambilProfil();
  return {
    title: "Profil Masjid",
    description: `Sejarah, visi, misi, pengurus, dan penceramah ${branding.nama}.`,
  };
}

export default async function ProfilPage() {
  const [branding, profil, ustadz, pengurus] = await Promise.all([
    ambilProfil(),
    prisma.profilMasjid.findFirst(),
    prisma.ustadz.findMany({ orderBy: { nama: "asc" } }),
    prisma.pengurus.findMany({ orderBy: { urutan: "asc" } }),
  ]);

  return (
    <div className="page-shell">
      <PageHeader kicker="Tentang Kami" title="Profil Masjid" />

      <section className="surface mt-10 p-8 lg:p-10">
        <div className="flex items-center gap-4">
          <LogoMasjid
            nama={branding.nama}
            logo={branding.logo}
            className="h-14 w-14 shrink-0 text-forest-700"
            dekoratif
          />
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight text-forest-900">
              {branding.nama}
            </h2>
            {profil?.alamat && (
              <p className="mt-1 flex items-center gap-2 text-sm text-ink-500">
                <IkonLokasi className="h-4 w-4 shrink-0 text-forest-400" />
                {profil.alamat}
              </p>
            )}
          </div>
        </div>

        {profil?.deskripsi && (
          <p className="mt-6 max-w-3xl leading-relaxed text-ink-500">
            {profil.deskripsi}
          </p>
        )}

        {(profil?.visi || profil?.misi || profil?.sejarah) && (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {profil?.visi && (
              <div className="surface-quiet p-6">
                <h3 className="kicker">Visi</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">
                  {profil.visi}
                </p>
              </div>
            )}
            {profil?.misi && (
              <div className="surface-quiet p-6">
                <h3 className="kicker">Misi</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">
                  {profil.misi}
                </p>
              </div>
            )}
            {profil?.sejarah && (
              <div className="surface-quiet p-6 md:col-span-2">
                <h3 className="kicker">Sejarah</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">
                  {profil.sejarah}
                </p>
              </div>
            )}
          </div>
        )}

        {(profil?.kontak || profil?.email) && (
          <div className="mt-10 flex flex-wrap gap-x-10 gap-y-3 border-t border-forest-900/10 pt-6 text-sm text-ink-500">
            {profil?.kontak && (
              <p className="flex items-center gap-2">
                <IkonTelepon className="h-4 w-4 text-forest-400" />
                {profil.kontak}
              </p>
            )}
            {profil?.email && (
              <p className="flex items-center gap-2">
                <IkonSurel className="h-4 w-4 text-forest-400" />
                <a href={`mailto:${profil.email}`} className="link-hairline">
                  {profil.email}
                </a>
              </p>
            )}
          </div>
        )}
      </section>

      {pengurus.length > 0 && (
        <section className="mt-14">
          <h2 className="section-title">Susunan Pengurus</h2>
          <div className="rule mt-4" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pengurus.map((item) => (
              <div key={item.id} className="surface p-6">
                <div className="flex items-center justify-center">
                  {item.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element -- foto
                    // unggahan berukuran kecil, tidak perlu optimasi Next.
                    <img
                      src={item.foto}
                      alt={item.nama}
                      className="h-16 w-16 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-100 text-base font-semibold text-forest-700">
                      {inisialNama(item.nama)}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-center font-semibold text-forest-900">
                  {item.nama}
                </h3>
                <p className="mt-1 text-center text-sm text-brass">
                  {item.jabatan}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {ustadz.length > 0 && (
        <section className="mt-14">
          <h2 className="section-title">Ustadz &amp; Penceramah</h2>
          <div className="rule mt-4" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ustadz.map((item) => (
              <div key={item.id} className="surface flex gap-4 p-6">
                {item.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element -- foto
                  // unggahan berukuran kecil, tidak perlu optimasi Next.
                  <img
                    src={item.foto}
                    alt={item.nama}
                    className="h-16 w-16 shrink-0 rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-forest-100 text-base font-semibold text-forest-700">
                    {inisialNama(item.nama)}
                  </span>
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold text-forest-900">{item.nama}</h3>
                  {item.spesialisasi && (
                    <p className="mt-1 text-sm text-brass">{item.spesialisasi}</p>
                  )}
                  {item.bio && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-500">
                      {item.bio}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
