import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth } from "@/lib/api-auth";
import { bacaTubuh, galatDatabase } from "@/lib/api-util";
import { profilSchema } from "@/lib/validasi";

export const dynamic = "force-dynamic";

/** Profil masjid selalu berupa satu baris; dibuat otomatis bila belum ada. */
async function ambilAtauBuat() {
  const ada = await prisma.profilMasjid.findFirst({ orderBy: { createdAt: "asc" } });
  if (ada) return ada;
  
  try {
    return await prisma.profilMasjid.create({ data: {} });
  } catch (error) {
    // Jika permintaan lain sudah membuat profil saat bersamaan, ambil yang
    // sudah ada. Tanpa unique constraint pada level database, baris duplikat
    // masih mungkin terjadi; `findFirst` mengembalikan yang tertua.
    const kembali = await prisma.profilMasjid.findFirst({ orderBy: { createdAt: "asc" } });
    if (!kembali) throw error;
    return kembali;
  }
}

async function getHandler() {
  try {
    const profil = await ambilAtauBuat();
    return NextResponse.json(profil, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return galatDatabase(error, "Gagal memuat profil masjid");
  }
}

async function putHandler(req: NextRequest) {
  const dibaca = await bacaTubuh(req, profilSchema);
  if (!dibaca.ok) return dibaca.respons;

  if (Object.keys(dibaca.data).length === 0) {
    return NextResponse.json(
      { error: "Tidak ada kolom yang dikirim untuk diperbarui" },
      { status: 400 }
    );
  }

  try {
    const profil = await ambilAtauBuat();
    const diperbarui = await prisma.profilMasjid.update({
      where: { id: profil.id },
      data: dibaca.data,
    });
    return NextResponse.json(diperbarui);
  } catch (error) {
    return galatDatabase(error, "Gagal menyimpan profil masjid");
  }
}

export const GET = withAdminAuth(getHandler, ["admin"]);
export const PUT = withAdminAuth(putHandler, ["admin"]);
