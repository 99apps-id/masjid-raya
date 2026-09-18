import type { Metadata } from "next";
import FormKas from "@/components/admin/FormKas";
import { getPetaPengaturan } from "@/lib/settings";
import { normalisasiLokasi } from "@/lib/kota";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Catat Transaksi Kas" };

export default async function Halaman() {
  const pengaturan = await getPetaPengaturan();
  const zona = normalisasiLokasi(pengaturan.lokasi_default).zona;

  return <FormKas zona={zona} />;
}
