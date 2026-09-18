import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth, type KonteksRute } from "@/lib/api-auth";
import { bacaTubuh, galatDatabase, tidakDitemukan } from "@/lib/api-util";
import { galeriSchema } from "@/lib/validasi";

export const dynamic = "force-dynamic";

async function getHandler(_req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  const galeri = await prisma.galeri.findUnique({ where: { id } });
  if (!galeri) return tidakDitemukan();
  return NextResponse.json(galeri, { headers: { "Cache-Control": "no-store" } });
}

async function putHandler(req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  const dibaca = await bacaTubuh(req, galeriSchema);
  if (!dibaca.ok) return dibaca.respons;

  const d = dibaca.data;

  if (Object.keys(d).length === 0) {
    return NextResponse.json(
      { error: "Tidak ada kolom yang dikirim untuk diperbarui" },
      { status: 400 }
    );
  }

  try {
    const galeri = await prisma.galeri.update({
      where: { id },
      data: {
        ...(d.judul !== undefined ? { judul: d.judul } : {}),
        ...(d.deskripsi !== undefined ? { deskripsi: d.deskripsi } : {}),
        // Kolom `gambar` wajib di database, jadi nilai null tidak pernah dikirim.
        ...(d.gambar ? { gambar: d.gambar } : {}),
        ...(d.urutan !== undefined ? { urutan: d.urutan } : {}),
      },
    });
    return NextResponse.json(galeri);
  } catch (error) {
    return galatDatabase(error, "Gagal memperbarui foto galeri");
  }
}

async function deleteHandler(_req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  try {
    await prisma.galeri.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return galatDatabase(error, "Gagal menghapus foto galeri");
  }
}

export const GET = withAdminAuth(getHandler);
export const PUT = withAdminAuth(putHandler);
export const DELETE = withAdminAuth(deleteHandler);
