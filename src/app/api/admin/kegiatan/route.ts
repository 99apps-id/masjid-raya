import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth } from "@/lib/api-auth";
import { bacaTubuh, galatDatabase, tanggalKeDate } from "@/lib/api-util";
import { kegiatanBuatSchema } from "@/lib/validasi";

export const dynamic = "force-dynamic";

async function getHandler() {
  const kegiatan = await prisma.kegiatan.findMany({
    orderBy: { tanggalMulai: "desc" },
  });
  return NextResponse.json(kegiatan, { headers: { "Cache-Control": "no-store" } });
}

async function postHandler(req: NextRequest) {
  const dibaca = await bacaTubuh(req, kegiatanBuatSchema);
  if (!dibaca.ok) return dibaca.respons;

  const d = dibaca.data;

  if (d.tanggalSelesai && d.tanggalSelesai < d.tanggalMulai) {
    return NextResponse.json(
      { error: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai" },
      { status: 400 }
    );
  }

  try {
    const kegiatan = await prisma.kegiatan.create({
      data: {
        nama: d.nama,
        deskripsi: d.deskripsi ?? null,
        tanggalMulai: tanggalKeDate(d.tanggalMulai),
        tanggalSelesai: d.tanggalSelesai ? tanggalKeDate(d.tanggalSelesai) : null,
        lokasi: d.lokasi ?? null,
        gambar: d.gambar ?? null,
      },
    });
    return NextResponse.json(kegiatan, { status: 201 });
  } catch (error) {
    return galatDatabase(error, "Gagal menambah kegiatan");
  }
}

export const GET = withAdminAuth(getHandler);
export const POST = withAdminAuth(postHandler);
