import type { Metadata } from "next";
import FormUstadz from "@/components/admin/FormUstadz";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Tambah Ustadz" };

export default function Halaman() {
  return <FormUstadz />;
}
