import { NextRequest, NextResponse } from "next/server";
import { getServerAuth } from "@/lib/get-server-auth";
import { batasiLaju } from "@/lib/rate-limit";
import {
  ATURAN_FOLDER,
  folderUnggahanValid,
  simpanUnggahan,
} from "@/lib/upload";

/**
 * Unggah berkas (foto ustadz, foto kegiatan, suara adzan).
 *
 * Hanya admin/pengurus yang boleh mengunggah. Berkas divalidasi dari isinya
 * (magic bytes) lalu disimpan di luar `public/` dengan nama acak.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Batas unggahan per pengguna, mencegah penyalahgunaan penyimpanan. */
const BATAS_UNGGAH = 30;
const JENDELA_UNGGAH_MS = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  const { user, role } = await getServerAuth();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (role !== "admin" && role !== "pengurus") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const batas = batasiLaju(
    `upload:${user.id ?? user.email ?? "tanpa-id"}`,
    BATAS_UNGGAH,
    JENDELA_UNGGAH_MS
  );
  if (!batas.boleh) {
    return NextResponse.json(
      { error: `Terlalu banyak unggahan. Coba lagi dalam ${batas.tungguDetik} detik.` },
      { status: 429, headers: { "Retry-After": String(batas.tungguDetik) } }
    );
  }

  let formulir: FormData;
  try {
    formulir = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Permintaan harus berupa multipart/form-data" },
      { status: 400 }
    );
  }

  const folder = String(formulir.get("folder") ?? "");
  if (!folderUnggahanValid(folder)) {
    return NextResponse.json(
      {
        error: "Folder unggahan tidak dikenal",
        detail: { folder: Object.keys(ATURAN_FOLDER) },
      },
      { status: 400 }
    );
  }

  const berkas = formulir.get("berkas");
  if (!(berkas instanceof File)) {
    return NextResponse.json(
      { error: "Berkas wajib disertakan pada field 'berkas'" },
      { status: 400 }
    );
  }

  const hasil = await simpanUnggahan(berkas, folder);
  if (!hasil.ok) {
    return NextResponse.json({ error: hasil.pesan }, { status: 400 });
  }

  return NextResponse.json(
    {
      url: hasil.berkas.url,
      namaBerkas: hasil.berkas.namaBerkas,
      ukuran: hasil.berkas.ukuran,
      mime: hasil.berkas.mime,
    },
    { status: 201 }
  );
}
