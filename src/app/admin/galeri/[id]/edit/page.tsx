import type { Metadata } from "next";
import FormGaleri from "@/components/admin/FormGaleri";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit Foto Galeri" };

export default async function Halaman({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FormGaleri id={id} />;
}
