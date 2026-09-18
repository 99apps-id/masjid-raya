import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  direktoriUnggahan,
  folderUnggahanValid,
  mimeDariEkstensi,
  namaBerkasAman,
} from "@/lib/upload";

/**
 * Sajikan berkas unggahan.
 *
 * Berkas disimpan di luar `public/` sehingga satu-satunya jalan keluar adalah
 * route ini, yang bisa memaksa `Content-Type` yang benar, melarang sniffing
 * tipe, dan menolak nama berkas berbahaya (path traversal, ekstensi ganda).
 * Nama berkas dibuat acak saat diunggah, jadi isinya tidak akan berubah untuk
 * nama yang sama — aman di-cache selamanya.
 */

export const runtime = "nodejs";

const KONTROL_CACHE = "public, max-age=31536000, immutable";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ folder: string; nama: string }> }
) {
  const { folder, nama } = await params;

  if (!folderUnggahanValid(folder) || !namaBerkasAman(nama)) {
    return NextResponse.json({ error: "Berkas tidak ditemukan" }, { status: 404 });
  }

  const dasar = path.join(direktoriUnggahan(), folder);
  const berkas = path.join(dasar, nama);

  // Sabuk pengaman kedua: pastikan hasil penggabungan tetap di dalam folder.
  if (!berkas.startsWith(dasar + path.sep)) {
    return NextResponse.json({ error: "Berkas tidak ditemukan" }, { status: 404 });
  }

  let isi: Buffer;
  try {
    isi = await readFile(berkas);
  } catch {
    return NextResponse.json({ error: "Berkas tidak ditemukan" }, { status: 404 });
  }

  const mime = mimeDariEkstensi(nama);

  return new NextResponse(new Uint8Array(isi), {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Content-Length": String(isi.byteLength),
      "Content-Disposition": "inline",
      "Cache-Control": KONTROL_CACHE,
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  });
}
