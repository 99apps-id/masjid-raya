"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import LogoMasjid from "@/components/LogoMasjid";
import AyatShowcase from "@/components/AyatShowcase";
import KreditAplikasi from "@/components/KreditAplikasi";
import { IkonLayarPenuh, IkonKeluarLayarPenuh } from "@/components/Ikon";
import type { Ayat } from "@/lib/ayat";
import { LABEL_ZONA, ZONA_DEFAULT, type Zona } from "@/lib/kota";
import {
  detikHari,
  kunciTanggal,
  URUTAN_SHALAT,
  type JadwalHarian,
} from "@/lib/waktu";
import {
  formatDurasi,
  ringkasPapan,
  type RingkasanPapan,
} from "@/lib/papan";

const NAVIGASI = [
  { href: "/jadwal", label: "Jadwal Shalat" },
  { href: "/khutbah", label: "Khutbah" },
  { href: "/kegiatan", label: "Kegiatan" },
  { href: "/berita", label: "Berita" },
  { href: "/galeri", label: "Galeri" },
  { href: "/petugas", label: "Petugas" },
  { href: "/kas", label: "Laporan Kas" },
  { href: "/profil", label: "Profil" },
];

const JEDA_SEGARKAN_MS = 5 * 60 * 1000;

interface DisplayBoardProps {
  namaMasjid: string;
  alamat: string | null;
  logoMasjid?: string | null;
  jadwalAwal: JadwalHarian | null;
  ringkasanAwal: RingkasanPapan;
  ayat: Ayat[];
  runningText: string;
  reminderMenit: number;
  iqomahMenit: number;
  adzanAktif: boolean;
  adzanAudioUrl: string;
  reminderSuara: boolean;
  tampilkanMurottal: boolean;
  /** Subdirektori EveryAyah reciter murottal pilihan admin (lihat lib/murottal.ts). */
  murottalReciter: string;
  /** Penyesuaian tanggal Hijriah (hari) dari pengaturan masjid. */
  hijriahOffsetHari: number;
}

/** Nada pengingat lembut memakai Web Audio, tanpa berkas suara eksternal. */
function bunyikanNada() {
  if (typeof window === "undefined") return;
  const Konteks =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Konteks) return;

  try {
    const konteks = new Konteks();
    const mulai = konteks.currentTime;
    [523.25, 659.25, 783.99].forEach((frekuensi, urutan) => {
      const offset = urutan * 0.42;
      const osilator = konteks.createOscillator();
      const penguat = konteks.createGain();
      osilator.type = "sine";
      osilator.frequency.value = frekuensi;
      penguat.gain.setValueAtTime(0.0001, mulai + offset);
      penguat.gain.linearRampToValueAtTime(0.16, mulai + offset + 0.06);
      penguat.gain.exponentialRampToValueAtTime(0.0001, mulai + offset + 0.65);
      osilator.connect(penguat).connect(konteks.destination);
      osilator.start(mulai + offset);
      osilator.stop(mulai + offset + 0.7);
    });
    window.setTimeout(() => konteks.close(), 2500);
  } catch {
    // Suara bersifat tambahan; abaikan bila peramban menolak.
  }
}

