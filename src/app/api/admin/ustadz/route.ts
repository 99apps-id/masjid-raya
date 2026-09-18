import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth } from "@/lib/api-auth";
import { bacaTubuh, galatDatabase } from "@/lib/api-util";
import { ustadzBuatSchema } from "@/lib/validasi";

export const dynamic = "force-dynamic";

async function getHandler() {
  const ustadz = await prisma.ustadz.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(ustadz, {
    headers: { "Cache-Control": "no-store" },
  });
}

async function postHandler(req: NextRequest) {
  const dibaca = await bacaTubuh(req, ustadzBuatSchema);
  if (!dibaca.ok) return dibaca.respons;

  try {
    const ustadz = await prisma.ustadz.create({ data: dibaca.data });
    return NextResponse.json(ustadz, { status: 201 });
  } catch (error) {
    return galatDatabase(error, "Gagal menambah ustadz");
  }
}

// Data penceramah hanya untuk peran admin, selaras dengan sidebar yang
// menyembunyikan menu Ustadz dari pengurus. Tanpa ini, pengurus bisa memanggil
// API langsung walau menunya tidak tampak (broken access control).
export const GET = withAdminAuth(getHandler, ["admin"]);
export const POST = withAdminAuth(postHandler, ["admin"]);
