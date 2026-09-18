import { NextRequest, NextResponse } from "next/server";
import { getServerAuth } from "./get-server-auth";

export type Role = "admin" | "pengurus" | "jamaah";

/** Konteks yang diteruskan Next.js ke route handler dinamis. */
export interface KonteksRute<Params extends Record<string, string>> {
  // Next.js 15 menyerahkan `params` sebagai Promise, jadi handler wajib
  // `await params` sebelum memakai nilainya.
  params: Promise<Params>;
}

const PERAN_BAWAAN: Role[] = ["admin", "pengurus"];

/**
 * Bungkus satu route handler sehingga hanya peran yang diizinkan dapat
 * memanggilnya.
 *
 * Nilai kembaliannya adalah fungsi dengan tanda tangan yang identik dengan
 * handler aslinya. Ini penting karena Next.js memvalidasi bahwa setiap ekspor
 * method pada route (GET, POST, PUT, DELETE) benar-benar bertipe Function —
 * mengembalikan objek seperti `{ GET, POST }` akan lolos dari pemeriksaan
 * runtime namun gagal saat build sekaligus membuat rute tidak dapat dipanggil.
 */
export function withAdminAuth<Args extends unknown[]>(
  handler: (req: NextRequest, ...args: Args) => Promise<Response>,
  allowedRoles: Role[] = PERAN_BAWAAN
): (req: NextRequest, ...args: Args) => Promise<Response> {
  return async function terautentikasi(req: NextRequest, ...args: Args) {
    const { user, role } = await getServerAuth();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!role || !allowedRoles.includes(role as Role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return handler(req, ...args);
  };
}
