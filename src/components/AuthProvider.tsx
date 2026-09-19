"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Penjagaan global terhadap rejection non-Error yang dikenal muncul pada
 * kombinasi Next.js 15 + React 18 + next-auth v4.
 *
 * Beberapa pustaka/internal Next.js dapat menghasilkan alasan rejection berupa
 * `Event` (mis. saat logout atau refresh sesi). Alasan itu tidak disengaja
 * untuk diolah aplikasi, jadi kita catat dan tekan di sini agar overlay
 * pengembangan tidak menutupi seluruh antarmuka.
 */
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const alasan = event.reason;
    if (
      alasan &&
      (alasan instanceof Event ||
        (typeof alasan === "object" && alasan && "type" in alasan) ||
        String(alasan) === "[object Event]")
    ) {
      event.preventDefault();
    }
  });
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
