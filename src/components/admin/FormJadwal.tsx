"use client";

import { useEffect, useState } from "react";
import {
  AksiForm,
  KolomTeks,
  PesanFormBox,
  useSimpanForm,
} from "@/components/admin/FormAdmin";
import { KartuAdmin, KepalaAdmin } from "@/components/admin/AdminShell";
import { KOTA_INDONESIA, kotaPerProvinsi } from "@/lib/kota";
import { URUTAN_SHALAT } from "@/lib/waktu";
import { nilaiInputTanggal } from "@/lib/format";

type KunciWaktu = "imsak" | "subuh" | "terbit" | "dhuha" | "zuhur" | "ashar" | "maghrib" | "isya";

interface DataJadwal extends Record<KunciWaktu, string> {
  tanggal: string;
  lokasi: string;
}

const LOKASI_BAWAAN = KOTA_INDONESIA[0]!;

export default function FormJadwal({
  id,
  lokasiAwal,
  zona,
}: {
  id?: string;
  lokasiAwal: string;
  zona: string;
}) {
  const modeEdit = Boolean(id);
  const { menyimpan, pesan, simpan, router } = useSimpanForm();
  const [data, setData] = useState<DataJadwal>({
    tanggal: nilaiInputTanggal(new Date(), zona),
    lokasi: lokasiAwal,
    imsak: "04:30",
    subuh: "04:45",
    terbit: "06:00",
    dhuha: "06:18",
    zuhur: "12:05",
    ashar: "15:15",
    maghrib: "18:10",
    isya: "19:15",
  });
  const [memuat, setMemuat] = useState(modeEdit);
  const [mengisi, setMengisi] = useState(false);
  const [infoIsi, setInfoIsi] = useState<string | null>(null);

  const provinsi = KOTA_INDONESIA.find((k) => k.nama === data.lokasi)?.provinsi ?? "";

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/jadwal/${id}`, { cache: "no-store" });
        if (!res.ok) return;
        const hasil = (await res.json()) as Record<string, unknown>;
        setData({
          tanggal: nilaiInputTanggal(String(hasil.tanggal), zona),
          lokasi: String(hasil.lokasi ?? LOKASI_BAWAAN.nama),
          imsak: String(hasil.imsak ?? "04:30"),
          subuh: String(hasil.subuh ?? "04:45"),
          terbit: String(hasil.terbit ?? "06:00"),
          dhuha: String(hasil.dhuha ?? "06:18"),
          zuhur: String(hasil.zuhur ?? "12:05"),
          ashar: String(hasil.ashar ?? "15:15"),
          maghrib: String(hasil.maghrib ?? "18:10"),
          isya: String(hasil.isya ?? "19:15"),
        });
      } catch {
        // Nilai bawaan tetap dipakai bila pengambilan gagal.
      } finally {
        setMemuat(false);
      }
    })();
  }, [id, zona]);

  /**
   * Isi seluruh kolom dari perhitungan server untuk tanggal & lokasi terpilih.
   * Ini jalur yang paling sering dipakai: ambil hasil hisab, lalu sunting
   * seperlunya sesuai jadwal masjid setempat.
   */
  async function isiOtomatis() {
    setMengisi(true);
    setInfoIsi(null);
    try {
      const res = await fetch(
        `/api/jadwal?lokasi=${encodeURIComponent(data.lokasi)}&tanggal=${data.tanggal}`,
        { cache: "no-store" }
      );
      const hasil = (await res.json().catch(() => ({}))) as Partial<
        Record<KunciWaktu, string>
      > & { error?: string };

      if (!res.ok) {
        setInfoIsi(hasil.error ?? "Gagal mengambil hasil perhitungan");
        return;
      }

      setData((sebelumnya) => ({
        ...sebelumnya,
        imsak: hasil.imsak ?? sebelumnya.imsak,
        subuh: hasil.subuh ?? sebelumnya.subuh,
        terbit: hasil.terbit ?? sebelumnya.terbit,
        dhuha: hasil.dhuha ?? sebelumnya.dhuha,
        zuhur: hasil.zuhur ?? sebelumnya.zuhur,
        ashar: hasil.ashar ?? sebelumnya.ashar,
        maghrib: hasil.maghrib ?? sebelumnya.maghrib,
        isya: hasil.isya ?? sebelumnya.isya,
      }));
      setInfoIsi("Kolom diisi dari hasil perhitungan untuk tanggal dan lokasi ini.");
    } catch {
      setInfoIsi("Tidak dapat menghubungi server");
    } finally {
      setMengisi(false);
    }
  }

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    await simpan({
      url: modeEdit ? `/api/admin/jadwal/${id}` : "/api/admin/jadwal",
      method: modeEdit ? "PUT" : "POST",
      body: { ...data, provinsi: provinsi || null },
      suksesUrl: "/admin/jadwal",
      pesanSukses: "Jadwal disimpan sebagai jadwal manual.",
    });
  }

  if (memuat) {
    return <p className="text-sm text-ink-400">Memuat jadwal...</p>;
  }

  return (
    <div className="max-w-3xl">
      <KepalaAdmin
        kicker="Jadwal"
        judul={modeEdit ? "Edit Jadwal Shalat" : "Tambah Jadwal Shalat"}
        keterangan="Jadwal yang disimpan di sini ditandai manual dan tidak akan ditimpa perhitungan otomatis."
      />

      <PesanFormBox pesan={pesan} />

      {infoIsi && (
        <p className="mt-4 rounded-lg border border-forest-500/40 bg-forest-50 px-4 py-3 text-sm text-forest-800">
          {infoIsi}
        </p>
      )}

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
              <label htmlFor="lokasi" className="field-label">
                Lokasi
              </label>
              <select
                id="lokasi"
                className="field"
                value={data.lokasi}
                onChange={(e) => setData({ ...data, lokasi: e.target.value })}
              >
                {kotaPerProvinsi().map((kelompok) => (
                  <optgroup key={kelompok.provinsi} label={kelompok.provinsi}>
                    {kelompok.kota.map((kota) => (
                      <option key={kota.nama} value={kota.nama}>
                        {kota.nama}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {provinsi && (
                <p className="meta mt-1.5">
                  Provinsi: {provinsi} ·{" "}
                  {KOTA_INDONESIA.find((k) => k.nama === data.lokasi)?.zona}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-forest-900/10 pt-6">
            <button
              type="button"
              onClick={() => void isiOtomatis()}
              disabled={mengisi}
              className="btn btn-outline disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mengisi ? "Menghitung..." : "Isi otomatis dari perhitungan"}
            </button>
            <p className="meta">
              Isi kolom di bawah dengan jadwal setempat bila perlu dikoreksi.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {URUTAN_SHALAT.map((item) => (
              <div key={item.key}>
                <label htmlFor={item.key} className="field-label">
                  {item.nama}
                </label>
                <input
                  id={item.key}
                  type="time"
                  className="field tabular-nums"
                  value={data[item.key as KunciWaktu]}
                  onChange={(e) =>
                    setData({ ...data, [item.key]: e.target.value } as DataJadwal)
                  }
                  required={["subuh", "zuhur", "ashar", "maghrib", "isya"].includes(
                    item.key
                  )}
                />
              </div>
            ))}
          </div>

          <AksiForm
            menyimpan={menyimpan}
            labelSimpan={modeEdit ? "Simpan perubahan" : "Simpan jadwal"}
            onBatal={() => router.push("/admin/jadwal")}
          />
        </KartuAdmin>
      </form>
    </div>
  );
}
