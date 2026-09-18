import type { Metadata } from "next";
import FormPengguna from "@/components/admin/FormPengguna";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit Pengguna" };

export default async function Halaman({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FormPengguna id={id} />;
}
