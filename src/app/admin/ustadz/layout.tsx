import ProteksiAdmin from "@/components/admin/ProteksiAdmin";

// Ustadz & penceramah: hanya peran admin.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProteksiAdmin>{children}</ProteksiAdmin>;
}
