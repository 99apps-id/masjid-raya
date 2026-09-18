import type { Metadata } from "next";
import FormPengguna from "@/components/admin/FormPengguna";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Tambah Pengguna" };

export default function Halaman() {
  return <FormPengguna />;
}
