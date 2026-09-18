import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth, type KonteksRute } from "@/lib/api-auth";
import {
  bacaTubuh,
  galatDatabase,
  tidakDitemukan,
  tanggalKeDate,
} from "@/lib/api-util";
import { kasSchema } from "@/lib/validasi";

export const dynamic = "force-dynamic";

async function getHandler(_req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  const transaksi = await prisma.kasTransaksi.findUnique({ where: { id } });
  if (!transaksi) return tidakDitemukan();
  return NextResponse.json(transaksi, { headers: { "Cache-Control": "no-store" } });
}

async function putHandler(req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  const dibaca = await bacaTubuh(req, kasSchema);
  if (!dibaca.ok) return dibaca.respons;

  const d = dibaca.data;

  if (Object.keys(d).length === 0) {
    return NextResponse.json(
      { error: "Tidak ada kolom yang dikirim untuk diperbarui" },
      { status: 400 }
    );
  }

  try {
    const transaksi = await prisma.kasTransaksi.update({
      where: { id },
      data: {
        ...(d.tanggal !== undefined ? { tanggal: tanggalKeDate(d.tanggal) } : {}),
        ...(d.jenis !== undefined ? { jenis: d.jenis } : {}),
        ...(d.kategori !== undefined ? { kategori: d.kategori } : {}),
        ...(d.keterangan !== undefined ? { keterangan: d.keterangan } : {}),
        ...(d.jumlah !== undefined ? { jumlah: d.jumlah } : {}),
      },
    });
    return NextResponse.json(transaksi);
  } catch (error) {
    return galatDatabase(error, "Gagal memperbarui transaksi kas");
  }
}

async function deleteHandler(_req: NextRequest, { params }: KonteksRute<{ id: string }>) {
  const { id } = await params;
  try {
    await prisma.kasTransaksi.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return galatDatabase(error, "Gagal menghapus transaksi kas");
  }
}

export const GET = withAdminAuth(getHandler);
export const PUT = withAdminAuth(putHandler);
export const DELETE = withAdminAuth(deleteHandler);
