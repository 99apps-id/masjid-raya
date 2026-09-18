import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth, type KonteksRute } from "@/lib/api-auth";
import {
  bacaTubuh,
  galatDatabase,
  tidakDitemukan,
  tanggalKeDate,
} from "@/lib/api-util";
import { petugasSchema } from "@/lib/validasi";

export const dynamic = "force-dynamic";

async function getHandler(_req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  const petugas = await prisma.petugasJadwal.findUnique({ where: { id } });
  if (!petugas) return tidakDitemukan();
  return NextResponse.json(petugas, { headers: { "Cache-Control": "no-store" } });
}

async function putHandler(req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  const dibaca = await bacaTubuh(req, petugasSchema);
  if (!dibaca.ok) return dibaca.respons;

  const d = dibaca.data;

  if (Object.keys(d).length === 0) {
    return NextResponse.json(
      { error: "Tidak ada kolom yang dikirim untuk diperbarui" },
      { status: 400 }
    );
  }

  try {
    const petugas = await prisma.petugasJadwal.update({
      where: { id },
      data: {
        ...(d.tanggal !== undefined ? { tanggal: tanggalKeDate(d.tanggal) } : {}),
        ...(d.peran !== undefined ? { peran: d.peran } : {}),
        ...(d.nama !== undefined ? { nama: d.nama } : {}),
        ...(d.keterangan !== undefined ? { keterangan: d.keterangan } : {}),
      },
    });
    return NextResponse.json(petugas);
  } catch (error) {
    return galatDatabase(error, "Gagal memperbarui jadwal petugas");
  }
}

async function deleteHandler(_req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  try {
    await prisma.petugasJadwal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return galatDatabase(error, "Gagal menghapus jadwal petugas");
  }
}

export const GET = withAdminAuth(getHandler);
export const PUT = withAdminAuth(putHandler);
export const DELETE = withAdminAuth(deleteHandler);
