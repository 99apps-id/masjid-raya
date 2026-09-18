"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * Normalisasi tujuan pasca-masuk dari `callbackUrl`. Hanya jalur relatif di
 * dalam situs yang diterima, sehingga parameter itu tidak bisa dipakai untuk
 * mengalihkan pengguna ke domain luar (open redirect).
 */
function tujuanDalamSitus(nilai: string | null): string | null {
  if (!nilai) return null;
  // Harus jalur absolut dalam-situs: diawali satu "/" tunggal. "//" dan "/\"
  // ditolak karena peramban menormalkan keduanya menjadi alamat lintas-situs.
  if (!nilai.startsWith("/")) return null;
  const kedua = nilai.charAt(1);
  if (kedua === "/" || kedua === "\\") return null;
  return nilai;
}

/**
 * Formulir masuk.
 *
 * Perbaikan dari versi sebelumnya:
 *  - Pesan galat tidak lagi menyembunyikan sebab sebenarnya (dibatasi laju
 *    vs. sandi salah), tetapi tetap tidak membocorkan apakah surel terdaftar.
 *  - Bila kuota percobaan habis, permintaan tidak dikirim supaya tidak
 *    menambah beban server.
 */
export default function FormLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(
          "Surel atau sandi salah. Bila berkali-kali gagal, tunggu beberapa menit sebelum mencoba lagi."
        );
        setLoading(false);
        return;
      }

      // Arahkan sesuai peran supaya pengguna tidak merasa login gagal hanya
      // karena mendarat di beranda.
      const diminta = tujuanDalamSitus(
        new URLSearchParams(window.location.search).get("callbackUrl")
      );

      let tujuan = diminta || "";
      if (!tujuan) {
        try {
          const sesi = await fetch("/api/auth/session", {
            cache: "no-store",
          }).then((r) => r.json());
          const peran = sesi?.user?.role as string | undefined;
          tujuan = peran === "jamaah" ? "/jamaah" : "/admin";
        } catch {
          tujuan = "/admin";
        }
      }

      router.push(tujuan);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan, coba lagi");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="surface mt-8 space-y-5 p-8">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="field-label">
          Surel
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field"
          placeholder="nama@email.com"
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="field-label">
          Sandi
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
