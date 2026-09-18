import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth, type KonteksRute } from "@/lib/api-auth";
import { bacaTubuh, galatDatabase, tidakDitemukan } from "@/lib/api-util";
import { ustadzSchema } from "@/lib/validasi";

export const dynamic = "force-dynamic";

async function getHandler(_req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  const ustadz = await prisma.ustadz.findUnique({ where: { id } });
  if (!ustadz) return tidakDitemukan();
  return NextResponse.json(ustadz, { headers: { "Cache-Control": "no-store" } });
}

async function putHandler(req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  const dibaca = await bacaTubuh(req, ustadzSchema);
  if (!dibaca.ok) return dibaca.respons;

  if (Object.keys(dibaca.data).length === 0) {
    return NextResponse.json(
      { error: "Tidak ada kolom yang dikirim untuk diperbarui" },
      { status: 400 }
    );
  }

  try {
    const ustadz = await prisma.ustadz.update({
      where: { id },
      data: dibaca.data,
    });
    return NextResponse.json(ustadz);
  } catch (error) {
    return galatDatabase(error, "Gagal memperbarui ustadz");
  }
}

async function deleteHandler(_req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  try {
    await prisma.ustadz.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return galatDatabase(error, "Gagal menghapus ustadz");
  }
}

export const GET = withAdminAuth(getHandler, ["admin"]);
export const PUT = withAdminAuth(putHandler, ["admin"]);
export const DELETE = withAdminAuth(deleteHandler, ["admin"]);
