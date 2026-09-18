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

interface DataUstadz {
  nama: string;
  spesialisasi: string | null;
  bio: string | null;
  foto: string | null;
}

const AWAL: DataUstadz = { nama: "", spesialisasi: "", bio: "", foto: null };

export default function FormUstadz({ id }: { id?: string }) {
  const modeEdit = Boolean(id);
  const { menyimpan, pesan, simpan, router } = useSimpanForm();
  const [data, setData] = useState<DataUstadz>(AWAL);
  const [memuat, setMemuat] = useState(modeEdit);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/ustadz/${id}`, { cache: "no-store" });
        if (res.ok) {
          const hasil = (await res.json()) as DataUstadz;
          setData({ ...AWAL, ...hasil });
        }
      } catch {
        // Biarkan formulir kosong bila pengambilan gagal; pesan muncul saat simpan.
      } finally {
        setMemuat(false);
      }
    })();
  }, [id]);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    await simpan({
      url: modeEdit ? `/api/admin/ustadz/${id}` : "/api/admin/ustadz",
      method: modeEdit ? "PUT" : "POST",
      body: data,
      suksesUrl: "/admin/ustadz",
      pesanSukses: modeEdit ? "Data ustadz diperbarui." : "Ustadz baru ditambahkan.",
    });
  }

  if (memuat) {
    return <p className="text-sm text-ink-400">Memuat data ustadz...</p>;
  }

  return (
    <div className="max-w-3xl">
      <KepalaAdmin
        kicker="Konten"
        judul={modeEdit ? "Edit Ustadz" : "Tambah Ustadz"}
        keterangan="Nama wajib diisi. Foto bersifat opsional dan tampil berbentuk bulat di halaman profil."
      />

      <PesanFormBox pesan={pesan} />

      <form onSubmit={kirim} className="mt-8">
        <KartuAdmin className="space-y-6 p-6 lg:p-8">
          <KolomTeks
            id="nama"
            label="Nama lengkap"
            nilai={data.nama}
            onUbah={(v) => setData({ ...data, nama: v })}
            placeholder="Ustadz Ahmad Fauzi, Lc."
            wajib
            maks={120}
          />

          <KolomTeks
            id="spesialisasi"
            label="Spesialisasi"
            nilai={data.spesialisasi ?? ""}
            onUbah={(v) => setData({ ...data, spesialisasi: v })}
            placeholder="Tafsir Al-Quran, Fiqh"
            maks={160}
          />

          <KolomArea
            id="bio"
            label="Biografi singkat"
            nilai={data.bio ?? ""}
            onUbah={(v) => setData({ ...data, bio: v })}
            baris={4}
            maks={2000}
          />

          <BerkasUnggah
            folder="ustadz"
            label="Foto ustadz"
            value={data.foto}
            onChange={(url) => setData({ ...data, foto: url })}
            petunjuk="PNG/JPG/WebP/GIF maksimal 5 MB. Sebaiknya berbentuk persegi agar tampil rapi."
          />

          <AksiForm
            menyimpan={menyimpan}
            labelSimpan={modeEdit ? "Simpan perubahan" : "Tambah ustadz"}
            onBatal={() => router.push("/admin/ustadz")}
          />
        </KartuAdmin>
      </form>
    </div>
  );
}
