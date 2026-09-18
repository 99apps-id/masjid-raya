import type { Metadata } from "next";
import FormJadwal from "@/components/admin/FormJadwal";
import { getPetaPengaturan } from "@/lib/settings";
import { normalisasiLokasi } from "@/lib/kota";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Tambah Jadwal Shalat" };

export default async function Halaman() {
  const pengaturan = await getPetaPengaturan();
  const zona = normalisasiLokasi(pengaturan.lokasi_default).zona;

  return (
    <FormJadwal lokasiAwal={pengaturan.lokasi_default} zona={zona} />
  );
}
