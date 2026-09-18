import type { Metadata } from "next";
import FormJadwal from "@/components/admin/FormJadwal";
import { getPetaPengaturan } from "@/lib/settings";
import { normalisasiLokasi } from "@/lib/kota";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit Jadwal Shalat" };

export default async function Halaman({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pengaturan = await getPetaPengaturan();
  const zona = normalisasiLokasi(pengaturan.lokasi_default).zona;

  return (
    <FormJadwal
      id={id}
      lokasiAwal={pengaturan.lokasi_default}
      zona={zona}
    />
  );
}
