import type { Metadata } from "next";
import FormBerita from "@/components/admin/FormBerita";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit Berita" };

export default async function Halaman({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FormBerita id={id} />;
}
