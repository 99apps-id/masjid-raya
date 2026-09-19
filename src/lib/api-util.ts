import { NextResponse } from "next/server";
import { z } from "zod";
import { ringkasGalat } from "./validasi";

/**
 * Pembantu bersama untuk route admin: membaca badan permintaan yang sudah
 * tervalidasi, dan menerjemahkan galat database menjadi status HTTP yang benar.
 *
 * Sebelumnya setiap route memakai `catch` yang selalu membalas 500 — termasuk
 * ketika id tidak ditemukan — sehingga antarmuka tidak bisa membedakan "gagal
 * server" dari "data sudah tidak ada".
 */

export type HasilBaca<T> =
  | { ok: true; data: T }
  | { ok: false; respons: NextResponse };

/** Baca dan validasi badan permintaan JSON. */
export async function bacaTubuh<Skema extends z.ZodTypeAny>(
  req: Request,
  skema: Skema
): Promise<HasilBaca<z.output<Skema>>> {
  // Batasi ukuran badan permintaan untuk mencegah DoS melalui payload JSON
  // yang sangat besar. 100 KB lebih cukup untuk seluruh skema yang ada.
  const ukuranMaks = 100 * 1024;
  const panjang = req.headers.get("content-length");
  if (panjang && Number(panjang) > ukuranMaks) {
    return {
      ok: false,
      respons: NextResponse.json(
        { error: `Badan permintaan terlalu besar (maksimal ${Math.round(ukuranMaks / 1024)} KB)` },
        { status: 413 }
      ),
    };
  }

  let mentah: unknown;
  try {
    mentah = await req.json();
  } catch {
    return {
      ok: false,
      respons: NextResponse.json(
        { error: "Badan permintaan harus JSON yang sah" },
        { status: 400 }
      ),
    };
  }

  const hasil = skema.safeParse(mentah);
  if (!hasil.success) {
    return { ok: false, respons: NextResponse.json(ringkasGalat(hasil.error), { status: 400 }) };
  }

  return { ok: true, data: hasil.data };
}

/** Terjemahkan galat Prisma menjadi respons yang tepat. */
export function galatDatabase(error: unknown, pesan: string): NextResponse {
  const kode = (error as { code?: string } | null)?.code;

  if (kode === "P2025") {
    return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
  }
  if (kode === "P2002") {
    return NextResponse.json(
      { error: "Data dengan penanda unik yang sama sudah ada" },
      { status: 409 }
    );
  }
  if (kode === "P2003") {
    return NextResponse.json(
      { error: "Data ini masih dirujuk oleh data lain" },
      { status: 409 }
    );
  }

  console.error(pesan, error);
  return NextResponse.json({ error: pesan }, { status: 500 });
}

export function tidakDitemukan(): NextResponse {
  return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
}

/** Ubah YYYY-MM-DD menjadi Date pada tengah malam UTC (acuan hari kalender). */
export function tanggalKeDate(tanggal: string): Date {
  return new Date(`${tanggal}T00:00:00.000Z`);
}

export function dateKeTanggal(nilai: Date | null | undefined): string | null {
  if (!nilai) return null;
  return nilai.toISOString().slice(0, 10);
}
