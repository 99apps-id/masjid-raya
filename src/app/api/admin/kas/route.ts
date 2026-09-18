import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth } from "@/lib/api-auth";
import { bacaTubuh, galatDatabase, tanggalKeDate } from "@/lib/api-util";
import { kasBuatSchema } from "@/lib/validasi";

export const dynamic = "force-dynamic";

async function getHandler() {
  const transaksi = await prisma.kasTransaksi.findMany({
    orderBy: { tanggal: "desc" },
  });
  return NextResponse.json(transaksi, { headers: { "Cache-Control": "no-store" } });
}

async function postHandler(req: NextRequest) {
  const dibaca = await bacaTubuh(req, kasBuatSchema);
  if (!dibaca.ok) return dibaca.respons;

  const d = dibaca.data;

  try {
    const transaksi = await prisma.kasTransaksi.create({
      data: {
        tanggal: tanggalKeDate(d.tanggal),
        jenis: d.jenis,
        kategori: d.kategori ?? null,
        keterangan: d.keterangan,
        jumlah: d.jumlah,
      },
    });
    return NextResponse.json(transaksi, { status: 201 });
  } catch (error) {
    return galatDatabase(error, "Gagal menambah transaksi kas");
  }
}

// Buku kas termasuk konten masjid: admin dan pengurus (bendahara) sama-sama
// boleh mencatat.
export const GET = withAdminAuth(getHandler);
export const POST = withAdminAuth(postHandler);
