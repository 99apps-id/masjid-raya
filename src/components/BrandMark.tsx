interface BrandMarkProps {
  className?: string;
  /** Sembunyikan dari pembaca layar bila sudah ada teks nama di sebelahnya. */
  dekoratif?: boolean;
}

/**
 * Lambang masjid: lengkung mihrab, bulan sabit, dan finial. Digambar sebagai
 * geometri SVG tunggal (tanpa file gambar) supaya tajam di layar apa pun dan
 * tidak bergantung pada emoji atau ikon template.
 */
export default function BrandMark({ className, dekoratif = false }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role={dekoratif ? "presentation" : "img"}
      aria-hidden={dekoratif ? true : undefined}
      aria-label={dekoratif ? undefined : "Lambang Masjid Raya Pro"}
      fill="none"
    >
      {/* Lengkung mihrab runcing */}
      <path
        d="M24 5.5c-7.9 6.9-12.6 11.9-12.6 19.3V42h25.2V24.8c0-7.4-4.7-12.4-12.6-19.3Z"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Finial di puncak lengkung */}
      <circle cx="24" cy="3.6" r="1.9" fill="currentColor" />
      {/* Bulan sabit */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d="M14.8 24a8.2 8.2 0 1 0 16.4 0 8.2 8.2 0 1 0-16.4 0Zm5.4-1.6a7 7 0 1 0 14 0 7 7 0 1 0-14 0Z"
      />
    </svg>
  );
}
