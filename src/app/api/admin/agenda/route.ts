import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth } from "@/lib/api-auth";
import { bacaTubuh, galatDatabase, tanggalKeDate } from "@/lib/api-util";
import { agendaBuatSchema } from "@/lib/validasi";

export const dynamic = "force-dynamic";

async function getHandler() {
  const agenda = await prisma.agenda.findMany({
    orderBy: { tanggal: "desc" },
  });
  return NextResponse.json(agenda, { headers: { "Cache-Control": "no-store" } });
}

async function postHandler(req: NextRequest) {
  const dibaca = await bacaTubuh(req, agendaBuatSchema);
  if (!dibaca.ok) return dibaca.respons;

  const d = dibaca.data;

  try {
    const agenda = await prisma.agenda.create({
      data: {
        nama: d.nama,
        tanggal: tanggalKeDate(d.tanggal),
        waktu: d.waktu ?? null,
        lokasi: d.lokasi ?? null,
        deskripsi: d.deskripsi ?? null,
      },
    });
    return NextResponse.json(agenda, { status: 201 });
  } catch (error) {
    return galatDatabase(error, "Gagal menambah agenda");
  }
}

// Agenda termasuk konten masjid: admin dan pengurus sama-sama boleh mengelola.
export const GET = withAdminAuth(getHandler);
export const POST = withAdminAuth(postHandler);
