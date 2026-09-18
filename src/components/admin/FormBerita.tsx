"use client";

import { useEffect, useState } from "react";
import BerkasUnggah from "@/components/admin/BerkasUnggah";
import {
  AksiForm,
  KolomArea,
  KolomTeks,
  PesanFormBox,
  useSimpanForm,
} from "@/components/admin/FormAdmin";
import { KartuAdmin, KepalaAdmin } from "@/components/admin/AdminShell";

interface DataBerita {
  judul: string;
  isi: string;
  kategori: "berita" | "pengumuman";
  published: boolean;
  gambar: string | null;
}

const AWAL: DataBerita = {
  judul: "",
  isi: "",
  kategori: "berita",
  published: true,
  gambar: null,
};

export default function FormBerita({ id }: { id?: string }) {
  const modeEdit = Boolean(id);
  const { menyimpan, pesan, simpan, router } = useSimpanForm();
  const [data, setData] = useState<DataBerita>(AWAL);
  const [memuat, setMemuat] = useState(modeEdit);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/berita/${id}`, { cache: "no-store" });
        if (!res.ok) return;
        const hasil = (await res.json()) as {
          judul: string;
          isi: string;
          kategori: string;
          published: boolean;
          gambar: string | null;
        };
        setData({
          judul: hasil.judul,
          isi: hasil.isi,
          kategori: hasil.kategori === "pengumuman" ? "pengumuman" : "berita",
          published: Boolean(hasil.published),
          gambar: hasil.gambar,
        });
      } catch {
        // Formulir tetap dapat diisi manual.
      } finally {
        setMemuat(false);
      }
    })();
  }, [id]);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    await simpan({
      url: modeEdit ? `/api/admin/berita/${id}` : "/api/admin/berita",
      method: modeEdit ? "PUT" : "POST",
      body: data,
      suksesUrl: "/admin/berita",
      pesanSukses: modeEdit ? "Berita diperbarui." : "Berita baru diterbitkan.",
    });
  }

  if (memuat) {
    return <p className="text-sm text-ink-400">Memuat berita...</p>;
  }

  return (
    <div className="max-w-3xl">
      <KepalaAdmin
        kicker="Konten"
        judul={modeEdit ? "Edit Berita" : "Tambah Berita"}
        keterangan="Pisahkan antar paragraf dengan enter. Berita berstatus draf tidak tampil di halaman publik."
      />

      <PesanFormBox pesan={pesan} />

      <form onSubmit={kirim} className="mt-8">
        <KartuAdmin className="space-y-6 p-6 lg:p-8">
          <KolomTeks
            id="judul"
            label="Judul"
            nilai={data.judul}
            onUbah={(v) => setData({ ...data, judul: v })}
            wajib
            maks={200}
          />

          <KolomArea
            id="isi"
            label="Isi berita"
            nilai={data.isi}
            onUbah={(v) => setData({ ...data, isi: v })}
            baris={10}
            maks={20000}
            petunjuk="Dua puluh ribu karakter pertama tersimpan. Teks biasa, tanpa HTML."
          />

          <div>
            <label htmlFor="kategori" className="field-label">
              Kategori
            </label>
            <select
              id="kategori"
              className="field"
              value={data.kategori}
              onChange={(e) =>
                setData({
                  ...data,
                  kategori: e.target.value === "pengumuman" ? "pengumuman" : "berita",
                })
              }
            >
              <option value="berita">Berita</option>
              <option value="pengumuman">Pengumuman</option>
            </select>
          </div>

          <div className="flex items-start justify-between gap-6 rounded-lg border border-forest-900/10 bg-forest-50/50 p-4">
            <div>
              <p className="text-sm font-medium text-forest-900">
                Terbitkan sekarang
              </p>
              <p className="meta mt-1">
                Matikan untuk menyimpan sebagai draf; isinya belum bisa dibuka
                publik.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={data.published}
              aria-label="Terbitkan sekarang"
              onClick={() => setData({ ...data, published: !data.published })}
              className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                data.published ? "bg-forest-600" : "bg-forest-900/20"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                  data.published ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <BerkasUnggah
            folder="berita"
            label="Gambar berita"
            value={data.gambar}
            onChange={(url) => setData({ ...data, gambar: url })}
            petunjuk="Opsional. Tampil sebagai gambar utama pada kartu berita."
          />

          <AksiForm
            menyimpan={menyimpan}
            labelSimpan={modeEdit ? "Simpan perubahan" : "Simpan berita"}
            onBatal={() => router.push("/admin/berita")}
          />
        </KartuAdmin>
      </form>
    </div>
  );
}
