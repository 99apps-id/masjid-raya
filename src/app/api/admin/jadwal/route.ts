import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth } from "@/lib/api-auth";
import { bacaTubuh, galatDatabase, tanggalKeDate } from "@/lib/api-util";
import { jadwalSimpanSchema } from "@/lib/validasi";

export const dynamic = "force-dynamic";

async function getHandler(req: NextRequest) {
  const lokasi = req.nextUrl.searchParams.get("lokasi");
  const batas = Number(req.nextUrl.searchParams.get("batas") ?? 100);
  const take = Number.isFinite(batas) ? Math.min(Math.max(Math.round(batas), 1), 500) : 100;

  const jadwal = await prisma.jadwalShalat.findMany({
    where: lokasi ? { lokasi } : undefined,
    orderBy: [{ tanggal: "desc" }, { lokasi: "asc" }],
    take,
  });
  return NextResponse.json(jadwal, { headers: { "Cache-Control": "no-store" } });
}

async function postHandler(req: NextRequest) {
  const dibaca = await bacaTubuh(req, jadwalSimpanSchema);
  if (!dibaca.ok) return dibaca.respons;

  const d = dibaca.data;
  const tanggal = tanggalKeDate(d.tanggal);

  try {
    // Simpan ke baris (tanggal, lokasi) yang sama; jadwal hasil hisab untuk
    // hari itu digantikan oleh nilai yang diisi admin.
    const jadwal = await prisma.jadwalShalat.upsert({
      where: { tanggal_lokasi: { tanggal, lokasi: d.lokasi } },
      update: {
        provinsi: d.provinsi ?? null,
        imsak: d.imsak,
        subuh: d.subuh,
        terbit: d.terbit ?? null,
        dhuha: d.dhuha ?? null,
        zuhur: d.zuhur,
        ashar: d.ashar,
        maghrib: d.maghrib,
        isya: d.isya,
        // Ditandai manual agar tidak pernah ditimpa perhitungan otomatis.
        sumber: "manual",
      },
      create: {
        tanggal,
        lokasi: d.lokasi,
        provinsi: d.provinsi ?? null,
        imsak: d.imsak,
        subuh: d.subuh,
        terbit: d.terbit ?? null,
        dhuha: d.dhuha ?? null,
        zuhur: d.zuhur,
        ashar: d.ashar,
        maghrib: d.maghrib,
        isya: d.isya,
        sumber: "manual",
      },
    });
    return NextResponse.json(jadwal, { status: 201 });
  } catch (error) {
    return galatDatabase(error, "Gagal menyimpan jadwal");
  }
}

export const GET = withAdminAuth(getHandler);
export const POST = withAdminAuth(postHandler);
