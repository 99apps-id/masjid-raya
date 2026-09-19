interface BrandMarkProps {
  className?: string;
  /** Sembunyikan dari pembaca layar bila sudah ada teks nama di sebelahnya. */
  dekoratif?: boolean;
}

/**
 * Lambang resmi Masjid Raya Pro: siluet arsitektur masjid megah dengan kubah
 * ogee berfinial hilal, menara kembar proporsional, ornamen bintang delapan
 * (Khatam), serta gerbang lengkung mihrab.
 *
 * Digambar sebagai geometri SVG presisi berbasis currentColor sehingga tajam
 * di semua resolusi dan beradaptasi alami dengan tema terang maupun gelap.
 */
export default function BrandMark({
  className,
  dekoratif = false,
}: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role={dekoratif ? "presentation" : "img"}
      aria-hidden={dekoratif ? true : undefined}
      aria-label={dekoratif ? undefined : "Lambang Masjid Raya Pro"}
      fill="none"
    >
      {/* Garis pondasi / dasar bangunan */}
      <line
        x1="6"
        y1="40"
        x2="42"
        y2="40"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Menara kiri */}
      <path
        d="M 8.5 40 L 8.5 19 L 10.5 19 L 10.5 40 Z"
        fill="currentColor"
        opacity="0.35"
      />
      <path d="M 7.5 19 L 11.5 19 L 9.5 14 Z" fill="currentColor" />
      <line
        x1="9.5"
        y1="14"
        x2="9.5"
        y2="11.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="9.5" cy="11" r="0.8" fill="currentColor" />

      {/* Menara kanan */}
      <path
        d="M 37.5 40 L 37.5 19 L 39.5 19 L 39.5 40 Z"
        fill="currentColor"
        opacity="0.35"
      />
      <path d="M 36.5 19 L 40.5 19 L 38.5 14 Z" fill="currentColor" />
      <line
        x1="38.5"
        y1="14"
        x2="38.5"
        y2="11.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="38.5" cy="11" r="0.8" fill="currentColor" />

      {/* Dinding fasad utama */}
      <path
        d="M 10.5 40 L 10.5 28 L 37.5 28 L 37.5 40 Z"
        fill="currentColor"
        opacity="0.15"
      />

      {/* Kubah utama (siluet ogee) */}
      <path
        d="M 14 28 C 14 19.5 18.5 13.5 24 9 C 29.5 13.5 34 19.5 34 28 Z"
        fill="currentColor"
        opacity="0.85"
      />

      {/* Finial puncak & bulan sabit (hilal) */}
      <line
        x1="24"
        y1="9"
        x2="24"
        y2="5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M 23.2 4.2 A 2.2 2.2 0 1 1 25.4 6.4 A 1.8 1.8 0 1 0 23.2 4.2 Z"
        fill="currentColor"
      />

      {/* Gerbang lengkung mihrab */}
      <path
        d="M 19.5 40 L 19.5 31 C 19.5 28 21.5 26.5 24 25 C 26.5 26.5 28.5 28 28.5 31 L 28.5 40 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Bintang delapan (Khatam) di tengah kubah */}
      <g transform="translate(24, 18.5) scale(0.65)" fill="currentColor">
        <rect x="-3" y="-3" width="6" height="6" rx="0.5" />
        <rect
          x="-3"
          y="-3"
          width="6"
          height="6"
          rx="0.5"
          transform="rotate(45)"
        />
      </g>
    </svg>
  );
}
