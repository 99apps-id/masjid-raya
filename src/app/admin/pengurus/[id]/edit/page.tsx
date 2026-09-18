import type { Metadata } from "next";
import FormPengurus from "@/components/admin/FormPengurus";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit Pengurus" };

export default async function Halaman({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FormPengurus id={id} />;
}
