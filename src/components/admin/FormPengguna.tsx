"use client";

import { useEffect, useState } from "react";
import {
  AksiForm,
  KolomTeks,
  PesanFormBox,
  useSimpanForm,
} from "@/components/admin/FormAdmin";
import { KartuAdmin, KepalaAdmin } from "@/components/admin/AdminShell";

type Peran = "admin" | "pengurus" | "jamaah";

interface DataPengguna {
  nama: string;
  email: string;
  role: Peran;
  sandi: string;
}

const AWAL: DataPengguna = { nama: "", email: "", role: "jamaah", sandi: "" };

const LABEL_PERAN: Record<Peran, string> = {
  admin: "Admin — akses penuh, termasuk akun pengguna dan pengaturan.",
  pengurus: "Pengurus — mengelola jadwal, khutbah, kegiatan, dan berita.",
  jamaah: "Jamaah — hanya dapat membuka dasbor jamaah.",
};

export default function FormPengguna({ id }: { id?: string }) {
  const modeEdit = Boolean(id);
  const { menyimpan, pesan, simpan, router } = useSimpanForm();
  const [data, setData] = useState<DataPengguna>(AWAL);
  const [memuat, setMemuat] = useState(modeEdit);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/pengguna/${id}`, { cache: "no-store" });
        if (!res.ok) return;
        const hasil = (await res.json()) as {
          name: string | null;
          email: string;
          role: string;
        };
        setData({
          nama: hasil.name ?? "",
          email: hasil.email,
          role: (hasil.role as Peran) ?? "jamaah",
          sandi: "",
        });
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
      url: modeEdit ? `/api/admin/pengguna/${id}` : "/api/admin/pengguna",
      method: modeEdit ? "PUT" : "POST",
      body: data,
      suksesUrl: "/admin/pengguna",
      pesanSukses: modeEdit ? "Akun diperbarui." : "Akun baru dibuat.",
    });
  }

  if (memuat) {
    return <p className="text-sm text-ink-400">Memuat data pengguna...</p>;
  }

  return (
    <div className="max-w-3xl">
      <KepalaAdmin
        kicker="Administrasi"
        judul={modeEdit ? "Edit Pengguna" : "Tambah Pengguna"}
        keterangan={
          modeEdit
            ? "Kosongkan kolom sandi bila tidak ingin menggantinya."
            : "Buat akun untuk pengurus atau jamaah. Sandi minimal 8 karakter."
        }
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
            id="email"
            type="email"
            label="Surel (untuk masuk)"
            nilai={data.email}
            onUbah={(v) => setData({ ...data, email: v })}
            placeholder="nama@email.com"
            wajib
            maks={160}
          />

          <div>
            <label htmlFor="role" className="field-label">
              Peran
            </label>
            <select
              id="role"
              className="field"
              value={data.role}
              onChange={(e) => setData({ ...data, role: e.target.value as Peran })}
            >
              <option value="jamaah">Jamaah</option>
              <option value="pengurus">Pengurus</option>
              <option value="admin">Admin</option>
            </select>
            <p className="meta mt-1.5">{LABEL_PERAN[data.role]}</p>
          </div>

          <KolomTeks
            id="sandi"
            type="password"
            label={modeEdit ? "Sandi baru (opsional)" : "Sandi"}
            nilai={data.sandi}
            onUbah={(v) => setData({ ...data, sandi: v })}
            placeholder={
              modeEdit ? "Biarkan kosong bila tidak diganti" : "Minimal 8 karakter"
            }
            wajib={!modeEdit}
            maks={200}
            petunjuk={
              modeEdit ? "Isi hanya bila ingin mereset sandi akun ini." : undefined
            }
          />

          <AksiForm
            menyimpan={menyimpan}
            labelSimpan={modeEdit ? "Simpan perubahan" : "Buat akun"}
            onBatal={() => router.push("/admin/pengguna")}
          />
        </KartuAdmin>
      </form>
    </div>
  );
}
