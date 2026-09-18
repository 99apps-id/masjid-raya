import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth } from "@/lib/api-auth";
import { bacaTubuh, galatDatabase, tanggalKeDate } from "@/lib/api-util";
import { khutbahBuatSchema } from "@/lib/validasi";

export const dynamic = "force-dynamic";

async function getHandler() {
  const khutbah = await prisma.khutbah.findMany({ orderBy: { tanggal: "desc" } });
  return NextResponse.json(khutbah, { headers: { "Cache-Control": "no-store" } });
}

async function postHandler(req: NextRequest) {
  const dibaca = await bacaTubuh(req, khutbahBuatSchema);
  if (!dibaca.ok) return dibaca.respons;

  const d = dibaca.data;

  try {
    const khutbah = await prisma.khutbah.create({
      data: {
        tanggal: tanggalKeDate(d.tanggal),
        tema: d.tema,
        penceramah: d.penceramah,
        lokasi: d.lokasi ?? null,
      },
    });
    return NextResponse.json(khutbah, { status: 201 });
  } catch (error) {
    return galatDatabase(error, "Gagal menambah khutbah");
  }
}

export const GET = withAdminAuth(getHandler);
export const POST = withAdminAuth(postHandler);
