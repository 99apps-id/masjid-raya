import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth, type KonteksRute } from "@/lib/api-auth";
import { bacaTubuh, galatDatabase, tidakDitemukan, tanggalKeDate } from "@/lib/api-util";
import { khutbahSchema } from "@/lib/validasi";

export const dynamic = "force-dynamic";

async function getHandler(_req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  const khutbah = await prisma.khutbah.findUnique({ where: { id } });
  if (!khutbah) return tidakDitemukan();
  return NextResponse.json(khutbah, { headers: { "Cache-Control": "no-store" } });
}

async function putHandler(req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  const dibaca = await bacaTubuh(req, khutbahSchema);
  if (!dibaca.ok) return dibaca.respons;

  const d = dibaca.data;

  if (Object.keys(d).length === 0) {
    return NextResponse.json(
      { error: "Tidak ada kolom yang dikirim untuk diperbarui" },
      { status: 400 }
    );
  }

  try {
    const khutbah = await prisma.khutbah.update({
      where: { id },
      data: {
        ...(d.tanggal !== undefined ? { tanggal: tanggalKeDate(d.tanggal) } : {}),
        ...(d.tema !== undefined ? { tema: d.tema } : {}),
        ...(d.penceramah !== undefined ? { penceramah: d.penceramah } : {}),
        ...(d.lokasi !== undefined ? { lokasi: d.lokasi } : {}),
      },
    });
    return NextResponse.json(khutbah);
  } catch (error) {
    return galatDatabase(error, "Gagal memperbarui khutbah");
  }
}

async function deleteHandler(_req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  try {
    await prisma.khutbah.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return galatDatabase(error, "Gagal menghapus khutbah");
  }
}

export const GET = withAdminAuth(getHandler);
export const PUT = withAdminAuth(putHandler);
export const DELETE = withAdminAuth(deleteHandler);
