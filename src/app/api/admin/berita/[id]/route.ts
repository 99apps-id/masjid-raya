import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth, type KonteksRute } from "@/lib/api-auth";
import { bacaTubuh, galatDatabase, tidakDitemukan } from "@/lib/api-util";
import { beritaSchema } from "@/lib/validasi";

export const dynamic = "force-dynamic";

async function getHandler(_req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  const berita = await prisma.berita.findUnique({ where: { id } });
  if (!berita) return tidakDitemukan();
  return NextResponse.json(berita, { headers: { "Cache-Control": "no-store" } });
}

async function putHandler(req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  const dibaca = await bacaTubuh(req, beritaSchema);
  if (!dibaca.ok) return dibaca.respons;

  const d = dibaca.data;

  if (Object.keys(d).length === 0) {
    return NextResponse.json(
      { error: "Tidak ada kolom yang dikirim untuk diperbarui" },
      { status: 400 }
    );
  }

  try {
    // Waktu terbit hanya diisi saat berita pertama kali diterbitkan, dan
    // dikosongkan bila ditarik kembali menjadi draf.
    let publishedAt: Date | null | undefined;
    if (d.published !== undefined) {
      const sekarang = await prisma.berita.findUnique({
        where: { id },
        select: { publishedAt: true },
      });
      if (!sekarang) return tidakDitemukan();
      publishedAt = d.published ? (sekarang.publishedAt ?? new Date()) : null;
    }

    const berita = await prisma.berita.update({
      where: { id },
      data: {
        ...(d.judul !== undefined ? { judul: d.judul } : {}),
        ...(d.isi !== undefined ? { isi: d.isi } : {}),
        ...(d.gambar !== undefined ? { gambar: d.gambar } : {}),
        ...(d.kategori !== undefined ? { kategori: d.kategori } : {}),
        ...(d.published !== undefined ? { published: d.published } : {}),
        ...(publishedAt !== undefined ? { publishedAt } : {}),
      },
    });
    return NextResponse.json(berita);
  } catch (error) {
    return galatDatabase(error, "Gagal memperbarui berita");
  }
}

async function deleteHandler(_req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  try {
    await prisma.berita.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return galatDatabase(error, "Gagal menghapus berita");
  }
}

export const GET = withAdminAuth(getHandler);
export const PUT = withAdminAuth(putHandler);
export const DELETE = withAdminAuth(deleteHandler);
