import type { Metadata } from "next";
import FormKegiatan from "@/components/admin/FormKegiatan";
import { getPetaPengaturan } from "@/lib/settings";
import { normalisasiLokasi } from "@/lib/kota";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit Kegiatan" };

export default async function Halaman({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pengaturan = await getPetaPengaturan();
  const zona = normalisasiLokasi(pengaturan.lokasi_default).zona;

  return <FormKegiatan id={id} zona={zona} />;
}
