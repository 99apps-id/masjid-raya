import ProteksiAdmin from "@/components/admin/ProteksiAdmin";

// Profil & logo masjid: hanya peran admin (API-nya pun sudah admin-only).
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProteksiAdmin>{children}</ProteksiAdmin>;
}
