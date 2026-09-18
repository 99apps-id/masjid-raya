import type { Metadata } from "next";
import FormPetugas from "@/components/admin/FormPetugas";
import { getPetaPengaturan } from "@/lib/settings";
import { normalisasiLokasi } from "@/lib/kota";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Tambah Petugas" };

export default async function Halaman() {
  const pengaturan = await getPetaPengaturan();
  const zona = normalisasiLokasi(pengaturan.lokasi_default).zona;

  return <FormPetugas zona={zona} />;
}