export default function DisplayBoard({
  namaMasjid,
  alamat,
  logoMasjid,
  jadwalAwal,
  ringkasanAwal,
  ayat,
  runningText,
  reminderMenit,
  iqomahMenit,
  adzanAktif,
  adzanAudioUrl,
  reminderSuara,
  tampilkanMurottal,
  murottalReciter,
  hijriahOffsetHari,
}: DisplayBoardProps) {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const panelHref = role === "jamaah" ? "/jamaah" : "/admin";

  const [waktu, setWaktu] = useState<Date | null>(null);
  const [jadwal, setJadwal] = useState<JadwalHarian | null>(jadwalAwal);
  const [suaraSiap, setSuaraSiap] = useState(false);
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nadaTerakhir = useRef<string | null>(null);
  const adzanTerakhir = useRef<string | null>(null);
  const audioAdzan = useRef<HTMLAudioElement | null>(null);

  // Deteksi event perubahan fullscreen dari browser
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        setIsFullscreen(true);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => undefined);
      }
    }
  }, []);

  // Zona waktu mengikuti lokasi jadwal yang sedang tampil (WIB/WITA/WIT).
  const zona: Zona = jadwal?.zona ?? ZONA_DEFAULT;

  useEffect(() => {
    setWaktu(new Date());
    const timer = setInterval(() => setWaktu(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const segarkanJadwal = useCallback(async () => {
    try {
      // Pertahankan lokasi yang sedang tampil; tanpa ?lokasi= refresh akan
      // jatuh kembali ke lokasi default bila papan dibuka untuk kota lain.
      const lokasi = jadwalAwal?.lokasi ?? jadwal?.lokasi;
      const url = lokasi
        ? `/api/jadwal?lokasi=${encodeURIComponent(lokasi)}`
        : "/api/jadwal";
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as JadwalHarian;
      if (data && data.lokasi) setJadwal(data);
    } catch {
      // Biarkan jadwal yang sedang tampil bila jaringan bermasalah.
    }
  }, [jadwal?.lokasi, jadwalAwal?.lokasi]);

  useEffect(() => {
    const timer = setInterval(segarkanJadwal, JEDA_SEGARKAN_MS);
    return () => clearInterval(timer);
  }, [segarkanJadwal]);

  const tanggalLokal = waktu ? kunciTanggal(waktu, zona) : null;
  const tanggalTerakhir = useRef<string | null>(null);
  useEffect(() => {
    if (!tanggalLokal) return;
    if (tanggalTerakhir.current && tanggalTerakhir.current !== tanggalLokal) {
      void segarkanJadwal();
    }
    tanggalTerakhir.current = tanggalLokal;
  }, [tanggalLokal, segarkanJadwal]);

  const ringkasan = useMemo(
    () =>
      waktu
        ? ringkasPapan(waktu, jadwal, iqomahMenit, zona, hijriahOffsetHari)
        : ringkasanAwal,
    [waktu, jadwal, iqomahMenit, ringkasanAwal, zona, hijriahOffsetHari]
  );

  const detikSekarang = waktu ? detikHari(waktu, zona) : null;
  const menitSekarang = detikSekarang == null ? null : Math.floor(detikSekarang / 60);
  const shalatSebelumnya =
    menitSekarang == null
      ? null
      : [...ringkasan.baris]
          .reverse()
          .find((item) => item.menit <= menitSekarang) ?? null;

  const batasReminder = reminderMenit * 60;
  const dalamPengingat =
    ringkasan.hitungMundur != null &&
    ringkasan.hitungMundur > 0 &&
    ringkasan.hitungMundur <= batasReminder;

  // Mengaktifkan audio dengan interaksi pengguna
  useEffect(() => {
    if (suaraSiap) return;
    const aktifkan = () => setSuaraSiap(true);
    window.addEventListener("pointerdown", aktifkan, { once: true });
    window.addEventListener("keydown", aktifkan, { once: true });
    return () => {
      window.removeEventListener("pointerdown", aktifkan);
      window.removeEventListener("keydown", aktifkan);
    };
  }, [suaraSiap]);

  // Pengingat shalat
  useEffect(() => {
    if (!dalamPengingat || !reminderSuara || !suaraSiap) return;
    const kunci = ringkasan.berikutnyaKey;
    if (!kunci || nadaTerakhir.current === kunci) return;
    nadaTerakhir.current = kunci;
    bunyikanNada();
  }, [dalamPengingat, reminderSuara, suaraSiap, ringkasan.berikutnyaKey]);

  // Pemutaran Adzan otomatis
  useEffect(() => {
    if (!adzanAktif || !ringkasan.iqomahKey || !adzanAudioUrl) return;
    if (adzanTerakhir.current === ringkasan.iqomahKey) return;
    adzanTerakhir.current = ringkasan.iqomahKey;
    void audioAdzan.current?.play().catch(() => undefined);
  }, [adzanAktif, ringkasan.iqomahKey, adzanAudioUrl]);

  // Hitung mundur khusus berbuka
  const hitungMundurKe = (jamMenit: string | undefined | null) => {
    if (!waktu || !jamMenit) return null;
    const [jam, menit] = jamMenit.split(":").map(Number);
    if (!Number.isFinite(jam) || !Number.isFinite(menit)) return null;
    let sisa = jam * 3600 + menit * 60 - detikHari(waktu, zona);
    if (sisa < 0) sisa += 86400;
    return sisa;
  };

  const sedangRamadhan = ringkasan.bulan === "Ramadhan";
  const sisaBerbuka = hitungMundurKe(jadwal?.maghrib);

  return (
    <div
      className={`relative flex flex-col text-forest-950 transition-all duration-300 ${
        isFullscreen
          ? "h-dvh w-screen overflow-hidden bg-paper"
          : "min-h-dvh 2xl:h-dvh 2xl:overflow-hidden"
      }`}
    >
      {/* Header Display Board: Identitas Masjid & Kontrol Layar Penuh */}
      <header
        className={`relative z-30 flex shrink-0 items-center justify-between gap-4 border-b border-forest-900/10 px-4 backdrop-blur-md sm:px-8 lg:px-12 ${
          isFullscreen ? "bg-white/25 py-2" : "bg-white/40 py-3 lg:py-4"
        }`}
      >
        {/* Identitas Masjid */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <LogoMasjid
            nama={namaMasjid}
            logo={logoMasjid}
            className="h-10 w-10 shrink-0 text-forest-700 sm:h-12 sm:w-12"
            dekoratif
          />
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl text-forest-950 sm:text-2xl">
              {namaMasjid}
            </h1>
            {alamat && (
              <p className="truncate text-xs font-semibold uppercase tracking-wider text-forest-800/80">
                {alamat}
              </p>
            )}
          </div>
        </div>

        {/* Kontrol Kanan: Menu Web (hanya tampil saat TIDAK fullscreen) + Tombol Fullscreen */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {!isFullscreen && (
            <>
              {/* Navigasi Link Website */}
              <nav className="hidden items-center gap-5 xl:flex">
                {NAVIGASI.map((tautan) => (
                  <Link
                    key={tautan.href}
                    href={tautan.href}
                    className="text-sm font-semibold text-ink-500 transition hover:text-forest-700"
                  >
                    {tautan.label}
                  </Link>
                ))}
              </nav>

              {/* Status Ramadhan & Tombol Masuk */}
              <div className="hidden items-center gap-2.5 sm:flex">
                {sedangRamadhan && (
                  <span className="rounded-full border border-brass-600/30 bg-brass/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brass-600">
                    Ramadhan
                  </span>
                )}
                {session ? (
                  <>
                    <Link
                      href={panelHref}
                      className="btn btn-primary py-1.5 px-3.5 text-xs sm:text-sm"
                    >
                      {role === "admin" || role === "pengurus"
                        ? "Panel Admin"
                        : "Dashboard"}
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await signOut();
                        } catch {
                          // Abaikan kegagalan logout sisi klien; pengguna
                          // sudah diarahkan ke /login oleh next-auth.
                        }
                      }}
                      className="btn btn-quiet py-1.5 px-3 text-xs sm:text-sm"
                    >
                      Keluar
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="btn btn-outline py-1.5 px-3.5 text-xs sm:text-sm"
                  >
                    Masuk
                  </Link>
                )}
              </div>

              {/* Tombol Hamburger Mobile */}
              <button
                type="button"
                onClick={() => setMenuTerbuka(!menuTerbuka)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-forest-900/15 bg-white/70 text-forest-800 transition hover:bg-white xl:hidden"
                aria-label={menuTerbuka ? "Tutup menu" : "Buka menu"}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {menuTerbuka ? (
                    <>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </>
                  ) : (
                    <>
                      <line x1="4" y1="7" x2="20" y2="7" />
                      <line x1="4" y1="12" x2="20" y2="12" />
                      <line x1="4" y1="17" x2="20" y2="17" />
                    </>
                  )}
                </svg>
              </button>
            </>
          )}

          {/* Tombol Toggle Fullscreen (Mode Layar Penuh TV) */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition backdrop-blur-md ${
              isFullscreen
                ? "border-forest-700 bg-forest-700 text-white shadow-sm hover:bg-forest-600"
                : "border-forest-900/20 bg-white/70 text-forest-900 shadow-sm hover:bg-white"
            }`}
            title={isFullscreen ? "Keluar layar penuh" : "Mode TV Layar Penuh"}
            aria-label={isFullscreen ? "Keluar layar penuh" : "Mode TV Layar Penuh"}
          >
            {isFullscreen ? (
              <IkonKeluarLayarPenuh className="h-4 w-4" />
            ) : (
              <>
                <IkonLayarPenuh className="h-4 w-4 text-forest-700" />
                <span className="hidden sm:inline">Layar Penuh TV</span>
              </>
            )}
          </button>
        </div>

        {/* Drawer Dropdown Navigasi Mobile (hanya tampil saat tidak fullscreen) */}
        {!isFullscreen && menuTerbuka && (
          <div className="absolute inset-x-0 top-full z-40 border-b border-forest-900/10 bg-white/95 px-6 py-5 shadow-lg backdrop-blur-md xl:hidden">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {NAVIGASI.map((tautan) => (
                <Link
                  key={tautan.href}
                  href={tautan.href}
                  onClick={() => setMenuTerbuka(false)}
                  className="rounded-lg border border-forest-900/10 bg-forest-50/70 px-3 py-2 text-center text-xs font-bold text-forest-900 transition hover:bg-forest-100"
                >
                  {tautan.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-end gap-2 border-t border-forest-900/10 pt-4 sm:hidden">
              {session ? (
                <>
                  <Link
                    href={panelHref}
                    onClick={() => setMenuTerbuka(false)}
                    className="btn btn-primary py-2 text-xs"
                  >
                    {role === "admin" || role === "pengurus"
                      ? "Panel Admin"
                      : "Dashboard"}
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await signOut();
                      } catch {
                        // Abaikan kegagalan logout sisi klien.
                      }
                    }}
                    className="btn btn-quiet py-2 text-xs"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuTerbuka(false)}
                  className="btn btn-outline py-2 text-xs"
                >
                  Masuk
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Banner Peringatan / Pengingat Menjelang Shalat */}
      {dalamPengingat && (
        <div className="mx-4 mt-2 sm:mx-8 lg:mx-12">
          <div className="animate-pulse flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brass-600/40 bg-brass/20 px-5 py-2.5 backdrop-blur-sm shadow-sm">
            <p className="text-sm font-bold text-brass-600 sm:text-base">
              Kurang {formatDurasi(ringkasan.hitungMundur ?? 0)} lagi masuk waktu {ringkasan.berikutnyaNama}
            </p>
            <p className="text-xs font-semibold text-forest-950 sm:text-sm">
              Mari bersiap menunaikan shalat berjamaah
            </p>
          </div>
        </div>
      )}

      {/* Banner Iqomah */}
      {ringkasan.iqomahNama && ringkasan.iqomahSisa != null && (
        <div className="mx-4 mt-2 sm:mx-8 lg:mx-12">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-forest-500/40 bg-forest-100/90 px-5 py-2.5 backdrop-blur-sm shadow-sm">
            <p className="text-sm font-bold text-forest-900 sm:text-base">
              Telah masuk waktu {ringkasan.iqomahNama}, iqomah dalam{" "}
              <span className="tabular-nums text-forest-700 font-extrabold">
                {formatDurasi(ringkasan.iqomahSisa)}
              </span>
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-forest-700 sm:text-sm">
              Rapatkan shaf dan luruskan barisan
            </p>
          </div>
        </div>
      )}

      {/* Konten Utama Grid: Kolom Kiri Ayat Pilihan & Kolom Kanan Jam & Hitung Mundur */}
      <main
        className={`grid flex-1 min-h-0 items-center gap-4 px-4 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:px-12 ${
          isFullscreen ? "py-1.5 overflow-hidden" : "py-3"
        }`}
      >
        {/* Kolom Kiri: Ayat Pilihan Showcase (Menyatu transparan dengan latar belakang) */}
        <section className={`flex flex-col justify-center lg:col-span-7 ${isFullscreen ? "min-h-0 h-full overflow-hidden" : ""}`}>
          <AyatShowcase
            ayat={ayat}
            jedaMs={14000}
            tampilkanMurottal={tampilkanMurottal}
            reciter={murottalReciter}
            ringkas={isFullscreen}
          />
        </section>

        {/* Kolom Kanan: Papan Waktu Sekarang & Kotak Hitung Mundur Shalat (Semi-Transparan) */}
        <section className={`flex flex-col justify-center lg:col-span-5 ${isFullscreen ? "min-h-0 h-full overflow-hidden" : ""}`}>
          <div className="surface flex flex-col rounded-2xl border border-forest-900/15 bg-white/45 p-5 shadow-sm backdrop-blur-md transition hover:border-forest-900/25 lg:p-6 overflow-y-auto">
            {/* Bagian 1: Waktu Sekarang */}
            <div>
              <div className="flex items-center justify-between">
                <span className="kicker font-bold tracking-widest text-forest-700 uppercase text-[10px]">
                  Waktu Sekarang
                </span>
                <span className="rounded-full border border-forest-700/30 bg-forest-700/10 px-2.5 py-0.5 text-[10px] font-extrabold tracking-widest text-forest-700 uppercase">
                  {LABEL_ZONA[zona]}
                </span>
              </div>

              {/* Jam — Digital Signage Style */}
              <div className="mt-1 font-mono text-[clamp(2.8rem,5.5vw,5rem)] font-black leading-none tracking-tighter tabular-nums slashed-zero text-forest-950 [font-variant-numeric:tabular-nums]">
                {ringkasan.jamTampil}
              </div>

              {/* Tanggal Masehi dan Hijriah */}
              <div className="mt-2 flex flex-col gap-0.5 border-b border-forest-900/10 pb-3">
                <p className="text-sm font-semibold text-ink-500 sm:text-base">
                  {ringkasan.tanggalPanjang}
                </p>
                <p className="font-arabic text-lg font-bold text-forest-700 sm:text-xl">
                  {ringkasan.hijriah}
                </p>
              </div>
            </div>

            {/* Bagian 2: Waktu Shalat Berikutnya & Hitung Mundur (Transparan Halus) */}
            <div className="mt-3 rounded-xl border border-forest-900/10 bg-forest-50/40 p-3.5 sm:p-4 backdrop-blur-sm">
              {/* Header Waktu Shalat Berikutnya */}
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-forest-700">
                    Shalat Berikutnya
                  </span>
                  <h3 className="mt-0.5 font-display text-[clamp(1.4rem,2.8vw,2.2rem)] text-forest-950 leading-tight">
                    {ringkasan.berikutnyaNama}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-400">
                    Pukul
                  </span>
                  <p className="mt-0.5 font-mono text-xl font-extrabold tabular-nums text-forest-800 sm:text-2xl leading-tight">
                    {ringkasan.berikutnyaJam}
                  </p>
                </div>
              </div>

              {/* Kotak Hitung Mundur — Monospace Profesional */}
              <div className="mt-3 flex items-center justify-between rounded-lg border border-forest-900/10 bg-white/60 px-4 py-2.5 backdrop-blur-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-ink-500">
                  Hitung Mundur
                </span>
                <span className="font-mono text-2xl font-black tabular-nums slashed-zero text-forest-600 sm:text-3xl [font-variant-numeric:tabular-nums] leading-none">
                  {ringkasan.hitungMundur != null
                    ? formatDurasi(ringkasan.hitungMundur)
                    : "--:--:--"}
                </span>
              </div>

              {/* Progress Bar Kemajuan Menuju Waktu Shalat */}
              <div className="mt-3">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-forest-900/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-forest-600 via-forest-500 to-mint transition-[width] duration-700"
                    style={{ width: `${ringkasan.persen}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] font-medium text-ink-400">
                  <span>sejak {shalatSebelumnya?.nama ?? "tengah malam"}</span>
                  <span className="font-bold tabular-nums text-forest-700">
                    {ringkasan.persen}%
                  </span>
                </div>
              </div>
            </div>

            {/* Bagian 3: Info Ramadhan (Imsak & Berbuka) */}
            {sedangRamadhan && jadwal && (
              <div className="mt-3.5 grid grid-cols-2 gap-2.5 border-t border-forest-900/10 pt-3.5">
                <div className="rounded-xl border border-forest-900/10 bg-white/40 px-3.5 py-2 backdrop-blur-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                    Imsak
                  </p>
                  <p className="mt-0.5 text-lg font-bold tabular-nums text-forest-800 sm:text-xl">
                    {jadwal.imsak}
                  </p>
                </div>
                <div className="rounded-xl border border-brass-600/30 bg-brass/15 px-3.5 py-2 backdrop-blur-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brass-600">
                    Berbuka (Maghrib)
                  </p>
                  <p className="mt-0.5 text-lg font-bold tabular-nums text-brass-600 sm:text-xl">
                    {jadwal.maghrib}
                  </p>
                  {sisaBerbuka != null && (
                    <p className="text-[11px] font-semibold tabular-nums text-ink-500">
                      dalam {formatDurasi(sisaBerbuka)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Kontrol Audio Adzan & Pengingat — disembunyikan di mode
                fullscreen TV agar tampilan bersih dari tombol. */}
            {(adzanAktif || reminderSuara) && !isFullscreen && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-forest-900/10 pt-3">
                {reminderSuara && (
                  <span className="text-xs font-medium text-ink-500">
                    {suaraSiap ? "🔔 Pengingat aktif" : "🔔 Ketuk layar untuk aktifkan suara"}
                  </span>
                )}
                {adzanAktif && adzanAudioUrl && (
                  <div className="flex items-center gap-2">
                    <audio ref={audioAdzan} src={adzanAudioUrl} preload="none" onError={() => undefined} />
                    <button
                      type="button"
                      onClick={() => {
                        const el = audioAdzan.current;
                        if (!el) return;
                        if (el.paused) void el.play().catch(() => undefined);
                        else el.pause();
                      }}
                      className="btn btn-outline py-1 px-3 text-xs"
                    >
                      Uji Adzan
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Rel Jadwal Shalat 8 Waktu (Imsak s.d. Isya) - Semi-Transparan Digital Signage */}
      <section className="shrink-0 px-4 py-1.5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8 sm:gap-3">
          {URUTAN_SHALAT.map((waktuShalat) => {
            const berikutnya = ringkasan.berikutnyaKey === waktuShalat.key;
            const sedangIqomah = ringkasan.iqomahKey === waktuShalat.key;
            const nilai = jadwal?.[waktuShalat.key] || "--:--";

            return (
              <div
                key={waktuShalat.key}
                className={`relative flex flex-col justify-between overflow-hidden rounded-xl border p-3 sm:p-3.5 backdrop-blur-sm transition-all ${
                  berikutnya
                    ? "border-forest-600 bg-forest-700 text-white shadow-md shadow-forest-900/20"
                    : sedangIqomah
                    ? "border-brass-600/50 bg-brass/20 text-forest-950"
                    : "border-forest-900/15 bg-white/50 text-forest-950 hover:bg-white/70"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      berikutnya ? "text-forest-100" : "text-ink-500"
                    }`}
                  >
                    {waktuShalat.nama}
                  </span>
                  {berikutnya && (
                    <span className="rounded-full bg-brass px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-forest-950">
                      Berikutnya
                    </span>
                  )}
                  {sedangIqomah && (
                    <span className="rounded-full bg-brass-600 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
                      Iqomah
                    </span>
                  )}
                </div>

                <div
                  className={`mt-1.5 text-xl font-bold tabular-nums tracking-tight sm:text-2xl ${
                    berikutnya ? "text-white" : "text-forest-900"
                  }`}
                >
                  {nilai}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Papan Informasi Digital dengan Marquee & Lokasi */}
      <footer
        className={`mt-0.5 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-forest-900/10 px-4 py-2 backdrop-blur-sm sm:px-8 lg:px-12 ${
          isFullscreen ? "bg-white/25" : "bg-white/40"
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-2 w-2 shrink-0 rounded-full bg-forest-500 animate-pulse" />
          <p className="truncate text-xs font-semibold text-ink-500 sm:text-sm">
            {runningText}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-ink-400">
          <span>
            Jadwal {jadwal?.lokasi ?? "-"}
            {jadwal?.provinsi ? `, ${jadwal.provinsi}` : ""} · {LABEL_ZONA[zona]}
          </span>
          {!isFullscreen && <KreditAplikasi className="hidden sm:inline" />}
        </div>
      </footer>
    </div>
  );
}
