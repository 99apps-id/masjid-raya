import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import {
  getPetaPengaturan,
  pengaturanAngka,
  pengaturanSaklar,
} from "@/lib/settings";
import { ambilProfil } from "@/lib/profil";
import { getJadwalHarian, kunciTanggal } from "@/lib/prayer-times";
import { resolveAdzanUrl } from "@/lib/azan";
import { subdirMurottal } from "@/lib/murottal";
import { ambilAyatAcak } from "@/lib/ayat";
import { ringkasPapan } from "@/lib/papan";
import CalligraphyBackdrop from "@/components/CalligraphyBackdrop";
import DisplayBoard from "@/components/DisplayBoard";

// Papan informasi bergantung pada waktu berjalan, jadi tidak boleh di-cache.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await ambilProfil();
  return {
    title: {
      absolute: `${branding.nama} — Jadwal Shalat dan Papan Informasi`,
    },
    description:
      branding.deskripsi ??
      `Papan informasi ${branding.nama}: waktu sekarang, jadwal shalat terkini sesuai metode Kementerian Agama RI, dan ayat-ayat pilihan.`,
  };
}

export default async function Home() {
  const [pengaturan, branding] = await Promise.all([
    getPetaPengaturan(),
    ambilProfil(),
  ]);

  const hijriahOffsetHari = pengaturanAngka(pengaturan, "hijriah_offset_hari", {
    min: -2,
    max: 2,
  });

  const [profil, jadwal] = await Promise.all([
    prisma.profilMasjid.findFirst().catch(() => null),
    getJadwalHarian(pengaturan.lokasi_default, kunciTanggal(), {
      hijriahOffsetHari,
    }),
  ]);

  // Ambil 15 ayat pilihan acak untuk rotasi papan informasi masjid.
  const ayat = ambilAyatAcak(15);

  const iqomahMenit = pengaturanAngka(pengaturan, "iqomah_menit", {
    min: 1,
    max: 30,
  });

  // Hitung nilai awal di server supaya halaman pertama kali tampil sudah
  // berisi jam dan hitung mundur sebenarnya, bukan "--:--:--".
  const ringkasanAwal = ringkasPapan(
    new Date(),
    jadwal,
    iqomahMenit,
    undefined,
    hijriahOffsetHari
  );

  return (
    <div className="relative flex flex-1 flex-col">
      <CalligraphyBackdrop />
      <div className="relative z-10 flex flex-1 flex-col">
        <DisplayBoard
          namaMasjid={branding.nama}
          alamat={profil?.alamat ?? branding.alamat}
          logoMasjid={branding.logo}
          jadwalAwal={jadwal}
          ringkasanAwal={ringkasanAwal}
          ayat={ayat}
          runningText={pengaturan.running_text}
          reminderMenit={pengaturanAngka(pengaturan, "reminder_menit", {
            min: 1,
            max: 30,
          })}
          iqomahMenit={iqomahMenit}
          adzanAktif={pengaturanSaklar(pengaturan, "adzan_enabled")}
          adzanAudioUrl={resolveAdzanUrl(
            pengaturan.adzan_pilihan,
            pengaturan.adzan_audio_url
          )}
          reminderSuara={pengaturanSaklar(pengaturan, "reminder_suara")}
          tampilkanMurottal={pengaturanSaklar(pengaturan, "tampilkan_murottal")}
          murottalReciter={subdirMurottal(pengaturan.murottal_reciter)}
          hijriahOffsetHari={hijriahOffsetHari}
        />
      </div>
    </div>
  );
}
