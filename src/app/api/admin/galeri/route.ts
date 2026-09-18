import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth } from "@/lib/api-auth";
import { bacaTubuh, galatDatabase } from "@/lib/api-util";
import { galeriBuatSchema } from "@/lib/validasi";

export const dynamic = "force-dynamic";

async function getHandler() {
  const galeri = await prisma.galeri.findMany({
    orderBy: [{ urutan: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(galeri, { headers: { "Cache-Control": "no-store" } });
}

async function postHandler(req: NextRequest) {
  const dibaca = await bacaTubuh(req, galeriBuatSchema);
  if (!dibaca.ok) return dibaca.respons;

  const d = dibaca.data;

  try {
    const galeri = await prisma.galeri.create({
      data: {
        judul: d.judul,
        deskripsi: d.deskripsi ?? null,
        gambar: d.gambar,
        urutan: d.urutan ?? 0,
      },
    });
    return NextResponse.json(galeri, { status: 201 });
  } catch (error) {
    return galatDatabase(error, "Gagal menambah foto galeri");
  }
}

// Galeri termasuk konten masjid: admin dan pengurus sama-sama boleh mengelola.
export const GET = withAdminAuth(getHandler);
export const POST = withAdminAuth(postHandler);
