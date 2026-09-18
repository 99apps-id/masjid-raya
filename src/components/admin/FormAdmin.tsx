"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface PesanForm {
  jenis: "ok" | "galat";
  teks: string;
}

/** Kotak pesan hasil simpan, menampilkan rincian galat per kolom. */
export function PesanFormBox({ pesan }: { pesan: PesanForm | null }) {
  if (!pesan) return null;
  return (
    <div
      role="status"
      className={`mt-6 rounded-lg border px-4 py-3 text-sm ${
        pesan.jenis === "ok"
          ? "border-forest-500/40 bg-forest-50 text-forest-800"
          : "border-red-300/60 bg-red-50 text-red-700"
      }`}
    >
      {pesan.teks}
    </div>
  );
}

interface OpsiSimpan {
  url: string;
  method: "POST" | "PUT";
  body: unknown;
  /** Halaman yang dibuka setelah berhasil. */
  suksesUrl: string;
  pesanSukses?: string;
}

/**
 * Menyatukan penyimpanan formulir admin: mengirim JSON, menerjemahkan galat
 * validasi dari server menjadi pesan yang bisa dibaca, lalu mengarahkan ulang.
 *
 * Sebelumnya setiap halaman menyimpan dengan `alert("Gagal ...")` tanpa
 * melihat isi respons, sehingga sebab kegagalan (mis. kolom wajib kosong)
 * tidak pernah terlihat oleh pengurus.
 */
export function useSimpanForm() {
  const router = useRouter();
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesan, setPesan] = useState<PesanForm | null>(null);

  async function simpan(opsi: OpsiSimpan): Promise<boolean> {
    setMenyimpan(true);
    setPesan(null);

    try {
      const res = await fetch(opsi.url, {
        method: opsi.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(opsi.body),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          detail?: { field: string; message: string }[];
        };
        const rincian = data.detail
          ?.map((d) => `${d.field}: ${d.message}`)
          .join("; ");
        setPesan({
          jenis: "galat",
          teks: rincian
            ? `${data.error ?? "Gagal menyimpan"} — ${rincian}`
            : (data.error ?? "Gagal menyimpan data"),
        });
        return false;
      }

      setPesan({ jenis: "ok", teks: opsi.pesanSukses ?? "Data tersimpan." });
      router.push(opsi.suksesUrl);
      router.refresh();
      return true;
    } catch {
      setPesan({ jenis: "galat", teks: "Tidak dapat menghubungi server" });
      return false;
    } finally {
      setMenyimpan(false);
    }
  }

  return { menyimpan, pesan, simpan, router };
}

/** Baris aksi standar di bawah formulir admin. */
export function AksiForm({
  menyimpan,
  labelSimpan,
  onBatal,
}: {
  menyimpan: boolean;
  labelSimpan: string;
  onBatal: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-forest-900/10 pt-6">
      <button
        type="submit"
        disabled={menyimpan}
        className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {menyimpan ? "Menyimpan..." : labelSimpan}
      </button>
      <button
        type="button"
        onClick={onBatal}
        className="btn btn-outline"
        disabled={menyimpan}
      >
        Batal
      </button>
    </div>
  );
}

/** Kolom teks sederhana dengan label dan petunjuk opsional. */
export function KolomTeks({
  id,
  label,
  nilai,
  onUbah,
  petunjuk,
  placeholder,
  type = "text",
  wajib = false,
  maks,
}: {
  id: string;
  label: string;
  nilai: string;
  onUbah: (nilai: string) => void;
  petunjuk?: string;
  placeholder?: string;
  type?: string;
  wajib?: boolean;
  maks?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="field"
        value={nilai}
        onChange={(e) => onUbah(e.target.value)}
        placeholder={placeholder}
        required={wajib}
        maxLength={maks}
      />
      {petunjuk && <p className="meta mt-1.5">{petunjuk}</p>}
    </div>
  );
}

/** Kolom teks panjang. */
export function KolomArea({
  id,
  label,
  nilai,
  onUbah,
  petunjuk,
  baris = 4,
  maks,
}: {
  id: string;
  label: string;
  nilai: string;
  onUbah: (nilai: string) => void;
  petunjuk?: string;
  baris?: number;
  maks?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <textarea
        id={id}
        className="field"
        rows={baris}
        value={nilai}
        onChange={(e) => onUbah(e.target.value)}
        maxLength={maks}
      />
      {petunjuk && <p className="meta mt-1.5">{petunjuk}</p>}
    </div>
  );
}
