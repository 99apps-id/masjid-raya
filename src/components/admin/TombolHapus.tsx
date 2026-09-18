"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IkonSampah } from "@/components/Ikon";

interface TombolHapusProps {
  /** Endpoint DELETE, mis. `/api/admin/ustadz/abc123`. */
  endpoint: string;
  /** Nama data, dipakai pada dialog konfirmasi. */
  nama: string;
  /** Nama jenis data, mis. "ustadz". */
  jenis: string;
}

/**
 * Tombol hapus dengan konfirmasi dua langkah.
 *
 * Sebelumnya seluruh endpoint DELETE tidak punya antarmuka sama sekali,
 * sehingga data salah tidak bisa dibuang dari panel.
 */
export default function TombolHapus({ endpoint, nama, jenis }: TombolHapusProps) {
  const router = useRouter();
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [sedangHapus, setSedangHapus] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  async function hapus() {
    setSedangHapus(true);
    setGalat(null);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setGalat(data.error ?? "Gagal menghapus data");
        return;
      }
      setKonfirmasi(false);
      router.refresh();
    } catch {
      setGalat("Tidak dapat menghubungi server");
    } finally {
      setSedangHapus(false);
    }
  }

  if (!konfirmasi) {
    return (
      <button
        type="button"
        onClick={() => setKonfirmasi(true)}
        className="inline-flex items-center gap-1.5 text-sm text-red-700 transition hover:text-red-800"
        aria-label={`Hapus ${jenis} ${nama}`}
      >
        <IkonSampah className="h-4 w-4" />
        Hapus
      </button>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="text-xs text-ink-500">Hapus &ldquo;{nama}&rdquo;?</span>
      <button
        type="button"
        onClick={() => void hapus()}
        disabled={sedangHapus}
        className="rounded-md bg-red-700 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-red-800 disabled:opacity-50"
      >
        {sedangHapus ? "Menghapus..." : "Ya, hapus"}
      </button>
      <button
        type="button"
        onClick={() => setKonfirmasi(false)}
        className="rounded-md border border-forest-900/15 px-2.5 py-1 text-xs text-forest-800 transition hover:bg-forest-50"
      >
        Batal
      </button>
      {galat && <span className="text-xs text-red-700">{galat}</span>}
    </span>
  );
}
