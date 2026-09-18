import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth, type KonteksRute } from "@/lib/api-auth";
import {
  bacaTubuh,
  galatDatabase,
  tidakDitemukan,
  tanggalKeDate,
} from "@/lib/api-util";
import { kegiatanSchema } from "@/lib/validasi";

export const dynamic = "force-dynamic";

async function getHandler(_req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  const kegiatan = await prisma.kegiatan.findUnique({ where: { id } });
  if (!kegiatan) return tidakDitemukan();
  return NextResponse.json(kegiatan, { headers: { "Cache-Control": "no-store" } });
}

async function putHandler(req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  const dibaca = await bacaTubuh(req, kegiatanSchema);
  if (!dibaca.ok) return dibaca.respons;

  const d = dibaca.data;

  if (Object.keys(d).length === 0) {
    return NextResponse.json(
      { error: "Tidak ada kolom yang dikirim untuk diperbarui" },
      { status: 400 }
    );
  }

  try {
    // Rentang tanggal diperiksa terhadap nilai yang tersimpan, bukan hanya
    // terhadap isi permintaan: permintaan bisa saja hanya mengubah satu sisi.
    if (d.tanggalMulai !== undefined || d.tanggalSelesai !== undefined) {
      const sekarang = await prisma.kegiatan.findUnique({
        where: { id },
        select: { tanggalMulai: true, tanggalSelesai: true },
      });
      if (!sekarang) return tidakDitemukan();

      const mulai = d.tanggalMulai
        ? tanggalKeDate(d.tanggalMulai)
        : sekarang.tanggalMulai;
      const selesai =
        d.tanggalSelesai === undefined
          ? sekarang.tanggalSelesai
          : d.tanggalSelesai
            ? tanggalKeDate(d.tanggalSelesai)
            : null;

      if (selesai && selesai < mulai) {
        return NextResponse.json(
          { error: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai" },
          { status: 400 }
        );
      }
    }

    const kegiatan = await prisma.kegiatan.update({
      where: { id },
      data: {
        ...(d.nama !== undefined ? { nama: d.nama } : {}),
        ...(d.deskripsi !== undefined ? { deskripsi: d.deskripsi } : {}),
        ...(d.tanggalMulai !== undefined
          ? { tanggalMulai: tanggalKeDate(d.tanggalMulai) }
          : {}),
        ...(d.tanggalSelesai !== undefined
          ? { tanggalSelesai: d.tanggalSelesai ? tanggalKeDate(d.tanggalSelesai) : null }
          : {}),
        ...(d.lokasi !== undefined ? { lokasi: d.lokasi } : {}),
        ...(d.gambar !== undefined ? { gambar: d.gambar } : {}),
      },
    });
    return NextResponse.json(kegiatan);
  } catch (error) {
    return galatDatabase(error, "Gagal memperbarui kegiatan");
  }
}

async function deleteHandler(_req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  try {
    await prisma.kegiatan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return galatDatabase(error, "Gagal menghapus kegiatan");
  }
}

export const GET = withAdminAuth(getHandler);
export const PUT = withAdminAuth(putHandler);
export const DELETE = withAdminAuth(deleteHandler);
