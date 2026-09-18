"use client";

import { useRef, useState } from "react";
import { IkonSampah, IkonUnggah } from "@/components/Ikon";
import type { FolderUnggahan } from "@/lib/upload";

interface BerkasUnggahProps {
  /** Folder tujuan di server; menentukan jenis berkas dan batas ukurannya. */
  folder: FolderUnggahan;
  label: string;
  /** Tautan berkas yang sedang tersimpan, atau null. */
  value: string | null;
  onChange: (url: string | null) => void;
  /** Jenis pratinjau yang ditampilkan di bawah tombol. */
  jenis?: "gambar" | "audio";
  petunjuk?: string;
}

const TERIMA: Record<FolderUnggahan, string> = {
  ustadz: "image/png,image/jpeg,image/webp,image/gif",
  kegiatan: "image/png,image/jpeg,image/webp,image/gif",
  berita: "image/png,image/jpeg,image/webp,image/gif",
  adzan: "audio/mpeg,audio/ogg,audio/wav,audio/mp4,.mp3,.ogg,.wav,.m4a",
  profil: "image/png,image/jpeg,image/webp,image/gif",
};

/**
 * Kolom unggah berkas: mengunggah langsung ke `/api/upload` lalu menyerahkan
 * tautan hasilnya ke formulir induk. Validasi sebenarnya ada di server
 * (magic bytes + batas ukuran); di sini hanya untuk pengalaman pengguna.
 */
export default function BerkasUnggah({
  folder,
  label,
  value,
  onChange,
  jenis = "gambar",
  petunjuk,
}: BerkasUnggahProps) {
  const masukan = useRef<HTMLInputElement>(null);
  const [sedangUnggah, setSedangUnggah] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  async function unggah(berkas: File) {
    setGalat(null);
    setSedangUnggah(true);
    try {
      const formulir = new FormData();
      formulir.append("folder", folder);
      formulir.append("berkas", berkas);

      const res = await fetch("/api/upload", { method: "POST", body: formulir });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };

      if (!res.ok || !data.url) {
        setGalat(data.error ?? "Gagal mengunggah berkas");
        return;
      }
      onChange(data.url);
    } catch {
      setGalat("Tidak dapat menghubungi server");
    } finally {
      setSedangUnggah(false);
      if (masukan.current) masukan.current.value = "";
    }
  }

  return (
    <div>
      <span className="field-label">{label}</span>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={sedangUnggah}
          onClick={() => masukan.current?.click()}
          className="btn btn-outline disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IkonUnggah className="h-4 w-4" />
          {sedangUnggah ? "Mengunggah..." : value ? "Ganti berkas" : "Pilih berkas"}
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="btn btn-quiet text-red-700 hover:text-red-800"
          >
            <IkonSampah className="h-4 w-4" />
            Hapus
          </button>
        )}
      </div>

      <input
        ref={masukan}
        type="file"
        accept={TERIMA[folder]}
        className="hidden"
        onChange={(e) => {
          const berkas = e.target.files?.[0];
          if (berkas) void unggah(berkas);
        }}
      />

      {petunjuk && <p className="meta mt-2">{petunjuk}</p>}
      {galat && (
        <p className="mt-2 text-xs text-red-700" role="alert">
          {galat}
        </p>
      )}

      {value && (
        <div className="mt-3">
          {jenis === "gambar" ? (
            // eslint-disable-next-line @next/next/no-img-element -- pratinjau
            // berkas unggahan berukuran kecil, tidak perlu optimasi Next.
            <img
              src={value}
              alt="Pratinjau berkas"
              className="h-28 w-auto rounded-lg border border-forest-900/10 object-cover"
            />
          ) : (
            <audio src={value} controls preload="none" className="w-full max-w-md" />
          )}
        </div>
      )}
    </div>
  );
}
