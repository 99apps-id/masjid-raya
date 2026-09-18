import type { Metadata } from "next";
import FormAgenda from "@/components/admin/FormAgenda";
import { getPetaPengaturan } from "@/lib/settings";
import { normalisasiLokasi } from "@/lib/kota";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Tambah Agenda" };

export default async function Halaman() {
  // Zona waktu lokasi masjid dipakai agar nilai awal input tanggal tidak
  // bergeser satu hari.
  const pengaturan = await getPetaPengaturan();
  const zona = normalisasiLokasi(pengaturan.lokasi_default).zona;

  return <FormAgenda zona={zona} />;
}
