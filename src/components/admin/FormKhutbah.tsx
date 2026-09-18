"use client";

import { useEffect, useState } from "react";
import {
  AksiForm,
  KolomTeks,
  PesanFormBox,
  useSimpanForm,
} from "@/components/admin/FormAdmin";
import { KartuAdmin, KepalaAdmin } from "@/components/admin/AdminShell";
import { nilaiInputTanggal } from "@/lib/format";

interface DataKhutbah {
  tanggal: string;
  tema: string;
  penceramah: string;
  lokasi: string | null;
}

export default function FormKhutbah({ id, zona }: { id?: string; zona: string }) {
  const modeEdit = Boolean(id);
  const { menyimpan, pesan, simpan, router } = useSimpanForm();
  const [data, setData] = useState<DataKhutbah>({
    tanggal: nilaiInputTanggal(new Date(), zona),
    tema: "",
    penceramah: "",
    lokasi: "",
  });
  const [memuat, setMemuat] = useState(modeEdit);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/khutbah/${id}`, { cache: "no-store" });
        if (!res.ok) return;
        const hasil = (await res.json()) as {
          tanggal: string;
          tema: string;
          penceramah: string;
          lokasi: string | null;
        };
        setData({
          tanggal: nilaiInputTanggal(hasil.tanggal, zona),
          tema: hasil.tema,
          penceramah: hasil.penceramah,
          lokasi: hasil.lokasi ?? "",
        });
      } catch {
        // Formulir tetap dapat diisi manual.
      } finally {
        setMemuat(false);
      }
    })();
  }, [id, zona]);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    await simpan({
      url: modeEdit ? `/api/admin/khutbah/${id}` : "/api/admin/khutbah",
      method: modeEdit ? "PUT" : "POST",
      body: data,
      suksesUrl: "/admin/khutbah",
      pesanSukses: modeEdit ? "Khutbah diperbarui." : "Jadwal khutbah ditambahkan.",
    });
  }

  if (memuat) {
    return <p className="text-sm text-ink-400">Memuat data khutbah...</p>;
  }

  return (
    <div className="max-w-3xl">
      <KepalaAdmin
        kicker="Konten"
        judul={modeEdit ? "Edit Khutbah" : "Tambah Khutbah"}
        keterangan="Jadwal khutbah Jumat yang tampil pada halaman publik."
      />

      <PesanFormBox pesan={pesan} />

      <form onSubmit={kirim} className="mt-8">
        <KartuAdmin className="space-y-6 p-6 lg:p-8">
          <KolomTeks
            id="tanggal"
            type="date"
            label="Tanggal Jumat"
            nilai={data.tanggal}
            onUbah={(v) => setData({ ...data, tanggal: v })}
            wajib
          />

          <KolomTeks
            id="tema"
            label="Tema khutbah"
            nilai={data.tema}
            onUbah={(v) => setData({ ...data, tema: v })}
            placeholder="Kesabaran dalam Menghadapi Ujian"
            wajib
            maks={200}
          />

          <KolomTeks
            id="penceramah"
            label="Penceramah"
            nilai={data.penceramah}
            onUbah={(v) => setData({ ...data, penceramah: v })}
            placeholder="Ustadz Ahmad Fauzi, Lc."
            wajib
            maks={160}
          />

          <KolomTeks
            id="lokasi"
            label="Lokasi"
            nilai={data.lokasi ?? ""}
            onUbah={(v) => setData({ ...data, lokasi: v })}
            placeholder="Masjid Utama"
            maks={160}
          />

          <AksiForm
            menyimpan={menyimpan}
            labelSimpan={modeEdit ? "Simpan perubahan" : "Tambah khutbah"}
            onBatal={() => router.push("/admin/khutbah")}
          />
        </KartuAdmin>
      </form>
    </div>
  );
}
