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

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Galeri Foto" };

export default async function AdminGaleriPage() {
  const galeri = await prisma.galeri.findMany({
    orderBy: [{ urutan: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <KepalaAdmin
        kicker="Konten"
        judul="Galeri Foto"
        keterangan="Kumpulan foto kegiatan masjid yang tampil pada halaman galeri publik."
        aksi={
          <TautanAksi href="/admin/galeri/tambah">
            <IkonTambah className="h-4 w-4" />
            Tambah foto
          </TautanAksi>
        }
      />

      <div className="mt-8">
        {galeri.length === 0 ? (
          <KartuAdmin>
            <AdminKosong
              pesan="Galeri masih kosong. Unggah foto pertama agar halaman galeri tidak kosong."
              aksi={{ href: "/admin/galeri/tambah", label: "Tambah foto" }}
            />
          </KartuAdmin>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {galeri.map((item) => (
              <div key={item.id} className="surface flex flex-col overflow-hidden">
                {/* Foto unggahan berukuran kecil, tidak perlu optimasi Next. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.gambar}
                  alt={item.judul}
                  className="h-44 w-full object-cover"
                  loading="lazy"
                />
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-xs uppercase tracking-widest text-ink-400">
                    Urutan {item.urutan}
                  </span>
                  <h3 className="mt-1.5 font-semibold leading-snug text-forest-900">
                    {item.judul}
                  </h3>
                  {item.deskripsi && (
                    <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-500">
                      {item.deskripsi}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-end gap-5 border-t border-forest-900/10 pt-4">
                    <Link
                      href={`/admin/galeri/${item.id}/edit`}
                      className="inline-flex items-center gap-1.5 text-sm text-forest-700 transition hover:text-forest-600"
                    >
                      <IkonPensil className="h-4 w-4" />
                      Edit
                    </Link>
                    <TombolHapus
                      endpoint={`/api/admin/galeri/${item.id}`}
                      nama={item.judul}
                      jenis="foto"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
