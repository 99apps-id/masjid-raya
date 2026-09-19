import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: ({ token, req }) => {
      // Token yatim (akun dihapus / sesi dimatikan di jwt callback) tidak
      // punya sub — tolak walau objek token masih truthy.
      if (!token || !token.sub) return false;

      const path = req.nextUrl.pathname;
      const role = token.role as string | undefined;

      if (path.startsWith("/admin")) {
        return role === "admin" || role === "pengurus";
      }

      if (path.startsWith("/jamaah")) {
        return role === "jamaah" || role === "admin" || role === "pengurus";
      }

      return true;
    },
  },
});

// Hanya laman yang butuh login. Route /api/admin/* tidak masuk matcher ini
// karena masing-masing sudah menjaga dirinya lewat withAdminAuth.
export const config = {
  matcher: ["/admin/:path*", "/jamaah/:path*", "/akun/:path*"],
};
