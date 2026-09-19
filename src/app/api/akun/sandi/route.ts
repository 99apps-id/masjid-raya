import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getServerAuth } from "@/lib/get-server-auth";
import { batasiLaju, hapusBatasLaju } from "@/lib/rate-limit";
import { bacaTubuh, galatDatabase } from "@/lib/api-util";
import { gantiSandiSchema } from "@/lib/validasi";

/**
 * Ganti sandi mandiri untuk pengguna yang sudah masuk (semua peran).
 *
 * Prinsip keamanannya:
 *  - Sandi lama WAJIB disertakan dan diverifikasi, sehingga sesi yang terbajak
 *    tidak bisa langsung mengunci pemilik akun dengan sandi baru.
 *  - Percobaan dibatasi per pengguna; tanpa itu endpoint ini menjadi alat untuk
 *    menebak sandi lama seseorang tanpa batas.
 *  - Pengguna diambil dari sesi (`user.id`), bukan dari badan permintaan,
 *    sehingga tidak mungkin mengganti sandi milik akun lain (IDOR).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BATAS_GANTI = 5;
const JENDELA_GANTI_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  const { user } = await getServerAuth();

  if (!user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const kunci = `ganti-sandi:${user.id}`;
  const batas = batasiLaju(kunci, BATAS_GANTI, JENDELA_GANTI_MS);
  if (!batas.boleh) {
    return NextResponse.json(
      {
        error: `Terlalu banyak percobaan. Coba lagi dalam ${batas.tungguDetik} detik.`,
      },
      { status: 429, headers: { "Retry-After": String(batas.tungguDetik) } }
    );
  }

  const dibaca = await bacaTubuh(req, gantiSandiSchema);
  if (!dibaca.ok) return dibaca.respons;

  const { sandiLama, sandiBaru } = dibaca.data;

  try {
    const pengguna = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, password: true },
    });

    // Akun tanpa sandi tersimpan (mis. hanya dibuat lewat penyedia OAuth) tidak
    // punya sandi lama untuk diverifikasi.
    if (!pengguna?.password) {
      return NextResponse.json(
        { error: "Akun ini tidak memakai sandi, jadi tidak ada yang bisa diganti" },
        { status: 400 }
      );
    }

    if (!(await bcrypt.compare(sandiLama, pengguna.password))) {
      return NextResponse.json({ error: "Sandi lama salah" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: pengguna.id },
      data: { password: await bcrypt.hash(sandiBaru, 12) },
    });

    // Berhasil: buang kuota kesalahan supaya tidak menghukum pemiliknya.
    hapusBatasLaju(kunci);

    return NextResponse.json({ success: true });
  } catch (error) {
    return galatDatabase(error, "Gagal mengganti sandi");
  }
}

export const GET = () =>
  NextResponse.json({ error: "Method not allowed" }, { status: 405 });
