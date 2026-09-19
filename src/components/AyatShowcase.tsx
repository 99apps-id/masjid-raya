"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  rujukanAyat,
  daftarUrlAudioAyat,
  daftarUrlAudioSurah,
  type Ayat,
} from "@/lib/ayat";
import { SUBDIR_MUROTTAL_BAWAAN } from "@/lib/murottal";
import type { InfoSurah } from "@/lib/surah";
import {
  IkonSuara,
  IkonPutar,
  IkonJeda,
  IkonPanahKiri,
  IkonPanahKanan,
} from "@/components/Ikon";

interface AyatSurahTampil {
  nomor: number;
  ar: string;
  idn: string;
}

/** Cache teks surah per sesi agar pindah/maju surah tidak memuat ulang. */
const cacheTeksSurah = new Map<number, AyatSurahTampil[]>();

interface AyatShowcaseProps {
  ayat: Ayat[];
  /** Lama tiap ayat ditampilkan bila murottal tidak berputar (milidetik). Bawaan: 14000 (14 detik). */
  jedaMs?: number;
  /** Tampilkan tombol dan pemutar murattal untuk ayat yang sedang tampil. */
  tampilkanMurottal?: boolean;
  /**
   * Subdirektori EveryAyah reciter pilihan admin. Bawaan: Alafasy.
   * Ganti suara cukup lewat pengaturan — tanpa menyentuh kode.
   */
  reciter?: string;
  /**
   * Surah penuh yang ditampilkan (mode surah). Bila null, dipakai mode
   * kurasi ayat pilihan seperti sebelumnya.
   */
  surah?: InfoSurah | null;
  /**
   * Tahan murottal dari luar (mis. saat adzan berkumandang): audio dijeda
   * dan dilanjutkan otomatis dari posisi yang sama begitu tahan dibuka.
   */
  tahanMurottal?: boolean;
  /**
   * Mode surah: maju otomatis ke surah berikutnya setelah satu surah tuntas
   * (melalui `onSurahBerikutnya`). Bila false, surah yang sama diulang.
   */
  lanjutKeSurahBerikut?: boolean;
  onSurahBerikutnya?: () => void;
  /**
   * Mode ringkas untuk layar penuh TV: badge status, tombol kontrol, dan
   * navigasi disembunyikan, serta ukuran teks dikecilkan agar nama surah
   * dan terjemahan tidak meluber tertutup kartu jadwal di bawahnya.
   */
  ringkas?: boolean;
}

