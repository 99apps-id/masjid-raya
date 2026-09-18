"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BerkasUnggah from "@/components/admin/BerkasUnggah";
import { KepalaAdmin, KartuAdmin } from "@/components/admin/AdminShell";

interface Profil {
  nama: string;
  deskripsi: string | null;
  visi: string | null;
  misi: string | null;
  sejarah: string | null;
  alamat: string | null;
  kontak: string | null;
  email: string | null;
  logo: string | null;
  favicon: string | null;
}

const AWAL: Profil = {
  nama: "",
  deskripsi: null,
  visi: null,
  misi: null,
  sejarah: null,
  alamat: null,
  kontak: null,
  email: null,
  logo: null,
  favicon: null,
};

export default function AdminProfilPage() {
  const router = useRouter();
  const [profil, setProfil] = useState<Profil>(AWAL);
  const [memuat, setMemuat] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesan, setPesan] = useState<{ jenis: "ok" | "galat"; teks: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/profil", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as Profil;
          setProfil({ ...AWAL, ...data });
        } else {
          setPesan({ jenis: "galat", teks: "Gagal memuat profil masjid" });
        }
      } catch {
        setPesan({ jenis: "galat", teks: "Tidak dapat menghubungi server" });
      } finally {
        setMemuat(false);
      }
    })();
  }, []);

  function ubah<K extends keyof Profil>(kunci: K, nilai: Profil[K]) {
    setProfil((sebelumnya) => ({ ...sebelumnya, [kunci]: nilai }));
  }

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    setMenyimpan(true);
    setPesan(null);

    try {
      const res = await fetch("/api/admin/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profil),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          detail?: { field: string; message: string }[];
        };
        const rincian = data.detail?.map((d) => `${d.field}: ${d.message}`).join("; ");
        setPesan({
          jenis: "galat",
          teks: rincian ? `${data.error ?? "Gagal menyimpan"} — ${rincian}` : (data.error ?? "Gagal menyimpan profil"),
        });
        return;
      }

      setPesan({
        jenis: "ok",
        teks: "Profil tersimpan. Nama dan logo baru langsung dipakai di seluruh halaman.",
      });
      router.refresh();
    } catch {
      setPesan({ jenis: "galat", teks: "Tidak dapat menghubungi server" });
    } finally {
      setMenyimpan(false);
    }
  }

  if (memuat) {
    return <p className="text-sm text-ink-400">Memuat profil masjid...</p>;
  }

  return (
    <div>
      <KepalaAdmin
        kicker="Identitas"
        judul="Profil Masjid"
        keterangan="Nama masjid atau mushola, alamat, dan logo dapat diganti kapan saja. Perubahan langsung terlihat pada seluruh halaman publik."
      />

      {pesan && (
        <div
          role="status"
          className={`mt-6 rounded-lg border px-4 py-3 text-sm ${
            pesan.jenis === "ok"
              ? "border-forest-500/40 bg-forest-50 text-forest-800"
              : "border-red-300/60 bg-red-50 text-red-700"
          }`}
        >
          {pesan.teks}
        </div>
      )}

      <form onSubmit={simpan} className="mt-8 space-y-8">
        <KartuAdmin className="p-6 lg:p-8">
          <h2 className="section-title">Identitas Utama</h2>
          <div className="rule mt-4" />

          <div className="mt-6 grid gap-6">
            <div>
              <label htmlFor="nama" className="field-label">
                Nama masjid / mushola
              </label>
              <input
                id="nama"
                className="field"
                value={profil.nama}
                onChange={(e) => ubah("nama", e.target.value)}
                placeholder="Masjid Raya Pro"
                maxLength={160}
                required
              />
              <p className="meta mt-2">
                Nama ini muncul di judul halaman, navbar, papan informasi, dan footer.
              </p>
            </div>

            <div>
              <label htmlFor="alamat" className="field-label">
                Alamat
              </label>
              <input
                id="alamat"
                className="field"
                value={profil.alamat ?? ""}
                onChange={(e) => ubah("alamat", e.target.value)}
                placeholder="Jl. Merdeka No. 1, Jakarta Pusat"
                maxLength={300}
              />
            </div>

            <div>
              <label htmlFor="deskripsi" className="field-label">
                Deskripsi singkat
              </label>
              <textarea
                id="deskripsi"
                className="field"
                rows={3}
                value={profil.deskripsi ?? ""}
                onChange={(e) => ubah("deskripsi", e.target.value)}
                maxLength={4000}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="kontak" className="field-label">
                  Telepon / kontak
                </label>
                <input
                  id="kontak"
                  className="field"
                  value={profil.kontak ?? ""}
                  onChange={(e) => ubah("kontak", e.target.value)}
                  placeholder="(021) 123-4567"
                  maxLength={80}
                />
              </div>
              <div>
                <label htmlFor="email" className="field-label">
                  Surel
                </label>
                <input
                  id="email"
                  type="email"
                  className="field"
                  value={profil.email ?? ""}
                  onChange={(e) => ubah("email", e.target.value)}
                  placeholder="info@masjid.id"
                  maxLength={160}
                />
              </div>
            </div>
          </div>
        </KartuAdmin>

        <KartuAdmin className="p-6 lg:p-8">
          <h2 className="section-title">Logo &amp; Favicon</h2>
          <div className="rule mt-4" />

          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <BerkasUnggah
              folder="profil"
              label="Logo masjid"
              value={profil.logo}
              onChange={(url) => ubah("logo", url)}
              petunjuk="PNG/JPG/WebP/GIF maksimal 3 MB. Tampil di navbar, footer, dan papan informasi. Bila kosong, dipakai lambang bawaan."
            />
            <BerkasUnggah
              folder="profil"
              label="Favicon (ikon tab peramban)"
              value={profil.favicon}
              onChange={(url) => ubah("favicon", url)}
              petunjuk="Kotak lebih serasi. Bila kosong, favicon memakai logo. Muat ulang halaman setelah menyimpan untuk melihat ikon baru."
            />
          </div>
        </KartuAdmin>

        <KartuAdmin className="p-6 lg:p-8">
          <h2 className="section-title">Visi, Misi, dan Sejarah</h2>
          <div className="rule mt-4" />

          <div className="mt-6 grid gap-6">
            <div>
              <label htmlFor="visi" className="field-label">
                Visi
              </label>
              <textarea
                id="visi"
                className="field"
                rows={2}
                value={profil.visi ?? ""}
                onChange={(e) => ubah("visi", e.target.value)}
                maxLength={2000}
              />
            </div>
            <div>
              <label htmlFor="misi" className="field-label">
                Misi
              </label>
              <textarea
                id="misi"
                className="field"
                rows={3}
                value={profil.misi ?? ""}
                onChange={(e) => ubah("misi", e.target.value)}
                maxLength={2000}
              />
            </div>
            <div>
              <label htmlFor="sejarah" className="field-label">
                Sejarah
              </label>
              <textarea
                id="sejarah"
                className="field"
                rows={4}
                value={profil.sejarah ?? ""}
                onChange={(e) => ubah("sejarah", e.target.value)}
                maxLength={6000}
              />
            </div>
          </div>
        </KartuAdmin>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={menyimpan}
            className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {menyimpan ? "Menyimpan..." : "Simpan profil"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="btn btn-outline"
          >
            Lihat situs
          </button>
        </div>
      </form>
    </div>
  );
}
