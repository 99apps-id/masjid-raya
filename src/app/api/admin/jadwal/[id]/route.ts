import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth, type KonteksRute } from "@/lib/api-auth";
import { bacaTubuh, galatDatabase, tidakDitemukan, tanggalKeDate } from "@/lib/api-util";
import { jadwalSchema } from "@/lib/validasi";

export const dynamic = "force-dynamic";

async function getHandler(_req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  const jadwal = await prisma.jadwalShalat.findUnique({ where: { id } });
  if (!jadwal) return tidakDitemukan();
  return NextResponse.json(jadwal, { headers: { "Cache-Control": "no-store" } });
}

async function putHandler(req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  const dibaca = await bacaTubuh(req, jadwalSchema);
  if (!dibaca.ok) return dibaca.respons;

  const d = dibaca.data;

  if (Object.keys(d).length === 0) {
    return NextResponse.json(
      { error: "Tidak ada kolom yang dikirim untuk diperbarui" },
      { status: 400 }
    );
  }

  try {
    const jadwal = await prisma.jadwalShalat.update({
      where: { id },
      data: {
        ...(d.tanggal !== undefined ? { tanggal: tanggalKeDate(d.tanggal) } : {}),
        ...(d.lokasi !== undefined ? { lokasi: d.lokasi } : {}),
        ...(d.provinsi !== undefined ? { provinsi: d.provinsi } : {}),
        ...(d.imsak !== undefined ? { imsak: d.imsak } : {}),
        ...(d.subuh !== undefined ? { subuh: d.subuh } : {}),
        ...(d.terbit !== undefined ? { terbit: d.terbit } : {}),
        ...(d.dhuha !== undefined ? { dhuha: d.dhuha } : {}),
        ...(d.zuhur !== undefined ? { zuhur: d.zuhur } : {}),
        ...(d.ashar !== undefined ? { ashar: d.ashar } : {}),
        ...(d.maghrib !== undefined ? { maghrib: d.maghrib } : {}),
        ...(d.isya !== undefined ? { isya: d.isya } : {}),
        // Suntingan lewat panel adalah keputusan admin: tandai manual.
        sumber: "manual",
      },
    });
    return NextResponse.json(jadwal);
  } catch (error) {
    return galatDatabase(error, "Gagal memperbarui jadwal");
  }
}

async function deleteHandler(_req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  try {
    await prisma.jadwalShalat.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return galatDatabase(error, "Gagal menghapus jadwal");
  }
}

export const GET = withAdminAuth(getHandler);
export const PUT = withAdminAuth(putHandler);
export const DELETE = withAdminAuth(deleteHandler);
