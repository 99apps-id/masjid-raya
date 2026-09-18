import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth, type KonteksRute } from "@/lib/api-auth";
import { bacaTubuh, galatDatabase, tidakDitemukan } from "@/lib/api-util";
import { pengurusSchema } from "@/lib/validasi";

export const dynamic = "force-dynamic";

async function getHandler(_req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  const pengurus = await prisma.pengurus.findUnique({ where: { id } });
  if (!pengurus) return tidakDitemukan();
  return NextResponse.json(pengurus, { headers: { "Cache-Control": "no-store" } });
}

async function putHandler(req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  const dibaca = await bacaTubuh(req, pengurusSchema);
  if (!dibaca.ok) return dibaca.respons;

  if (Object.keys(dibaca.data).length === 0) {
    return NextResponse.json(
      { error: "Tidak ada kolom yang dikirim untuk diperbarui" },
      { status: 400 }
    );
  }

  try {
    const pengurus = await prisma.pengurus.update({
      where: { id },
      data: dibaca.data,
    });
    return NextResponse.json(pengurus);
  } catch (error) {
    return galatDatabase(error, "Gagal memperbarui pengurus");
  }
}

async function deleteHandler(_req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  try {
    await prisma.pengurus.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return galatDatabase(error, "Gagal menghapus pengurus");
  }
}

export const GET = withAdminAuth(getHandler, ["admin"]);
export const PUT = withAdminAuth(putHandler, ["admin"]);
export const DELETE = withAdminAuth(deleteHandler, ["admin"]);
