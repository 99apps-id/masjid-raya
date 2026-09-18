/**
 * Ikon garis buatan sendiri, digambar satu gaya dengan lambang masjid
 * (garis 1.7, ujung membulat). Menggantikan emoji agar tampilan konsisten
 * dan tidak terasa seperti template siap pakai.
 */

interface IkonProps {
  className?: string;
}

function dasar(className?: string) {
  return {
    viewBox: "0 0 24 24",
    className: className ?? "h-4 w-4",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
}

export function IkonPanah({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function IkonKalender({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3.5v3" />
      <path d="M16 3.5v3" />
    </svg>
  );
}

export function IkonJam({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3.2 1.9" />
    </svg>
  );
}

export function IkonLokasi({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <path d="M12 21s6.5-5.6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </svg>
  );
}

export function IkonMikrofon({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <rect x="9" y="3" width="6" height="10" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
      <path d="M12 18v3" />
    </svg>
  );
}

export function IkonDokumen({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <path d="M6.5 3.5h7L18 8v12.5H6.5Z" />
      <path d="M13.5 3.5V8H18" />
      <path d="M9.5 12.5h5" />
      <path d="M9.5 16h5" />
    </svg>
  );
}

export function IkonTandaRujuk({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <path d="M9 13.5a3.5 3.5 0 0 1 0-7h1.5" />
      <path d="M15 10.5a3.5 3.5 0 0 1 0 7h-1.5" />
      <path d="M8.5 10h7" />
    </svg>
  );
}

export function IkonSurel({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
    </svg>
  );
}

export function IkonDasbor({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </svg>
  );
}

export function IkonPengguna({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function IkonGrup({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <circle cx="9.5" cy="9" r="3.1" />
      <path d="M3.5 19.5a6 6 0 0 1 12 0" />
      <path d="M16.5 6.4a3.1 3.1 0 0 1 0 5.2" />
      <path d="M17.8 14.2a6 6 0 0 1 2.7 5.3" />
    </svg>
  );
}

export function IkonGir({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 3.5v2.2M12 18.3v2.2M4.9 7.7l1.9 1.1M17.2 15.2l1.9 1.1M4.9 16.3l1.9-1.1M17.2 8.8l1.9-1.1" />
    </svg>
  );
}

export function IkonKeluar({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <path d="M15 5.5h3.5v13H15" />
      <path d="M11.5 12h-8" />
      <path d="m7 8.5-3.5 3.5L7 15.5" />
    </svg>
  );
}

export function IkonUnggah({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <path d="M12 16V4.5" />
      <path d="m7.5 9 4.5-4.5L16.5 9" />
      <path d="M4.5 15v3.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V15" />
    </svg>
  );
}

export function IkonSampah({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <path d="M4.5 7h15" />
      <path d="M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7" />
      <path d="M6.5 7l.8 12.1A1.4 1.4 0 0 0 8.7 20.4h6.6a1.4 1.4 0 0 0 1.4-1.3L17.5 7" />
      <path d="M10.5 11v6M13.5 11v6" />
    </svg>
  );
}

export function IkonPensil({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <path d="M15.6 4.6a2 2 0 0 1 2.9 2.8L8.4 17.5l-4 1.1 1.1-4Z" />
      <path d="m14.2 6 2.9 2.9" />
    </svg>
  );
}

export function IkonTambah({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function IkonSuara({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <path d="M11 5.5 6.5 9H3.8v6h2.7L11 18.5Z" />
      <path d="M14.8 9.4a3.7 3.7 0 0 1 0 5.2" />
      <path d="M17.4 6.8a7.3 7.3 0 0 1 0 10.4" />
    </svg>
  );
}

export function IkonGambar({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m5 17.5 4.6-4.3 3 2.7 2.6-2.3L20.5 17" />
    </svg>
  );
}

export function IkonTelepon({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <path d="M6.5 4h3l1.5 4-2 1.4a12 12 0 0 0 5.6 5.6l1.4-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5C11.6 18.6 5.4 12.4 5 5.6A1.5 1.5 0 0 1 6.5 4Z" />
    </svg>
  );
}

export function IkonPerisai({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <path d="M12 3.5 5.5 6v6c0 4.1 2.7 7.3 6.5 8.5 3.8-1.2 6.5-4.4 6.5-8.5V6Z" />
      <path d="m9.5 12 1.8 1.8 3.4-3.6" />
    </svg>
  );
}

export function IkonKunci({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <circle cx="7.5" cy="15.5" r="3.5" />
      <path d="m10.2 13 8.3-8.3" />
      <path d="m15.6 7.6 2.4 2.4" />
    </svg>
  );
}

export function IkonAgenda({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <circle cx="4.5" cy="6.5" r="1" />
      <circle cx="4.5" cy="12" r="1" />
      <circle cx="4.5" cy="17.5" r="1" />
      <path d="M8.5 6.5h11" />
      <path d="M8.5 12h11" />
      <path d="M8.5 17.5h11" />
    </svg>
  );
}

export function IkonAkun({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <circle cx="9.5" cy="8.5" r="3.4" />
      <path d="M3.5 20a6 6 0 0 1 11.6-2.1" />
      <path d="m14.8 9.3 1.7 1.7 3.5-3.6" />
    </svg>
  );
}

export function IkonKas({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <rect x="3.5" y="6.5" width="17" height="11" rx="2.5" />
      <path d="M3.5 10.5h17" />
      <circle cx="16.5" cy="13.8" r="1" />
    </svg>
  );
}

export function IkonPetugas({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <rect x="5" y="3.5" width="14" height="17" rx="2.5" />
      <circle cx="12" cy="10" r="2.2" />
      <path d="M8.5 17a3.7 3.7 0 0 1 7 0" />
    </svg>
  );
}

export function IkonPutar({ className }: IkonProps) {
  return (
    <svg {...dasar(className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 4.5v15l12-7.5-12-7.5Z" stroke="none" />
    </svg>
  );
}

export function IkonJeda({ className }: IkonProps) {
  return (
    <svg {...dasar(className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 5h4v14H6V5Zm8 0h4v14h-4V5Z" stroke="none" />
    </svg>
  );
}

export function IkonPanahKiri({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function IkonPanahKanan({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function IkonLayarPenuh({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

export function IkonKeluarLayarPenuh({ className }: IkonProps) {
  return (
    <svg {...dasar(className)}>
      <path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M4 10h6m0 0V4m0 6L3 3m17 7h-6m0 0V4m0 6l7-7" />
    </svg>
  );
}

