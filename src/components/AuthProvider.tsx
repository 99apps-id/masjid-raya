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
  const tanganiRejection = (event: PromiseRejectionEvent) => {
    const alasan = event.reason;
    const adalahEvent =
      !alasan ||
      alasan instanceof Event ||
      (typeof alasan === "object" && alasan !== null && "type" in alasan && !("message" in (alasan as object))) ||
      String(alasan) === "[object Event]" ||
      (typeof alasan === "string" && alasan.includes("[object Event]"));

    if (adalahEvent) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  // Tangkap di fase capture agar berjalan sebelum listener devtools Next.js
  window.addEventListener("unhandledrejection", tanganiRejection, true);
  window.addEventListener("unhandledrejection", tanganiRejection, false);

  const tanganiError = (event: ErrorEvent) => {
    const err = event.error;
    if (
      err instanceof Event ||
      String(err) === "[object Event]" ||
      (typeof event.message === "string" && event.message.includes("[object Event]"))
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  window.addEventListener("error", tanganiError, true);
  window.addEventListener("error", tanganiError, false);
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
