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

type PeranPetugas = "imam" | "khatib" | "bilal" | "muadzin";

interface DataPetugas {
  tanggal: string;
  peran: PeranPetugas;
  nama: string;
  keterangan: string;
}

const LABEL_PERAN: Record<PeranPetugas, string> = {
  imam: "Imam — pemimpin shalat berjamaah",
  khatib: "Khatib — penceramah shalat Jumat",
  bilal: "Bilal — pengumandang adzan",
  muadzin: "Muadzin — pendamping adzan dan iqomah",
};

export default function FormPetugas({ id, zona }: { id?: string; zona: string }) {
  const modeEdit = Boolean(id);
  const { menyimpan, pesan, simpan, router } = useSimpanForm();
  const [data, setData] = useState<DataPetugas>({
    tanggal: nilaiInputTanggal(new Date(), zona),
    peran: "imam",
    nama: "",
    keterangan: "",
  });
  const [memuat, setMemuat] = useState(modeEdit);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/petugas/${id}`, { cache: "no-store" });
        if (!res.ok) return;
        const hasil = (await res.json()) as {
          tanggal: string;
          peran: string;
          nama: string;
          keterangan: string | null;
        };
        setData({
          tanggal: nilaiInputTanggal(hasil.tanggal, zona),
          peran: (hasil.peran as PeranPetugas) ?? "imam",
          nama: hasil.nama,
          keterangan: hasil.keterangan ?? "",
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
      url: modeEdit ? `/api/admin/petugas/${id}` : "/api/admin/petugas",
      method: modeEdit ? "PUT" : "POST",
      body: data,
      suksesUrl: "/admin/petugas",
      pesanSukses: modeEdit ? "Jadwal petugas diperbarui." : "Petugas ditambahkan.",
    });
  }

  if (memuat) {
    return <p className="text-sm text-ink-400">Memuat data petugas...</p>;
  }

  return (
    <div className="max-w-3xl">
      <KepalaAdmin
        kicker="Konten"
        judul={modeEdit ? "Edit Petugas" : "Tambah Petugas"}
        keterangan="Satu baris adalah satu tugas pada satu tanggal. Halaman petugas mengelompokkannya per pekan."
      />

      <PesanFormBox pesan={pesan} />

      <form onSubmit={kirim} className="mt-8">
        <KartuAdmin className="space-y-6 p-6 lg:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <KolomTeks
              id="tanggal"
              type="date"
              label="Tanggal bertugas"
              nilai={data.tanggal}
              onUbah={(v) => setData({ ...data, tanggal: v })}
              wajib
            />
            <div>
              <label htmlFor="peran" className="field-label">
                Peran
              </label>
              <select
                id="peran"
                className="field"
                value={data.peran}
                onChange={(e) =>
                  setData({ ...data, peran: e.target.value as PeranPetugas })
                }
              >
                <option value="imam">Imam</option>
                <option value="khatib">Khatib</option>
                <option value="bilal">Bilal</option>
                <option value="muadzin">Muadzin</option>
              </select>
              <p className="meta mt-1.5">{LABEL_PERAN[data.peran]}</p>
            </div>
          </div>

          <KolomTeks
            id="nama"
            label="Nama petugas"
            nilai={data.nama}
            onUbah={(v) => setData({ ...data, nama: v })}
            placeholder="Ustadz Ahmad Fauzi, Lc."
            wajib
            maks={120}
          />

          <KolomTeks
            id="keterangan"
            label="Keterangan"
            nilai={data.keterangan}
            onUbah={(v) => setData({ ...data, keterangan: v })}
            placeholder="Shalat Jumat, Rawatib, ..."
            maks={200}
          />

          <AksiForm
            menyimpan={menyimpan}
            labelSimpan={modeEdit ? "Simpan perubahan" : "Tambah petugas"}
            onBatal={() => router.push("/admin/petugas")}
          />
        </KartuAdmin>
      </form>
    </div>
  );
}
