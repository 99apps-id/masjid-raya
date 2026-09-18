import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export interface SesiServer {
  user: { id?: string; name?: string | null; email?: string | null } | null;
  role: string | null;
}

/**
 * Ambil sesi di sisi server beserta perannya. Mengembalikan `user: null` bila
 * belum masuk, sehingga pemanggil cukup memeriksa satu nilai.
 */
export async function getServerAuth(): Promise<SesiServer> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { user: null, role: null };
  }

  return {
    user: {
      id: (session.user as { id?: string }).id,
      name: session.user.name,
      email: session.user.email,
    },
    role: (session.user as { role?: string }).role ?? null,
  };
}
