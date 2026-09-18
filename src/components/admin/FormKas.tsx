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

type JenisKas = "masuk" | "keluar";

interface DataKas {
  tanggal: string;
  jenis: JenisKas;
  kategori: string;
  keterangan: string;
  jumlah: string;
}

export default function FormKas({ id, zona }: { id?: string; zona: string }) {
  const modeEdit = Boolean(id);
  const { menyimpan, pesan, simpan, router } = useSimpanForm();
  const [data, setData] = useState<DataKas>({
    tanggal: nilaiInputTanggal(new Date(), zona),
    jenis: "masuk",
    kategori: "",
    keterangan: "",
    jumlah: "",
  });
  const [memuat, setMemuat] = useState(modeEdit);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/kas/${id}`, { cache: "no-store" });
        if (!res.ok) return;
        const hasil = (await res.json()) as {
          tanggal: string;
          jenis: string;
          kategori: string | null;
          keterangan: string;
          jumlah: number;
        };
        setData({
          tanggal: nilaiInputTanggal(hasil.tanggal, zona),
          jenis: hasil.jenis === "keluar" ? "keluar" : "masuk",
          kategori: hasil.kategori ?? "",
          keterangan: hasil.keterangan,
          jumlah: String(hasil.jumlah),
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
      url: modeEdit ? `/api/admin/kas/${id}` : "/api/admin/kas",
      method: modeEdit ? "PUT" : "POST",
      body: data,
      suksesUrl: "/admin/kas",
      pesanSukses: modeEdit
        ? "Transaksi kas diperbarui."
        : "Transaksi kas dicatat.",
    });
  }

  if (memuat) {
    return <p className="text-sm text-ink-400">Memuat transaksi kas...</p>;
  }

  return (
    <div className="max-w-3xl">
      <KepalaAdmin
        kicker="Keuangan"
        judul={modeEdit ? "Edit Transaksi Kas" : "Catat Transaksi Kas"}
        keterangan="Jumlah selalu positif; arah pemasukan atau pengeluaran ditentukan oleh jenis."
      />

      <PesanFormBox pesan={pesan} />

      <form onSubmit={kirim} className="mt-8">
        <KartuAdmin className="space-y-6 p-6 lg:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <KolomTeks
              id="tanggal"
              type="date"
              label="Tanggal"
              nilai={data.tanggal}
              onUbah={(v) => setData({ ...data, tanggal: v })}
              wajib
            />
            <div>
              <label htmlFor="jenis" className="field-label">
                Jenis
              </label>
              <select
                id="jenis"
                className="field"
                value={data.jenis}
                onChange={(e) =>
                  setData({ ...data, jenis: e.target.value as JenisKas })
                }
              >
                <option value="masuk">Pemasukan</option>
                <option value="keluar">Pengeluaran</option>
              </select>
            </div>
          </div>

          <KolomTeks
            id="jumlah"
            type="number"
            label="Jumlah (Rp)"
            nilai={data.jumlah}
            onUbah={(v) => setData({ ...data, jumlah: v })}
            placeholder="50000"
            wajib
            petunjuk="Rupiah penuh tanpa titik atau koma."
          />

          <KolomTeks
            id="kategori"
            label="Kategori"
            nilai={data.kategori}
            onUbah={(v) => setData({ ...data, kategori: v })}
            placeholder="Infaq Jumat, Listrik & air, ..."
            maks={80}
          />

          <KolomTeks
            id="keterangan"
            label="Keterangan"
            nilai={data.keterangan}
            onUbah={(v) => setData({ ...data, keterangan: v })}
            placeholder="Infaq kotak amal Jumat"
            wajib
            maks={200}
          />

          <AksiForm
            menyimpan={menyimpan}
            labelSimpan={modeEdit ? "Simpan perubahan" : "Catat transaksi"}
            onBatal={() => router.push("/admin/kas")}
          />
        </KartuAdmin>
      </form>
    </div>
  );
}
