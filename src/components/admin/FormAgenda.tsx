"use client";

import { useEffect, useState } from "react";
import {
  AksiForm,
  KolomArea,
  KolomTeks,
  PesanFormBox,
  useSimpanForm,
} from "@/components/admin/FormAdmin";
import { KartuAdmin, KepalaAdmin } from "@/components/admin/AdminShell";
import { nilaiInputTanggal } from "@/lib/format";

interface DataAgenda {
  nama: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  deskripsi: string;
}

/**
 * Formulir agenda. Tanggal dari API berbentuk ISO lengkap sedangkan input
 * `type="date"` butuh YYYY-MM-DD, jadi keduanya diterjemahkan pada zona waktu
 * lokasi masjid agar tidak bergeser satu hari.
 */
export default function FormAgenda({ id, zona }: { id?: string; zona: string }) {
  const modeEdit = Boolean(id);
  const { menyimpan, pesan, simpan, router } = useSimpanForm();
  const [data, setData] = useState<DataAgenda>({
    nama: "",
    tanggal: nilaiInputTanggal(new Date(), zona),
    waktu: "",
    lokasi: "",
    deskripsi: "",
  });
  const [memuat, setMemuat] = useState(modeEdit);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/agenda/${id}`, { cache: "no-store" });
        if (!res.ok) return;
        const hasil = (await res.json()) as {
          nama: string;
          tanggal: string;
          waktu: string | null;
          lokasi: string | null;
          deskripsi: string | null;
        };
        setData({
          nama: hasil.nama,
          tanggal: nilaiInputTanggal(hasil.tanggal, zona),
          waktu: hasil.waktu ?? "",
          lokasi: hasil.lokasi ?? "",
          deskripsi: hasil.deskripsi ?? "",
        });
      } catch {
        // Formulir tetap bisa diisi manual bila pengambilan gagal.
      } finally {
        setMemuat(false);
      }
    })();
  }, [id, zona]);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    await simpan({
      url: modeEdit ? `/api/admin/agenda/${id}` : "/api/admin/agenda",
      method: modeEdit ? "PUT" : "POST",
      body: data,
      suksesUrl: "/admin/agenda",
      pesanSukses: modeEdit ? "Agenda diperbarui." : "Agenda baru ditambahkan.",
    });
  }

  if (memuat) {
    return <p className="text-sm text-ink-400">Memuat data agenda...</p>;
  }

  return (
    <div className="max-w-3xl">
      <KepalaAdmin
        kicker="Konten"
        judul={modeEdit ? "Edit Agenda" : "Tambah Agenda"}
        keterangan="Agenda tampil pada dasbor jamaah sebagai daftar kegiatan mendatang. Nama dan tanggal wajib diisi."
      />

      <PesanFormBox pesan={pesan} />

      <form onSubmit={kirim} className="mt-8">
        <KartuAdmin className="space-y-6 p-6 lg:p-8">
          <KolomTeks
            id="nama"
            label="Nama agenda"
            nilai={data.nama}
            onUbah={(v) => setData({ ...data, nama: v })}
            placeholder="Halaqah Daurah"
            wajib
            maks={160}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <KolomTeks
              id="tanggal"
              type="date"
              label="Tanggal"
              nilai={data.tanggal}
              onUbah={(v) => setData({ ...data, tanggal: v })}
              wajib
            />
            <KolomTeks
              id="waktu"
              type="time"
              label="Waktu"
              nilai={data.waktu}
              onUbah={(v) => setData({ ...data, waktu: v })}
              petunjuk="Opsional, mis. 19:30"
            />
          </div>

          <KolomTeks
            id="lokasi"
            label="Lokasi"
            nilai={data.lokasi}
            onUbah={(v) => setData({ ...data, lokasi: v })}
            placeholder="Ruang Kajian"
            maks={160}
          />

          <KolomArea
            id="deskripsi"
            label="Deskripsi"
            nilai={data.deskripsi}
            onUbah={(v) => setData({ ...data, deskripsi: v })}
            baris={4}
            maks={4000}
          />

          <AksiForm
            menyimpan={menyimpan}
            labelSimpan={modeEdit ? "Simpan perubahan" : "Tambah agenda"}
            onBatal={() => router.push("/admin/agenda")}
          />
        </KartuAdmin>
      </form>
    </div>
  );
}
