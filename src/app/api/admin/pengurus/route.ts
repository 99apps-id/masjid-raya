import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth } from "@/lib/api-auth";
import { bacaTubuh, galatDatabase } from "@/lib/api-util";
import { pengurusBuatSchema } from "@/lib/validasi";

export const dynamic = "force-dynamic";

async function getHandler() {
  const pengurus = await prisma.pengurus.findMany({
    orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(pengurus, { headers: { "Cache-Control": "no-store" } });
}

async function postHandler(req: NextRequest) {
  const dibaca = await bacaTubuh(req, pengurusBuatSchema);
  if (!dibaca.ok) return dibaca.respons;

  try {
    const pengurus = await prisma.pengurus.create({ data: dibaca.data });
    return NextResponse.json(pengurus, { status: 201 });
  } catch (error) {
    return galatDatabase(error, "Gagal menambah pengurus");
  }
}

// Struktur kepengurusan hanya untuk peran admin, selaras dengan sidebar.
export const GET = withAdminAuth(getHandler, ["admin"]);
export const POST = withAdminAuth(postHandler, ["admin"]);
