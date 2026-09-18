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
import { nilaiInputTanggal } from "@/lib/format";

interface DataKegiatan {
  nama: string;
  deskripsi: string | null;
  tanggalMulai: string;
  tanggalSelesai: string | null;
  lokasi: string | null;
  gambar: string | null;
}

/**
 * Formulir kegiatan. Tanggal dari API berbentuk ISO lengkap, sedangkan input
 * `type="date"` memerlukan YYYY-MM-DD, jadi keduanya perlu diterjemahkan pada
 * zona waktu lokasi masjid agar tidak bergeser satu hari.
 */
export default function FormKegiatan({ id, zona }: { id?: string; zona: string }) {
  const modeEdit = Boolean(id);
  const { menyimpan, pesan, simpan, router } = useSimpanForm();
  const [data, setData] = useState<DataKegiatan>({
    nama: "",
    deskripsi: "",
    tanggalMulai: nilaiInputTanggal(new Date(), zona),
    tanggalSelesai: "",
    lokasi: "",
    gambar: null,
  });
  const [memuat, setMemuat] = useState(modeEdit);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/kegiatan/${id}`, { cache: "no-store" });
        if (!res.ok) return;
        const hasil = (await res.json()) as {
          nama: string;
          deskripsi: string | null;
          tanggalMulai: string;
          tanggalSelesai: string | null;
          lokasi: string | null;
          gambar: string | null;
        };
        setData({
          nama: hasil.nama,
          deskripsi: hasil.deskripsi ?? "",
          tanggalMulai: nilaiInputTanggal(hasil.tanggalMulai, zona),
          tanggalSelesai: hasil.tanggalSelesai
            ? nilaiInputTanggal(hasil.tanggalSelesai, zona)
            : "",
          lokasi: hasil.lokasi ?? "",
          gambar: hasil.gambar,
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
      url: modeEdit ? `/api/admin/kegiatan/${id}` : "/api/admin/kegiatan",
      method: modeEdit ? "PUT" : "POST",
      body: data,
      suksesUrl: "/admin/kegiatan",
      pesanSukses: modeEdit ? "Kegiatan diperbarui." : "Kegiatan baru ditambahkan.",
    });
  }

  if (memuat) {
    return <p className="text-sm text-ink-400">Memuat data kegiatan...</p>;
  }

  return (
    <div className="max-w-3xl">
      <KepalaAdmin
        kicker="Konten"
        judul={modeEdit ? "Edit Kegiatan" : "Tambah Kegiatan"}
        keterangan="Tanggal selesai boleh dikosongkan untuk kegiatan sehari. Foto tampil pada kartu kegiatan di halaman publik."
      />

      <PesanFormBox pesan={pesan} />

      <form onSubmit={kirim} className="mt-8">
        <KartuAdmin className="space-y-6 p-6 lg:p-8">
          <KolomTeks
            id="nama"
            label="Nama kegiatan"
            nilai={data.nama}
            onUbah={(v) => setData({ ...data, nama: v })}
            placeholder="Pengajian Rutin Jumat Pagi"
            wajib
            maks={160}
          />

          <KolomArea
            id="deskripsi"
            label="Deskripsi"
            nilai={data.deskripsi ?? ""}
            onUbah={(v) => setData({ ...data, deskripsi: v })}
            baris={4}
            maks={4000}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <KolomTeks
              id="tanggalMulai"
              type="date"
              label="Tanggal mulai"
              nilai={data.tanggalMulai}
              onUbah={(v) => setData({ ...data, tanggalMulai: v })}
              wajib
            />
            <KolomTeks
              id="tanggalSelesai"
              type="date"
              label="Tanggal selesai"
              nilai={data.tanggalSelesai ?? ""}
              onUbah={(v) => setData({ ...data, tanggalSelesai: v })}
              petunjuk="Kosongkan bila kegiatan hanya sehari"
            />
          </div>

          <KolomTeks
            id="lokasi"
            label="Lokasi"
            nilai={data.lokasi ?? ""}
            onUbah={(v) => setData({ ...data, lokasi: v })}
            placeholder="Masjid Utama"
            maks={160}
          />

          <BerkasUnggah
            folder="kegiatan"
            label="Foto kegiatan"
            value={data.gambar}
            onChange={(url) => setData({ ...data, gambar: url })}
            petunjuk="PNG/JPG/WebP/GIF maksimal 5 MB. Paling rapi dengan rasio mendatar (mis. 4:3)."
          />

          <AksiForm
            menyimpan={menyimpan}
            labelSimpan={modeEdit ? "Simpan perubahan" : "Tambah kegiatan"}
            onBatal={() => router.push("/admin/kegiatan")}
          />
        </KartuAdmin>
      </form>
    </div>
  );
}
