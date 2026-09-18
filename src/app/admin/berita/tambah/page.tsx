import type { Metadata } from "next";
import FormBerita from "@/components/admin/FormBerita";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Tambah Berita" };

export default function Halaman() {
  return <FormBerita />;
}
