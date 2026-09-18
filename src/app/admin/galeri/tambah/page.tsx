import type { Metadata } from "next";
import FormGaleri from "@/components/admin/FormGaleri";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Tambah Foto Galeri" };

export default function Halaman() {
  return <FormGaleri />;
}
