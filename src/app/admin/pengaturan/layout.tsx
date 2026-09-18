import ProteksiAdmin from "@/components/admin/ProteksiAdmin";

// Pengaturan papan & jadwal: hanya peran admin (API-nya pun sudah admin-only).
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProteksiAdmin>{children}</ProteksiAdmin>;
}
