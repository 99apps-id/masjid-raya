import { APLIKASI } from "@/lib/aplikasi";

/**
 * Kredit aplikasi.
 *
 * Selalu menampilkan nama produk beserta pengembangnya, terlepas dari nama
 * masjid yang dipilih pengelola. Dipakai di footer halaman publik dan panel
 * admin supaya atribusi produk tidak pernah hilang saat branding diganti.
 */
export default function KreditAplikasi({
  className,
  tema = "terang",
}: {
  className?: string;
  /** "gelap" untuk latar gelap (mis. sidebar), "terang" untuk latar terang. */
  tema?: "terang" | "gelap";
}) {
  const warnaUtama = tema === "gelap" ? "text-forest-100/80" : "text-forest-800";
  const warnaKedua = tema === "gelap" ? "text-forest-100/60" : "text-ink-400";

  return (
    <div className={className}>
      <p className={`text-sm font-semibold tracking-tight ${warnaUtama}`}>
        {APLIKASI.nama}
      </p>
      <p className={`mt-0.5 text-xs ${warnaKedua}`}>
        dikembangkan oleh{" "}
        <span className={tema === "gelap" ? "text-brass-400" : "text-brass-600"}>
          {APLIKASI.pengembang}
        </span>
      </p>
      <p className={`mt-0.5 text-xs ${warnaKedua}`}>
        Surel:{" "}
        <a
          href={`mailto:${APLIKASI.surel}`}
          className="underline decoration-dotted underline-offset-2 transition hover:text-brass-600"
        >
          {APLIKASI.surel}
        </a>
      </p>
    </div>
  );
}
