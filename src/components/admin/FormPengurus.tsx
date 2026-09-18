"use client";

import { useEffect, useState } from "react";
import BerkasUnggah from "@/components/admin/BerkasUnggah";
import {
  AksiForm,
  KolomTeks,
  PesanFormBox,
  useSimpanForm,
} from "@/components/admin/FormAdmin";
import { KartuAdmin, KepalaAdmin } from "@/components/admin/AdminShell";

interface DataPengurus {
  nama: string;
  jabatan: string;
  urutan: number;
  foto: string | null;
}

const AWAL: DataPengurus = { nama: "", jabatan: "", urutan: 0, foto: null };

export default function FormPengurus({ id }: { id?: string }) {
  const modeEdit = Boolean(id);
  const { menyimpan, pesan, simpan, router } = useSimpanForm();
  const [data, setData] = useState<DataPengurus>(AWAL);
  const [memuat, setMemuat] = useState(modeEdit);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/pengurus/${id}`, { cache: "no-store" });
        if (res.ok) {
          const hasil = (await res.json()) as DataPengurus;
          setData({ ...AWAL, ...hasil });
        }
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
      url: modeEdit ? `/api/admin/pengurus/${id}` : "/api/admin/pengurus",
      method: modeEdit ? "PUT" : "POST",
      body: data,
      suksesUrl: "/admin/pengurus",
      pesanSukses: modeEdit ? "Data pengurus diperbarui." : "Pengurus baru ditambahkan.",
    });
  }

  if (memuat) {
    return <p className="text-sm text-ink-400">Memuat data pengurus...</p>;
  }

  return (
    <div className="max-w-3xl">
      <KepalaAdmin
        kicker="Konten"
        judul={modeEdit ? "Edit Pengurus" : "Tambah Pengurus"}
        keterangan="Urutan menentukan posisi tampil: angka lebih kecil muncul lebih dahulu."
      />

      <PesanFormBox pesan={pesan} />

      <form onSubmit={kirim} className="mt-8">
        <KartuAdmin className="space-y-6 p-6 lg:p-8">
          <KolomTeks
            id="nama"
            label="Nama lengkap"
            nilai={data.nama}
            onUbah={(v) => setData({ ...data, nama: v })}
            placeholder="H. Muhammad Yusuf"
            wajib
            maks={120}
          />

          <KolomTeks
            id="jabatan"
            label="Jabatan"
            nilai={data.jabatan}
            onUbah={(v) => setData({ ...data, jabatan: v })}
            placeholder="Ketua Takmir"
            wajib
            maks={120}
          />

          <div className="max-w-xs">
            <label htmlFor="urutan" className="field-label">
              Urutan tampil
            </label>
            <input
              id="urutan"
              type="number"
              min={0}
              max={9999}
              className="field"
              value={data.urutan}
              onChange={(e) =>
                setData({ ...data, urutan: Number(e.target.value) || 0 })
              }
            />
          </div>

          <BerkasUnggah
            folder="ustadz"
            label="Foto pengurus"
            value={data.foto}
            onChange={(url) => setData({ ...data, foto: url })}
            petunjuk="Opsional. Bila kosong, ditampilkan inisial nama dalam bulatan."
          />

          <AksiForm
            menyimpan={menyimpan}
            labelSimpan={modeEdit ? "Simpan perubahan" : "Tambah pengurus"}
            onBatal={() => router.push("/admin/pengurus")}
          />
        </KartuAdmin>
      </form>
    </div>
  );
}
