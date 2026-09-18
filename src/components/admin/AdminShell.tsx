import Link from "next/link";

/** Kepala halaman panel admin: kicker, judul, keterangan, dan tombol aksi. */
export function KepalaAdmin({
  kicker,
  judul,
  keterangan,
  aksi,
}: {
  kicker: string;
  judul: string;
  keterangan?: string;
  aksi?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-forest-900/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="kicker">{kicker}</p>
        <h1 className="page-title mt-3">{judul}</h1>
        {keterangan && <p className="page-lead mt-3">{keterangan}</p>}
      </div>
      {aksi && <div className="flex shrink-0 flex-wrap items-center gap-3">{aksi}</div>}
    </header>
  );
}

/** Kartu pembungkus isi panel: tabel, formulir, atau daftar. */
export function KartuAdmin({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`surface overflow-hidden ${className ?? ""}`}>{children}</div>
  );
}

/** Keadaan kosong yang menjelaskan langkah berikutnya, bukan sekadar "kosong". */
export function AdminKosong({
  pesan,
  aksi,
}: {
  pesan: string;
  aksi?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-start gap-4 px-6 py-12">
      <p className="text-sm text-ink-500">{pesan}</p>
      {aksi && (
        <Link href={aksi.href} className="btn btn-primary">
          {aksi.label}
        </Link>
      )}
    </div>
  );
}

/** Tombol aksi utama pada kepala halaman (tautan bergaya tombol). */
export function TautanAksi({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="btn btn-primary">
      {children}
    </Link>
  );
}
