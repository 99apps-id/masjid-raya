import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth } from "@/lib/api-auth";
import { bacaTubuh, galatDatabase, tanggalKeDate } from "@/lib/api-util";
import { petugasBuatSchema } from "@/lib/validasi";

export const dynamic = "force-dynamic";

async function getHandler() {
  const petugas = await prisma.petugasJadwal.findMany({
    orderBy: { tanggal: "desc" },
  });
  return NextResponse.json(petugas, { headers: { "Cache-Control": "no-store" } });
}

async function postHandler(req: NextRequest) {
  const dibaca = await bacaTubuh(req, petugasBuatSchema);
  if (!dibaca.ok) return dibaca.respons;

  const d = dibaca.data;

  try {
    const petugas = await prisma.petugasJadwal.create({
      data: {
        tanggal: tanggalKeDate(d.tanggal),
        peran: d.peran,
        nama: d.nama,
        keterangan: d.keterangan ?? null,
      },
    });
    return NextResponse.json(petugas, { status: 201 });
  } catch (error) {
    return galatDatabase(error, "Gagal menambah jadwal petugas");
  }
}

// Jadwal petugas termasuk konten masjid: admin dan pengurus sama-sama boleh
// mengelola.
export const GET = withAdminAuth(getHandler);
export const POST = withAdminAuth(postHandler);
