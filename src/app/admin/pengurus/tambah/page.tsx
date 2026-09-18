import type { Metadata } from "next";
import FormPengurus from "@/components/admin/FormPengurus";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Tambah Pengurus" };

export default function Halaman() {
  return <FormPengurus />;
}
