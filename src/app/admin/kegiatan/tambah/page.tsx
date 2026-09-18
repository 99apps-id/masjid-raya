import type { Metadata } from "next";
import FormKegiatan from "@/components/admin/FormKegiatan";
import { getPetaPengaturan } from "@/lib/settings";
import { normalisasiLokasi } from "@/lib/kota";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Tambah Kegiatan" };

export default async function Halaman() {
  // Zona waktu lokasi masjid dipakai agar nilai awal input tanggal tidak
  // bergeser satu hari.
  const pengaturan = await getPetaPengaturan();
  const zona = normalisasiLokasi(pengaturan.lokasi_default).zona;

  return <FormKegiatan zona={zona} />;
}
