import ProteksiAdmin from "@/components/admin/ProteksiAdmin";

// Struktur kepengurusan: hanya peran admin.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProteksiAdmin>{children}</ProteksiAdmin>;
}
