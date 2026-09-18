/** @type {import('next').NextConfig} */
const nextConfig = {
  // Jangan bocorkan teknologi stack lewat header respons.
  poweredByHeader: false,
  reactStrictMode: true,

  async headers() {
    const pengembangan = process.env.NODE_ENV !== "production";

    // `unsafe-eval` hanya diperlukan perkakas pengembangan (refresh/HMR).
    // Di produksi tidak dipakai supaya permukaan eksekusi skrip lebih sempit.
    const scriptSrc = pengembangan
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'";

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              scriptSrc,
              // Gaya Tailwind dan atribut style inline dipakai komponen.
              "style-src 'self' 'unsafe-inline'",
              // Gambar dari aplikasi sendiri, data URI, blob lokal, serta tautan
              // https. Validasi tautanBerkas (lib/validasi.ts) mengizinkan logo/
              // gambar dari URL https, jadi img-src WAJIB mengizinkan https pula
              // agar gambar tersebut tidak diblokir diam-diam oleh CSP.
              // Berkas unggahan tetap dilayani lewat /api/media sehingga 'self'.
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self'",
              // Rekaman adzan dan murattal boleh berasal dari https (arsip
              // publik) maupun berkas unggahan sendiri.
              "media-src 'self' https:",
              "worker-src 'self' blob:",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
