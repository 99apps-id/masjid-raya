import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth, type KonteksRute } from "@/lib/api-auth";
import {
  bacaTubuh,
  galatDatabase,
  tidakDitemukan,
  tanggalKeDate,
} from "@/lib/api-util";
import { agendaSchema } from "@/lib/validasi";

export const dynamic = "force-dynamic";

async function getHandler(_req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  const agenda = await prisma.agenda.findUnique({ where: { id } });
  if (!agenda) return tidakDitemukan();
  return NextResponse.json(agenda, { headers: { "Cache-Control": "no-store" } });
}

async function putHandler(req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  const dibaca = await bacaTubuh(req, agendaSchema);
  if (!dibaca.ok) return dibaca.respons;

  const d = dibaca.data;

  if (Object.keys(d).length === 0) {
    return NextResponse.json(
      { error: "Tidak ada kolom yang dikirim untuk diperbarui" },
      { status: 400 }
    );
  }

  try {
    const agenda = await prisma.agenda.update({
      where: { id },
      data: {
        ...(d.nama !== undefined ? { nama: d.nama } : {}),
        ...(d.tanggal !== undefined ? { tanggal: tanggalKeDate(d.tanggal) } : {}),
        ...(d.waktu !== undefined ? { waktu: d.waktu } : {}),
        ...(d.lokasi !== undefined ? { lokasi: d.lokasi } : {}),
        ...(d.deskripsi !== undefined ? { deskripsi: d.deskripsi } : {}),
      },
    });
    return NextResponse.json(agenda);
  } catch (error) {
    return galatDatabase(error, "Gagal memperbarui agenda");
  }
}

async function deleteHandler(_req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  try {
    await prisma.agenda.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return galatDatabase(error, "Gagal menghapus agenda");
  }
}

export const GET = withAdminAuth(getHandler);
export const PUT = withAdminAuth(putHandler);
export const DELETE = withAdminAuth(deleteHandler);