export default function AyatShowcase({
  ayat,
  jedaMs = 14000,
  tampilkanMurottal = true,
  reciter = SUBDIR_MUROTTAL_BAWAAN,
  surah = null,
  tahanMurottal = false,
  lanjutKeSurahBerikut = false,
  onSurahBerikutnya,
  ringkas = false,
}: AyatShowcaseProps) {
  const [indeks, setIndeks] = useState(0);
  const [animasiMasuk, setAnimasiMasuk] = useState(true);
  const [dijedaUser, setDijedaUser] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [sedangPutar, setSedangPutar] = useState(false);
  const [kemajuan, setKemajuan] = useState(0);
  const [autoplayMurottal, setAutoplayMurottal] = useState(true);
  const [audioDiblokirPeramban, setAudioDiblokirPeramban] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const timerMaju = useRef<NodeJS.Timeout | null>(null);
  const timerGanti = useRef<number | null>(null);
  const timerLanjut = useRef<number | null>(null);

  const totalAyat = ayat.length;
  const aman = totalAyat === 0 ? 0 : Math.min(indeks, totalAyat - 1);
  const ayatAktif = ayat[aman];

  // --- Mode surah penuh: teks Arab + terjemah dimuat dari /api/surah ---
  const [teksSurah, setTeksSurah] = useState<AyatSurahTampil[] | null>(null);
  const [memuatSurah, setMemuatSurah] = useState(false);
  const [galatSurah, setGalatSurah] = useState(false);
  const nomorSurah = surah?.nomor ?? null;

  useEffect(() => {
    if (!nomorSurah) {
      setTeksSurah(null);
      setMemuatSurah(false);
      setGalatSurah(false);
      return;
    }
    const tersimpan = cacheTeksSurah.get(nomorSurah);
    if (tersimpan) {
      setTeksSurah(tersimpan);
      setMemuatSurah(false);
      setGalatSurah(false);
      return;
    }
    let batal = false;
    setTeksSurah(null);
    setMemuatSurah(true);
    setGalatSurah(false);
    fetch(`/api/surah/${nomorSurah}`, { cache: "force-cache" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ ayat: AyatSurahTampil[] }>;
      })
      .then((data) => {
        if (batal) return;
        if (Array.isArray(data.ayat) && data.ayat.length > 0) {
          cacheTeksSurah.set(nomorSurah, data.ayat);
          setTeksSurah(data.ayat);
          setMemuatSurah(false);
        } else {
          setGalatSurah(true);
          setMemuatSurah(false);
        }
      })
      .catch(() => {
        if (batal) return;
        setGalatSurah(true);
        setMemuatSurah(false);
      });
    return () => {
      batal = true;
    };
  }, [nomorSurah]);

  // Surah aktif hanya bila teksnya benar-benar termuat; bila gagal,
  // tampilan jatuh kembali ke mode ayat pilihan.
  const surahAktif = surah && teksSurah && teksSurah.length > 0 ? surah : null;
  // Sedang memuat teks (bukan gagal): tampilkan status, bukan kurasi.
  const memuatTeks = !!surah && memuatSurah && !surahAktif;

  // --- Daftar putar ---
  // Mode surah: seluruh ayat surah berurutan dengan suara reciter pilihan.
  // Mode kurasi: kutipan rentang (mis. 5–6) diputar per ayat berurutan.
  const daftarAudio = useMemo(() => {
    if (surahAktif && teksSurah) {
      return daftarUrlAudioSurah(surahAktif.nomor, teksSurah.length, reciter);
    }
    return ayatAktif ? daftarUrlAudioAyat(ayatAktif, reciter) : [];
  }, [surahAktif, teksSurah, ayatAktif, reciter]);
  // Posisi ayat di dalam rentang yang sedang dilantunkan (0-based).
  const [bagian, setBagian] = useState(0);
  // Ganti reciter/surah di tengah jalan: ulangi dari awal kutipan ini.
  useEffect(() => {
    setBagian(0);
    setKemajuan(0);
  }, [reciter, nomorSurah]);
  const urlAudio = daftarAudio[bagian] ?? null;
  const totalBagian = daftarAudio.length;

  // Pra-muat teks surah berikutnya menjelang akhir surah agar pindah
  // surah tidak menampilkan status muat (terutama surah panjang).
  useEffect(() => {
    if (!surahAktif || !lanjutKeSurahBerikut || !teksSurah) return;
    if (bagian < teksSurah.length - 3) return;
    const berikut = (surahAktif.nomor % 114) + 1;
    if (cacheTeksSurah.has(berikut)) return;
    fetch(`/api/surah/${berikut}`, { cache: "force-cache" })
      .then((res) => (res.ok ? (res.json() as Promise<{ ayat: AyatSurahTampil[] }>) : null))
      .then((data) => {
        if (data && Array.isArray(data.ayat) && data.ayat.length > 0) {
          cacheTeksSurah.set(berikut, data.ayat);
        }
      })
      .catch(() => undefined);
  }, [surahAktif, lanjutKeSurahBerikut, teksSurah, bagian]);

  // Pergantian ayat dengan transisi cross-fade lembut
  const gantiKe = useCallback(
    (target: number) => {
      if (target === aman || totalAyat === 0) return;
      setAnimasiMasuk(false);
      if (timerGanti.current !== null) window.clearTimeout(timerGanti.current);
      timerGanti.current = window.setTimeout(() => {
        setIndeks(target);
        setBagian(0);
        setKemajuan(0);
        setAnimasiMasuk(true);
      }, 250);
    },
    [aman, totalAyat]
  );

  // Bersihkan timer pergantian bila komponen dilepas.
  useEffect(() => {
    return () => {
      if (timerGanti.current !== null) window.clearTimeout(timerGanti.current);
      if (timerLanjut.current !== null) window.clearTimeout(timerLanjut.current);
    };
  }, []);

  const ayatBerikutnya = useCallback(() => {
    if (totalAyat <= 1) return;
    gantiKe((aman + 1) % totalAyat);
  }, [aman, totalAyat, gantiKe]);

  const ayatSebelumnya = useCallback(() => {
    if (totalAyat <= 1) return;
    gantiKe((aman - 1 + totalAyat) % totalAyat);
  }, [aman, totalAyat, gantiKe]);

  // Autoplay Murottal setiap kali ayat aktif / bagian rentang berganti.
  // Ditahan (tidak berbunyi) selama tahanMurottal, mis. saat adzan.
  useEffect(() => {
    if (!tampilkanMurottal || !autoplayMurottal || !urlAudio || tahanMurottal) return;

    const audio = audioRef.current;
    if (!audio) return;

    let isMounted = true;

    // Hentikan pemutaran sebelumnya, reset posisi
    audio.pause();
    audio.currentTime = 0;

    const jedaMulai = window.setTimeout(() => {
      if (!isMounted) return;
      // play() mengembalikan Promise — tangkap semua rejection agar tidak naik ke window
      const janji = audio.play();
      if (janji !== undefined) {
        janji.then(() => {
          if (isMounted) {
            setSedangPutar(true);
            setAudioDiblokirPeramban(false);
          }
        }).catch((err: unknown) => {
          if (!isMounted) return;
          // AbortError terjadi saat audio.pause() dipanggil sebelum play() selesai — bukan error nyata
          const namaError = err instanceof Error ? err.name : "";
          if (namaError === "AbortError") return;
          setSedangPutar(false);
          setAudioDiblokirPeramban(true);
        });
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(jedaMulai);
    };
  }, [aman, bagian, autoplayMurottal, tampilkanMurottal, tahanMurottal, urlAudio]);

  // Tahan-lepas eksternal (adzan): jeda audio dan lanjutkan otomatis dari
  // posisi yang sama begitu tahan dibuka. Adab: diam mendengarkan adzan.
  const lanjutSetelahTahan = useRef(false);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (tahanMurottal) {
      if (!audio.paused) {
        audio.pause();
        lanjutSetelahTahan.current = true;
      }
    } else if (lanjutSetelahTahan.current) {
      lanjutSetelahTahan.current = false;
      if (autoplayMurottal && urlAudio) {
        void audio.play().then(() => setSedangPutar(true)).catch(() => undefined);
      }
    }
  }, [tahanMurottal, autoplayMurottal, urlAudio]);

  // Buka blokir autoplay begitu ada sentuhan atau klik sembarang di layar
  useEffect(() => {
    const bukaBlokir = () => {
      setAudioDiblokirPeramban(false);
      const audio = audioRef.current;
      if (audio && autoplayMurottal && audio.paused) {
        void audio.play().then(() => setSedangPutar(true)).catch(() => undefined);
      }
    };

    window.addEventListener("pointerdown", bukaBlokir, { once: true });
    window.addEventListener("keydown", bukaBlokir, { once: true });
    return () => {
      window.removeEventListener("pointerdown", bukaBlokir);
      window.removeEventListener("keydown", bukaBlokir);
    };
  }, [autoplayMurottal]);

  // Siklus hitung maju / progress bar (hanya berjalan saat murottal tidak
  // sedang melantun, bukan mode surah, dan tidak ditahan adzan)
  const dijeda = dijedaUser || isHovered || sedangPutar || tahanMurottal;

  useEffect(() => {
    if (totalAyat <= 1 || dijeda || surahAktif) return;

    const intervalStep = 100;
    const pertambahan = (intervalStep / jedaMs) * 100;

    timerMaju.current = setInterval(() => {
      setKemajuan((prev) => {
        if (prev >= 100) {
          ayatBerikutnya();
          return 0;
        }
        return Math.min(100, prev + pertambahan);
      });
    }, intervalStep);

    return () => {
      if (timerMaju.current) clearInterval(timerMaju.current);
    };
  }, [totalAyat, jedaMs, dijeda, surahAktif, ayatBerikutnya]);

  if (totalAyat === 0 || !ayatAktif) return null;

  // Teks yang tampil: mode surah memakai ayat ke-`bagian` dari surah penuh,
  // mode kurasi memakai kutipan aktif. Gagal muat surah → jatuh ke kurasi.
  const ayatSurahAktif = surahAktif && teksSurah ? teksSurah[Math.min(bagian, teksSurah.length - 1)] : undefined;
  const tampilAr = ayatSurahAktif?.ar ?? ayatAktif.ar;
  const tampilIdn = ayatSurahAktif?.idn || ayatAktif.idn;
  const tampilSurahArab = surahAktif?.arab ?? ayatAktif.surahArab;
  const tampilRujukan = surahAktif
    ? `${surahAktif.nama} : ${bagian + 1}`
    : rujukanAyat(ayatAktif);

  // Deteksi ayat yang relatif panjang untuk kalibrasi clamp yang seimbang
  const ayatPanjang = tampilAr.length > 130;

  return (
    <div
      className="group relative flex h-full min-h-0 flex-col justify-between rounded-2xl bg-transparent p-2 sm:p-4 lg:p-6 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Indikator Progress Garis Tipis di Paling Atas */}
      <div className="absolute inset-x-2 top-0 h-1 overflow-hidden rounded-full bg-forest-900/10 sm:inset-x-4">
        <div
          className={`h-full bg-gradient-to-r from-forest-600 via-forest-500 to-brass transition-[width] ease-linear ${
            dijeda ? "opacity-45" : "opacity-100"
          }`}
          style={{
            width: sedangPutar ? "100%" : totalAyat > 1 ? `${kemajuan}%` : "100%",
            transitionDuration: dijeda ? "300ms" : "100ms",
          }}
        />
      </div>

      {/* Header Ayat: Label, Status Murottal, dan Tombol Kontrol */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 pt-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 rounded-full bg-brass shadow-sm" />
          <span className="label-kecil font-bold tracking-wider text-forest-900">
            {surahAktif ? `Surah ${surahAktif.nama}` : "Ayat Pilihan"}
          </span>
          {surah && !surahAktif && galatSurah && (
            <span className="rounded-full border border-red-300/60 bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold text-red-700">
              Teks surah gagal dimuat — menampilkan ayat pilihan
            </span>
          )}
          {/* Mode ringkas (fullscreen TV): badge status disembunyikan. */}
          {!ringkas && sedangPutar && (
            <span className="flex items-center gap-1.5 rounded-full border border-forest-600/30 bg-forest-100/90 px-2.5 py-0.5 text-[11px] font-semibold text-forest-800 backdrop-blur-sm">
              <span className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-forest-700 animate-pulse" />
                <span className="w-0.5 h-3 bg-forest-700 animate-pulse delay-75" />
                <span className="w-0.5 h-1.5 bg-forest-700 animate-pulse delay-150" />
              </span>
              <span>Murottal Berputar{totalBagian > 1 ? ` ${bagian + 1}/${totalBagian}` : ""}</span>
            </span>
          )}
          {audioDiblokirPeramban && (
            <span className="rounded-full border border-brass-600/40 bg-brass/15 px-2.5 py-0.5 text-[10px] font-semibold text-brass-700">
              Sentuh layar untuk aktifkan suara
            </span>
          )}
        </div>

        {/* Mode ringkas (fullscreen TV): tombol autoplay & jeda disembunyikan. */}
        {!ringkas && (
        <div className="flex items-center gap-2">
          {/* Tombol Toggle Autoplay Murottal */}
          {tampilkanMurottal && urlAudio && (
            <button
              type="button"
              onClick={() => {
                const baru = !autoplayMurottal;
                setAutoplayMurottal(baru);
                const audio = audioRef.current;
                if (!audio) return;
                if (baru && audio.paused) {
                  void audio.play().then(() => setSedangPutar(true)).catch(() => undefined);
                } else if (!baru && !audio.paused) {
                  audio.pause();
                  setSedangPutar(false);
                }
              }}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition ${
                autoplayMurottal
                  ? "border-forest-600 bg-forest-700 text-white shadow-sm"
                  : "border-forest-900/15 bg-white/70 text-forest-900 hover:bg-white"
              }`}
              title={
                autoplayMurottal
                  ? "Autoplay murottal aktif"
                  : "Aktifkan autoplay murottal"
              }
            >
              <IkonSuara className="h-3.5 w-3.5" />
              <span>{autoplayMurottal ? "Autoplay On" : "Murottal"}</span>
            </button>
          )}

          {/* Tombol Pause/Play Otomatis */}
          {totalAyat > 1 && (
            <button
              type="button"
              onClick={() => setDijedaUser(!dijedaUser)}
              className="rounded-full border border-forest-900/15 bg-white/70 p-1.5 text-forest-800 backdrop-blur-sm transition hover:bg-white hover:text-forest-950"
              title={dijedaUser ? "Lanjutkan pergantian ayat" : "Jeda pergantian ayat"}
              aria-label={dijedaUser ? "Lanjutkan pergantian ayat" : "Jeda pergantian ayat"}
            >
              {dijedaUser ? (
                <IkonPutar className="h-3.5 w-3.5" />
              ) : (
                <IkonJeda className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
        )}
      </div>

      {/* Konten Ayat Utama (Transparan menyatu dengan latar belakang) */}
      <div className={`my-auto min-h-0 ${ringkas ? "py-2" : "py-5 lg:py-7"}`}>
        <div
          className={`transition-all duration-300 ease-out ${
            animasiMasuk
              ? "translate-y-0 opacity-100"
              : "-translate-y-2 opacity-0"
          }`}
        >
          {/* Teks Arab Kaligrafi Utsmani — Amiri Quran hanya 400, jadi jangan
              faux-bold agar goresan kaligrafi tetap ramping autentik. */}
          {memuatTeks ? (
            <div className="animate-pulse py-8" aria-live="polite">
              <p dir="rtl" lang="ar" className="font-uthmani text-right text-[clamp(1.5rem,3vw,2.5rem)] text-forest-900/60">
                {surah?.arab}
              </p>
              <p className="mt-4 text-sm font-semibold text-forest-700">
                Memuat Surah {surah?.nama} ({surah?.ayat} ayat)…
              </p>
            </div>
          ) : (
          <>
          <p
            dir="rtl"
            lang="ar"
            className={`font-uthmani text-right font-normal text-forest-900 select-none ${
              ringkas
                ? ayatPanjang
                  ? "text-[clamp(1.2rem,2.2vw,1.9rem)] leading-[2.0]"
                  : "text-[clamp(1.45rem,2.8vw,2.6rem)] leading-[2.0]"
                : ayatPanjang
                ? "text-[clamp(1.5rem,3.0vw,2.6rem)] leading-[2.3]"
                : "text-[clamp(1.85rem,4.0vw,3.6rem)] leading-[2.2]"
            }`}
            style={{
              textShadow: "0 1px 12px rgba(10,103,66,0.13), 0 0px 2px rgba(217,164,65,0.18)",
              filter: "drop-shadow(0 1px 3px rgba(10,103,66,0.10))",
            }}
          >
            {tampilAr}
          </p>

          {/* Rujukan Surah dan Ayat */}
          <div className={`flex items-center gap-3 ${ringkas ? "my-2.5" : "my-5"}`}>
            <span className="h-px w-8 shrink-0 rounded-full bg-gradient-to-r from-brass/80 to-brass/20" />
            <span className="flex items-center gap-1.5">
              <span className="font-arabic text-base font-bold text-brass-600">
                {tampilSurahArab}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">·</span>
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700 sm:text-sm">
                QS. {tampilRujukan}
              </span>
              {surahAktif && (
                <span className="rounded-full border border-forest-600/30 bg-forest-100/90 px-2 py-0.5 text-[10px] font-bold tabular-nums text-forest-800">
                  Ayat {bagian + 1}/{totalBagian}
                </span>
              )}
            </span>
            <span className="h-px flex-1 rounded-full bg-gradient-to-r from-forest-900/15 to-transparent" />
          </div>

          {/* Terjemahan Bahasa Indonesia — Inter, disengaja tidak mengikuti
              font UI agar tidak berubah. Di mode ringkas dibatasi 3 baris
              agar tidak meluber ke kartu jadwal di bawahnya. */}
          <p className={`font-inter font-normal leading-relaxed text-ink-500 lg:max-w-[65ch] ${
            ringkas ? "text-xs sm:text-sm line-clamp-3" : "text-sm sm:text-base"
          }`}>
            &ldquo;{tampilIdn}&rdquo;
          </p>
          </>
          )}
        </div>
      </div>

      {/* Audio Elemen Tersembunyi */}
      {tampilkanMurottal && urlAudio && (
        <audio
          ref={audioRef}
          src={urlAudio}
          preload="auto"
          onPlay={() => setSedangPutar(true)}
          onPause={() => setSedangPutar(false)}
          onEnded={() => {
            // Mode surah: bila opsi lanjut aktif, minta surah berikutnya
            // (induk mengganti surah → ayat dimulai dari awal lagi);
            // bila tidak, mengulang surah yang sama dari ayat pertama.
            if (surahAktif) {
              if (lanjutKeSurahBerikut && onSurahBerikutnya) {
                setSedangPutar(false);
                onSurahBerikutnya();
                return;
              }
              if (totalBagian > 0) setBagian(0);
              return;
            }
            // Rentang multi-ayat: lanjut ke ayat berikutnya dalam kutipan
            // yang sama; bila sudah ayat terakhir, jeda 1.5 detik lalu
            // pindah ke kutipan berikutnya.
            if (bagian + 1 < totalBagian) {
              setBagian(bagian + 1);
              return;
            }
            setSedangPutar(false);
            if (timerLanjut.current !== null) window.clearTimeout(timerLanjut.current);
            timerLanjut.current = window.setTimeout(() => {
              ayatBerikutnya();
            }, 1500);
          }}
          onError={() => {
            // Satu berkas gagal (network/404): coba ayat berikutnya dalam
            // rentang yang sama agar tidak macet di ayat pertama.
            if (bagian + 1 < totalBagian) {
              setBagian(bagian + 1);
              return;
            }
            // Gagal muat berkas audio (network/CORS) — tandai sebagai tidak dapat diputar
            setSedangPutar(false);
            setAudioDiblokirPeramban(false);
          }}
        />
      )}

      {/* Footer Navigasi Ayat — disembunyikan di mode ringkas (fullscreen
          TV) dan mode surah (navigasi otomatis ayat per ayat). */}
      {!ringkas && !surahAktif && totalAyat > 1 && (
        <div className="flex items-center justify-between border-t border-forest-900/10 pt-3.5">
          {/* Titik Indikator / Paginasi */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-[220px] sm:max-w-none">
            {ayat.map((item, urutan) => {
              const aktif = urutan === aman;
              return (
                <button
                  key={`${item.surah}-${item.nomor}`}
                  type="button"
                  onClick={() => gantiKe(urutan)}
                  aria-label={`Lihat QS. ${rujukanAyat(item)}`}
                  aria-current={aktif}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    aktif
                      ? "w-7 bg-forest-700 shadow-sm"
                      : "w-2 bg-forest-900/20 hover:bg-forest-900/40"
                  }`}
                />
              );
            })}
          </div>

          {/* Tombol Sebelumnya & Selanjutnya */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={ayatSebelumnya}
              className="rounded-lg border border-forest-900/15 bg-white/70 p-1.5 text-forest-800 backdrop-blur-sm transition hover:bg-white hover:text-forest-950"
              aria-label="Ayat sebelumnya"
              title="Ayat sebelumnya"
            >
              <IkonPanahKiri className="h-4 w-4" />
            </button>
            <span className="px-1 text-xs font-bold tabular-nums text-forest-800">
              {aman + 1} / {totalAyat}
            </span>
            <button
              type="button"
              onClick={ayatBerikutnya}
              className="rounded-lg border border-forest-900/15 bg-white/70 p-1.5 text-forest-800 backdrop-blur-sm transition hover:bg-white hover:text-forest-950"
              aria-label="Ayat berikutnya"
              title="Ayat berikutnya"
            >
              <IkonPanahKanan className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
