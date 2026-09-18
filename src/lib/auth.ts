import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextApiRequest } from "next";
import bcrypt from "bcryptjs";
import prisma from "./prisma";
import { alamatKlien, batasiLaju, hapusBatasLaju } from "./rate-limit";

/**
 * Berapa kali sandi boleh salah dalam satu jendela sebelum alamat tersebut
 * ditolak sementara. Tanpa ini, endpoint kredensial bisa ditebak otomatis
 * sampai tembus (kata sandi bawaan seed pun ikut berisiko).
 */
const BATAS_LOGIN = 8;
const JENDELA_LOGIN_MS = 10 * 60 * 1000;

/**
 * Batas kedua per AKUN (surel), tak bergantung alamat pengirim. Pembatas per
 * alamat saja bisa dilewati dengan memalsukan header `X-Forwarded-For` pada
 * tiap percobaan (setiap alamat palsu membuat kuota baru). Dengan menambatkan
 * batas pada surel juga, satu akun tetap tidak bisa ditebak sandinya tanpa henti
 * walau alamat sumber dipalsukan berganti-ganti.
 */
const BATAS_LOGIN_AKUN = 10;
const JENDELA_LOGIN_AKUN_MS = 15 * 60 * 1000;

/** Jeda maksimum pemeriksaan ulang pengguna di database (ms). */
const JEDA_SEGARKAN_PENGGUNA_MS = 5 * 60 * 1000;

function ambilAlamat(req: NextApiRequest | undefined): string {
  const header = new Headers();
  const daftar = req?.headers ?? {};
  for (const [nama, nilai] of Object.entries(daftar)) {
    if (typeof nilai === "string") header.set(nama, nilai);
    else if (Array.isArray(nilai)) header.set(nama, nilai.join(","));
  }
  return alamatKlien(header);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) return null;

        const kunciAlamat = `login-ip:${ambilAlamat(req as NextApiRequest | undefined)}`;
        const kunciAkun = `login-akun:${email}`;
        const batasAlamat = batasiLaju(kunciAlamat, BATAS_LOGIN, JENDELA_LOGIN_MS);
        const batasAkun = batasiLaju(
          kunciAkun,
          BATAS_LOGIN_AKUN,
          JENDELA_LOGIN_AKUN_MS
        );
        if (!batasAlamat.boleh || !batasAkun.boleh) return null;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) return null;

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) return null;

        // Sandi benar: kuota kesalahan alamat & akun tidak perlu menahan lagi.
        hapusBatasLaju(kunciAlamat);
        hapusBatasLaju(kunciAkun);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as string,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as { role?: string }).role;
        token.cek = Date.now();
        return token;
      }

      // Token JWT berumur 30 hari. Tanpa pemeriksaan ulang, akun yang dihapus
      // atau diturunkan perannya tetap bisa masuk sampai token kedaluwarsa.
      // Dicek berkala (bukan setiap permintaan) agar tidak membebani database.
      const terakhir = typeof token.cek === "number" ? token.cek : 0;
      if (token.sub && Date.now() - terakhir > JEDA_SEGARKAN_PENGGUNA_MS) {
        const pengguna = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, password: true },
        });

        if (!pengguna || !pengguna.password) {
          // Akun hilang atau tidak lagi bisa masuk: matikan token.
          return { ...token, role: undefined, sub: undefined };
        }

        token.role = pengguna.role;
        token.cek = Date.now();
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string | undefined;
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
