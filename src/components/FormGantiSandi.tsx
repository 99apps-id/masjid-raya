"use client";

import { useState } from "react";
import { SANDI_MIN } from "@/lib/validasi";

type Pesan = { jenis: "sukses" | "galat"; teks: string };

/**
 * Form ganti sandi mandiri. Divalidasi di klien untuk umpan balik cepat, dan
 * tetap divalidasi ulang di server (`/api/akun/sandi`) sebagai sumber kebenaran.
 */
export default function FormGantiSandi({ email }: { email?: string | null }) {
  const [sandiLama, setSandiLama] = useState("");
  const [sandiBaru, setSandiBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [pesan, setPesan] = useState<Pesan | null>(null);
  const [memuat, setMemuat] = useState(false);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setPesan(null);

    if (sandiBaru.length < SANDI_MIN) {
      setPesan({
        jenis: "galat",
        teks: `Sandi baru minimal ${SANDI_MIN} karakter.`,
      });
      return;
    }
    if (sandiBaru !== konfirmasi) {
      setPesan({ jenis: "galat", teks: "Konfirmasi sandi tidak cocok." });
      return;
    }

    setMemuat(true);
    try {
      const res = await fetch("/api/akun/sandi", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sandiLama, sandiBaru }),
      });
      const isi = (await res.json().catch(() => null)) as
        | {
            error?: string;
            detail?: { message: string }[];
          }
        | null;

      if (!res.ok) {
        const rincian = Array.isArray(isi?.detail)
          ? isi.detail.map((d) => d.message).join(", ")
          : null;
        setPesan({
          jenis: "galat",
          teks: rincian || isi?.error || "Gagal mengganti sandi.",
        });
        return;
      }

      setPesan({
        jenis: "sukses",
        teks:
          "Sandi berhasil diganti. Gunakan sandi baru pada sesi berikutnya; sesi yang sedang aktif tetap berjalan.",
      });
      setSandiLama("");
      setSandiBaru("");
      setKonfirmasi("");
    } catch {
      setPesan({ jenis: "galat", teks: "Tidak dapat menghubungi server." });
    } finally {
      setMemuat(false);
    }
  }

  return (
    <form onSubmit={kirim} className="surface space-y-5 p-8">
      {pesan && (
        <div
          role="alert"
          className={`rounded-lg border px-4 py-3 text-sm ${
            pesan.jenis === "sukses"
              ? "border-emerald-300/60 bg-emerald-50 text-emerald-800"
              : "border-red-300/60 bg-red-50 text-red-700"
          }`}
        >
          {pesan.teks}
        </div>
      )}

      {email && (
        <p className="text-sm text-ink-500">
          Akun: <span className="font-medium text-forest-800">{email}</span>
        </p>
      )}

      <div>
        <label htmlFor="sandiLama" className="field-label">
          Sandi saat ini
        </label>
        <input
          id="sandiLama"
          type="password"
          value={sandiLama}
          onChange={(e) => setSandiLama(e.target.value)}
          className="field"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </div>

      <div>
        <label htmlFor="sandiBaru" className="field-label">
          Sandi baru
        </label>
        <input
          id="sandiBaru"
          type="password"
          value={sandiBaru}
          onChange={(e) => setSandiBaru(e.target.value)}
          className="field"
          placeholder={`Minimal ${SANDI_MIN} karakter`}
          autoComplete="new-password"
          minLength={SANDI_MIN}
          required
        />
      </div>

      <div>
        <label htmlFor="konfirmasi" className="field-label">
          Ulangi sandi baru
        </label>
        <input
          id="konfirmasi"
          type="password"
          value={konfirmasi}
          onChange={(e) => setKonfirmasi(e.target.value)}
          className="field"
          placeholder="••••••••"
          autoComplete="new-password"
          minLength={SANDI_MIN}
          required
        />
      </div>

      <button
        type="submit"
        disabled={memuat}
        className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {memuat ? "Menyimpan..." : "Simpan sandi baru"}
      </button>
    </form>
  );
}
