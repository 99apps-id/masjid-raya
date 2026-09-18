import BrandMark from "@/components/BrandMark";

interface LogoMasjidProps {
  /** Nama masjid, dipakai untuk teks alternatif gambar. */
  nama: string;
  /** Tautan logo hasil unggahan. Bila kosong, dipakai lambang bawaan. */
  logo?: string | null;
  className?: string;
  /** Sembunyikan dari pembaca layar bila nama sudah tampil di sebelahnya. */
  dekoratif?: boolean;
}

/**
 * Logo masjid. Menampilkan berkas yang diunggah pengelola bila ada; bila belum
 * ada, memakai lambang mihrab bawaan supaya tampilan tetap utuh.
 */
export default function LogoMasjid({
  nama,
  logo,
  className,
  dekoratif = false,
}: LogoMasjidProps) {
  if (!logo) {
    return <BrandMark className={className} dekoratif={dekoratif} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- logo dapat berasal
    // dari berkas unggahan (berukuran kecil) atau tautan luar; tidak perlu
    // optimasi gambar Next.
    <img
      src={logo}
      alt={dekoratif ? "" : `Logo ${nama}`}
      aria-hidden={dekoratif ? true : undefined}
      className={`${className ?? ""} object-contain`}
      loading="lazy"
      decoding="async"
    />
  );
}
