import type { Metadata } from "next";
import FormUstadz from "@/components/admin/FormUstadz";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit Ustadz" };

export default async function Halaman({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FormUstadz id={id} />;
}
