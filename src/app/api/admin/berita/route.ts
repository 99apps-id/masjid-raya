import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth } from "@/lib/api-auth";
import { bacaTubuh, galatDatabase } from "@/lib/api-util";
import { beritaBuatSchema } from "@/lib/validasi";

export const dynamic = "force-dynamic";

async function getHandler() {
  const berita = await prisma.berita.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(berita, { headers: { "Cache-Control": "no-store" } });
}

async function postHandler(req: NextRequest) {
  const dibaca = await bacaTubuh(req, beritaBuatSchema);
  if (!dibaca.ok) return dibaca.respons;

  const d = dibaca.data;
  // `published` sudah berupa boolean sungguhan setelah validasi; sebelumnya
  // nilai string "false" dari form dianggap benar (truthy) sehingga berita
  // draf ikut tayang.
  const published = d.published ?? false;

  try {
    const berita = await prisma.berita.create({
      data: {
        judul: d.judul,
        isi: d.isi,
        gambar: d.gambar ?? null,
        kategori: d.kategori ?? "berita",
        published,
        publishedAt: published ? new Date() : null,
      },
    });
    return NextResponse.json(berita, { status: 201 });
  } catch (error) {
    return galatDatabase(error, "Gagal menambah berita");
  }
}

export const GET = withAdminAuth(getHandler);
export const POST = withAdminAuth(postHandler);
