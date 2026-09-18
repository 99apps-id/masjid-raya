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

interface DataGaleri {
  judul: string;
  deskripsi: string;
  gambar: string | null;
  urutan: string;
}

const AWAL: DataGaleri = { judul: "", deskripsi: "", gambar: null, urutan: "0" };

export default function FormGaleri({ id }: { id?: string }) {
  const modeEdit = Boolean(id);
  const { menyimpan, pesan, simpan, router } = useSimpanForm();
  const [data, setData] = useState<DataGaleri>(AWAL);
  const [memuat, setMemuat] = useState(modeEdit);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/galeri/${id}`, { cache: "no-store" });
        if (!res.ok) return;
        const hasil = (await res.json()) as {
          judul: string;
          deskripsi: string | null;
          gambar: string;
          urutan: number;
        };
        setData({
          judul: hasil.judul,
          deskripsi: hasil.deskripsi ?? "",
          gambar: hasil.gambar,
          urutan: String(hasil.urutan ?? 0),
        });
      } catch {
        // Formulir tetap bisa diisi manual bila pengambilan gagal.
      } finally {
        setMemuat(false);
      }
    })();
  }, [id]);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    await simpan({
      url: modeEdit ? `/api/admin/galeri/${id}` : "/api/admin/galeri",
      method: modeEdit ? "PUT" : "POST",
      body: data,
      suksesUrl: "/admin/galeri",
      pesanSukses: modeEdit ? "Foto galeri diperbarui." : "Foto ditambahkan ke galeri.",
    });
  }

  if (memuat) {
    return <p className="text-sm text-ink-400">Memuat data galeri...</p>;
  }

  return (
    <div className="max-w-3xl">
      <KepalaAdmin
        kicker="Konten"
        judul={modeEdit ? "Edit Foto Galeri" : "Tambah Foto Galeri"}
        keterangan="Foto wajib diunggah. Urutan menentukan posisi tampil di halaman galeri publik."
      />

      <PesanFormBox pesan={pesan} />

      <form onSubmit={kirim} className="mt-8">
        <KartuAdmin className="space-y-6 p-6 lg:p-8">
          <KolomTeks
            id="judul"
            label="Judul foto"
            nilai={data.judul}
            onUbah={(v) => setData({ ...data, judul: v })}
            placeholder="Renovasi ruang utama"
            wajib
            maks={160}
          />

          <KolomArea
            id="deskripsi"
            label="Deskripsi"
            nilai={data.deskripsi}
            onUbah={(v) => setData({ ...data, deskripsi: v })}
            baris={3}
            maks={2000}
          />

          <BerkasUnggah
            folder="kegiatan"
            label="Foto galeri"
            value={data.gambar}
            onChange={(url) => setData({ ...data, gambar: url })}
            petunjuk="PNG/JPG/WebP/GIF maksimal 5 MB. Wajib diisi."
          />

          <KolomTeks
            id="urutan"
            type="number"
            label="Urutan tampil"
            nilai={data.urutan}
            onUbah={(v) => setData({ ...data, urutan: v })}
            petunjuk="Angka kecil tampil lebih dahulu (0 = paling depan)."
          />

          <AksiForm
            menyimpan={menyimpan}
            labelSimpan={modeEdit ? "Simpan perubahan" : "Tambah foto"}
            onBatal={() => router.push("/admin/galeri")}
          />
        </KartuAdmin>
      </form>
    </div>
  );
}
