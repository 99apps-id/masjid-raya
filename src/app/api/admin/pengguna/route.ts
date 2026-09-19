import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { withAdminAuth } from "@/lib/api-auth";
import { bacaTubuh, galatDatabase } from "@/lib/api-util";
import { penggunaBuatSchema } from "@/lib/validasi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Kolom yang boleh keluar dari API. `password` sengaja TIDAK pernah disertakan
 * agar hash sandi tidak bocor lewat daftar pengguna.
 */
const PILIH_AMAN = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

async function getHandler() {
  const pengguna = await prisma.user.findMany({
    select: PILIH_AMAN,
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(pengguna, { headers: { "Cache-Control": "no-store" } });
}

async function postHandler(req: NextRequest) {
  const dibaca = await bacaTubuh(req, penggunaBuatSchema);
  if (!dibaca.ok) return dibaca.respons;

  const d = dibaca.data;

  try {
    const pengguna = await prisma.user.create({
      data: {
        name: d.nama,
        email: d.email,
        role: d.role,
        password: await bcrypt.hash(d.sandi, 12),
        emailVerified: new Date(),
      },
      select: PILIH_AMAN,
    });
    return NextResponse.json(pengguna, { status: 201 });
  } catch (error) {
    return galatDatabase(error, "Gagal menambah pengguna");
  }
}

// Manajemen akun sepenuhnya admin: pengurus tidak boleh membuat atau mengubah
// akun, agar peran tidak bisa dinaikkan sendiri.
export const GET = withAdminAuth(getHandler, ["admin"]);
export const POST = withAdminAuth(postHandler, ["admin"]);
