"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BerkasUnggah from "@/components/admin/BerkasUnggah";
import { KepalaAdmin, KartuAdmin } from "@/components/admin/AdminShell";
import { IkonJam, IkonLokasi, IkonSuara } from "@/components/Ikon";
import {
  cariKota,
  kotaPerProvinsi,
  LABEL_ZONA,
  type Kota,
} from "@/lib/kota";
import {
  ID_ADZAN_KUSTOM,
  namaPilihanAdzan,
  PILIHAN_ADZAN,
  PILIHAN_ADZAN_KUSTOM,
  resolveAdzanUrl,
} from "@/lib/azan";
import {
  cariPilihanMurottal,
  namaPilihanMurottal,
  PILIHAN_MUROTTAL,
} from "@/lib/murottal";
import { cariSurah, DAFTAR_SURAH } from "@/lib/surah";
import type { PrayerTimes } from "@/lib/waktu";

interface BarisPengaturan {
  key: string;
  value: string;
  bawaan: string;
  tersimpan: boolean;
}

interface JadwalPratinjau {
  lokasi: string;
  provinsi: string | null;
  zona: string;
  tanggal: string;
  hijriah: string | null;
  sumber: string;
  dariCache?: boolean;
}

const KUNCI_LABEL: Record<string, { judul: string; petunjuk: string }> = {
  lokasi_default: {
    judul: "Lokasi jadwal shalat",
    petunjuk:
      "Koordinat kota terpilih dipakai untuk menghitung jadwal, dan zona waktunya (WIB/WITA/WIT) dipakai untuk jam papan informasi.",
  },
  sumber_jadwal: {
    judul: "Metode perhitungan",
    petunjuk:
      "Hisab lokal dihitung langsung di server (selalu tersedia, tanpa layanan luar). Aladhan memakai API metode Kemenag dan menambahkan ketergantungan jaringan.",
  },
  ihtiyati_menit: {
    judul: "Ihtiyati (kehati-hatian)",
    petunjuk:
      "Tambahan menit pada seluruh waktu, praktik umum jadwal Indonesia. Kemenag memakai 2 menit.",
  },
  hijriah_offset_hari: {
    judul: "Penyesuaian tanggal Hijriah",
    petunjuk:
      "Kalender Umm al-Qura sering berbeda satu hari dengan kalender Kemenag RI. Geser -2..+2 hari agar tanggal Hijriah di papan informasi cocok dengan kalender masjid setempat.",
  },
  iqomah_menit: {
    judul: "Jeda iqomah",
    petunjuk: "Lama hitung mundur iqomah setelah adzan, dipakai papan informasi.",
  },
  reminder_menit: {
    judul: "Pengingat sebelum adzan",
    petunjuk: "Berapa menit sebelum waktu shalat papan informasi menampilkan pengingat.",
  },
  running_text: {
    judul: "Teks berjalan",
    petunjuk: "Muncul di bagian bawah papan informasi.",
  },
};

export default function AdminPengaturanPage() {
  const router = useRouter();
  const [nilai, setNilai] = useState<Record<string, string>>({});
  const [tersimpan, setTersimpan] = useState<Record<string, boolean>>({});
  const [memuat, setMemuat] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesan, setPesan] = useState<{ jenis: "ok" | "galat"; teks: string } | null>(null);

  const [pratinjau, setPratinjau] = useState<PrayerTimes | null>(null);
  const [infoPratinjau, setInfoPratinjau] = useState<JadwalPratinjau | null>(null);
  const [memuatPratinjau, setMemuatPratinjau] = useState(false);
  const [galatPratinjau, setGalatPratinjau] = useState<string | null>(null);

  const muatPengaturan = useCallback(async () => {
    try {
      const res = await fetch("/api/pengaturan", { cache: "no-store" });
      if (!res.ok) {
        setPesan({ jenis: "galat", teks: "Gagal memuat pengaturan" });
        return;
      }
      const daftar = (await res.json()) as BarisPengaturan[];
      const peta: Record<string, string> = {};
      const tanda: Record<string, boolean> = {};
      for (const item of daftar) {
        peta[item.key] = item.value;
        tanda[item.key] = item.tersimpan;
      }
      setNilai(peta);
      setTersimpan(tanda);
    } catch {
      setPesan({ jenis: "galat", teks: "Tidak dapat menghubungi server" });
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    void muatPengaturan();
  }, [muatPengaturan]);

  const lokasiTerpilih = useMemo(
    () => cariKota(nilai.lokasi_default) ?? null,
    [nilai.lokasi_default]
  );

  const kelompokKota = useMemo(() => kotaPerProvinsi(), []);

  const ubah = (kunci: string, v: string) =>
    setNilai((sebelumnya) => ({ ...sebelumnya, [kunci]: v }));

  const ambilPratinjau = useCallback(async () => {
    if (!nilai.lokasi_default) return;
    setMemuatPratinjau(true);
    setGalatPratinjau(null);
    try {
      const res = await fetch(
        `/api/jadwal?lokasi=${encodeURIComponent(nilai.lokasi_default)}`,
        { cache: "no-store" }
      );
      const data = (await res.json().catch(() => ({}))) as Partial<PrayerTimes> &
        Partial<JadwalPratinjau> & { error?: string };

      if (!res.ok) {
        setGalatPratinjau(data.error ?? "Gagal memuat pratinjau jadwal");
        setPratinjau(null);
        return;
      }

      setPratinjau({
        imsak: data.imsak ?? "--:--",
        subuh: data.subuh ?? "--:--",
        terbit: data.terbit ?? "--:--",
        dhuha: data.dhuha ?? "--:--",
        zuhur: data.zuhur ?? "--:--",
        ashar: data.ashar ?? "--:--",
        maghrib: data.maghrib ?? "--:--",
        isya: data.isya ?? "--:--",
      });
      setInfoPratinjau({
        lokasi: data.lokasi ?? nilai.lokasi_default,
        provinsi: data.provinsi ?? null,
        zona: data.zona ?? "Asia/Jakarta",
        tanggal: data.tanggal ?? "",
        hijriah: data.hijriah ?? null,
        sumber: data.sumber ?? "hisab",
        dariCache: data.dariCache,
      });
    } catch {
      setGalatPratinjau("Tidak dapat menghubungi server");
    } finally {
      setMemuatPratinjau(false);
    }
  }, [nilai.lokasi_default]);

  useEffect(() => {
    if (!memuat && nilai.lokasi_default) void ambilPratinjau();
  }, [memuat, nilai.lokasi_default, ambilPratinjau]);

  async function simpan() {
    setMenyimpan(true);
    setPesan(null);
    try {
      const muatan = Object.entries(nilai).map(([key, value]) => ({ key, value }));
      const res = await fetch("/api/pengaturan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(muatan),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        detail?: { field: string; message: string }[];
        jadwalDihitungUlang?: boolean;
      };

      if (!res.ok) {
        const rincian = data.detail?.map((d) => `${d.field}: ${d.message}`).join("; ");
        setPesan({
          jenis: "galat",
          teks: rincian ? `${data.error} — ${rincian}` : (data.error ?? "Gagal menyimpan pengaturan"),
        });
        return;
      }

      setPesan({
        jenis: "ok",
        teks: data.jadwalDihitungUlang
          ? "Pengaturan tersimpan dan jadwal hari ini dihitung ulang."
          : "Pengaturan tersimpan.",
      });
      await muatPengaturan();
      await ambilPratinjau();
      router.refresh();
    } catch {
      setPesan({ jenis: "galat", teks: "Tidak dapat menghubungi server" });
    } finally {
      setMenyimpan(false);
    }
  }

  const urlAdzanAktif = resolveAdzanUrl(nilai.adzan_pilihan, nilai.adzan_audio_url);
  const labelAdzan = namaPilihanAdzan(nilai.adzan_pilihan, nilai.adzan_audio_url);

  const murottalTerpilih =
    cariPilihanMurottal(nilai.murottal_reciter) ?? PILIHAN_MUROTTAL[0]!;
  const urlContohMurottal = `https://everyayah.com/data/${murottalTerpilih.subdir}/001001.mp3`;

  const modeAyat = nilai.mode_ayat === "surah" ? "surah" : "pilihan";
  const surahTerpilih =
    cariSurah(Number(nilai.surah_nomor)) ?? DAFTAR_SURAH[111]!;

  if (memuat) {
    return <p className="text-sm text-ink-400">Memuat pengaturan...</p>;
  }

  return (
    <div>
      <KepalaAdmin
        kicker="Konfigurasi"
        judul="Pengaturan"
        keterangan="Semua pengaturan di bawah ini ikut menentukan tampilan papan informasi. Perubahan yang memengaruhi jadwal langsung dihitung ulang saat disimpan."
      />

      {pesan && (
        <div
          role="status"
          className={`mt-6 rounded-lg border px-4 py-3 text-sm ${
            pesan.jenis === "ok"
              ? "border-forest-500/40 bg-forest-50 text-forest-800"
              : "border-red-300/60 bg-red-50 text-red-700"
          }`}
        >
          {pesan.teks}
        </div>
      )}

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-8">
          {/* Lokasi & metode */}
          <KartuAdmin className="p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <IkonLokasi className="h-5 w-5 text-forest-600" />
              <h2 className="section-title">{KUNCI_LABEL.lokasi_default.judul}</h2>
            </div>
            <div className="rule mt-4" />

            <div className="mt-6 grid gap-6">
              <div>
                <label htmlFor="lokasi" className="field-label">
                  Kota / kabupaten
                </label>
                <select
                  id="lokasi"
                  className="field"
                  value={nilai.lokasi_default ?? ""}
                  onChange={(e) => ubah("lokasi_default", e.target.value)}
                >
                  {kelompokKota.map((kelompok) => (
                    <optgroup key={kelompok.provinsi} label={kelompok.provinsi}>
                      {kelompok.kota.map((kota: Kota) => (
                        <option key={kota.nama} value={kota.nama}>
                          {kota.nama}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className="meta mt-2">{KUNCI_LABEL.lokasi_default.petunjuk}</p>

                {lokasiTerpilih && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-ink-500">
                    <span>
                      Provinsi: <strong className="font-medium">{lokasiTerpilih.provinsi}</strong>
                    </span>
                    <span>
                      Koordinat:{" "}
                      <strong className="font-medium tabular-nums">
                        {lokasiTerpilih.lat.toFixed(4)}, {lokasiTerpilih.lon.toFixed(4)}
                      </strong>
                    </span>
                    <span className="chip">{LABEL_ZONA[lokasiTerpilih.zona]}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="field-label">Metode perhitungan</span>
                <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      id: "hisab",
                      judul: "Hisab lokal (disarankan)",
                      ket: "Dihitung di server, selalu tersedia",
                    },
                    {
                      id: "aladhan",
                      judul: "API Aladhan",
                      ket: "Metode Kemenag, perlu jaringan",
                    },
                  ].map((pilihan) => {
                    const aktif = (nilai.sumber_jadwal ?? "hisab") === pilihan.id;
                    return (
                      <button
                        key={pilihan.id}
                        type="button"
                        onClick={() => ubah("sumber_jadwal", pilihan.id)}
                        aria-pressed={aktif}
                        className={`rounded-xl border px-4 py-3 text-left transition ${
                          aktif
                            ? "border-forest-600/50 bg-forest-50"
                            : "border-forest-900/12 hover:border-forest-700/30"
                        }`}
                      >
                        <span className="block text-sm font-medium text-forest-900">
                          {pilihan.judul}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-400">{pilihan.ket}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="meta mt-2">{KUNCI_LABEL.sumber_jadwal.petunjuk}</p>
              </div>

              <div className="max-w-xs">
                <label htmlFor="ihtiyati" className="field-label">
                  {KUNCI_LABEL.ihtiyati_menit.judul} (menit)
                </label>
                <input
                  id="ihtiyati"
                  type="number"
                  min={0}
                  max={5}
                  className="field"
                  value={nilai.ihtiyati_menit ?? "2"}
                  onChange={(e) => ubah("ihtiyati_menit", e.target.value)}
                />
                <p className="meta mt-2">{KUNCI_LABEL.ihtiyati_menit.petunjuk}</p>
              </div>

              <div className="max-w-xs">
                <label htmlFor="hijriah" className="field-label">
                  {KUNCI_LABEL.hijriah_offset_hari.judul} (hari)
                </label>
                <input
                  id="hijriah"
                  type="number"
                  min={-2}
                  max={2}
                  className="field"
                  value={nilai.hijriah_offset_hari ?? "0"}
                  onChange={(e) => ubah("hijriah_offset_hari", e.target.value)}
                />
                <p className="meta mt-2">{KUNCI_LABEL.hijriah_offset_hari.petunjuk}</p>
              </div>
            </div>
          </KartuAdmin>

          {/* Suara adzan */}
          <KartuAdmin className="p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <IkonSuara className="h-5 w-5 text-forest-600" />
              <h2 className="section-title">Suara adzan</h2>
            </div>
            <div className="rule mt-4" />

            <div className="mt-6 space-y-6">
              <Saklar
                label="Aktifkan adzan otomatis"
                petunjuk="Adzan diputar sekali setiap masuk waktu shalat. Peramban kiosk yang memblokir autoplay tetap bisa memakai tombol putar manual."
                aktif={nilai.adzan_enabled === "true"}
                onUbah={(v) => ubah("adzan_enabled", String(v))}
              />

              <div>
                <label htmlFor="adzan-pilihan" className="field-label">
                  Pilihan suara
                </label>
                <select
                  id="adzan-pilihan"
                  className="field"
                  value={nilai.adzan_pilihan ?? PILIHAN_ADZAN[0]!.id}
                  onChange={(e) => ubah("adzan_pilihan", e.target.value)}
                >
                  {PILIHAN_ADZAN.map((pilihan) => (
                    <option key={pilihan.id} value={pilihan.id}>
                      {pilihan.nama}
                    </option>
                  ))}
                  <option value={PILIHAN_ADZAN_KUSTOM.id}>
                    {PILIHAN_ADZAN_KUSTOM.nama}
                  </option>
                </select>
                <p className="meta mt-2">
                  Suara aktif: <strong className="font-medium">{labelAdzan}</strong>
                  {urlAdzanAktif.startsWith("http") && (
                    <>
                      {" · "}
                      <a
                        href={urlAdzanAktif}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="link-hairline"
                      >
                        dengarkan di tab baru
                      </a>
                    </>
                  )}
                </p>
              </div>

              {urlAdzanAktif && (
                <div>
                  <span className="field-label">Pratinjau</span>
                  <audio
                    src={urlAdzanAktif}
                    controls
                    preload="none"
                    className="w-full max-w-md"
                  />
                </div>
              )}

              <div className="border-t border-forest-900/10 pt-6">
                <BerkasUnggah
                  folder="adzan"
                  jenis="audio"
                  label="Unggah suara adzan sendiri"
                  value={
                    (nilai.adzan_audio_url ?? "").startsWith("/api/media/azan/")
                      ? nilai.adzan_audio_url!
                      : null
                  }
                  onChange={(url) => {
                    // Berkas unggahan selalu dipilih sebagai sumber, jadi
                    // pilihannya dipindah ke "kustom".
                    ubah("adzan_pilihan", ID_ADZAN_KUSTOM);
                    ubah("adzan_audio_url", url ?? "");
                  }}
                  petunjuk="MP3/OGG/WAV/M4A maksimal 15 MB. Mengunggah berkas otomatis memindahkan pilihan suara ke mode kustom."
                />
              </div>

              <div>
                <label htmlFor="adzan-url" className="field-label">
                  Atau tempel tautan https
                </label>
                <input
                  id="adzan-url"
                  type="url"
                  className="field"
                  placeholder="https://contoh.id/adzan.mp3"
                  value={
                    (nilai.adzan_audio_url ?? "").startsWith("http")
                      ? nilai.adzan_audio_url!
                      : ""
                  }
                  onChange={(e) => {
                    const url = e.target.value;
                    ubah("adzan_audio_url", url);
                    if (url.trim() !== "") ubah("adzan_pilihan", ID_ADZAN_KUSTOM);
                  }}
                />
                <p className="meta mt-2">
                  Hanya tautan https yang diterima. Tautan kustom selalu menang atas
                  pilihan bawaan.
                </p>
              </div>
            </div>
          </KartuAdmin>

          {/* Suara murottal (reciter) */}
          <KartuAdmin className="p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <IkonSuara className="h-5 w-5 text-forest-600" />
              <h2 className="section-title">Suara murottal</h2>
            </div>
            <div className="rule mt-4" />

            <div className="mt-6 space-y-6">
              <div>
                <label htmlFor="murottal-reciter" className="field-label">
                  Reciter (pengisi suara bacaan ayat)
                </label>
                <select
                  id="murottal-reciter"
                  className="field"
                  value={murottalTerpilih.id}
                  onChange={(e) => ubah("murottal_reciter", e.target.value)}
                >
                  {PILIHAN_MUROTTAL.map((pilihan) => (
                    <option key={pilihan.id} value={pilihan.id}>
                      {pilihan.nama} — {pilihan.keterangan}
                    </option>
                  ))}
                </select>
                <p className="meta mt-2">
                  Suara aktif:{" "}
                  <strong className="font-medium">
                    {namaPilihanMurottal(nilai.murottal_reciter)}
                  </strong>
                  . Berlaku untuk seluruh ayat di papan informasi beranda
                  setelah pengaturan disimpan.
                </p>
              </div>

              <div>
                <span className="field-label">
                  Pratinjau — Al-Fatihah : 1 ({murottalTerpilih.nama})
                </span>
                <audio
                  key={murottalTerpilih.subdir}
                  src={urlContohMurottal}
                  controls
                  preload="none"
                  className="w-full max-w-md"
                />
                <p className="meta mt-2">
                  Tekan putar untuk memastikan suara reciter dapat dimuat
                  sebelum disimpan.
                </p>
              </div>
            </div>
          </KartuAdmin>

          {/* Mode tampilan ayat */}
          <KartuAdmin className="p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <IkonJam className="h-5 w-5 text-forest-600" />
              <h2 className="section-title">Mode tampilan ayat</h2>
            </div>
            <div className="rule mt-4" />

            <div className="mt-6 space-y-6">
              <div>
                <span className="field-label">Sumber bacaan di beranda</span>
                <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      id: "pilihan",
                      judul: "Ayat pilihan",
                      ket: "Kurasi ayat pendek bermakna kuat, berganti otomatis",
                    },
                    {
                      id: "surah",
                      judul: "Surah penuh",
                      ket: "Satu surah dibaca ayat per ayat sampai tuntas, lalu mengulang",
                    },
                  ].map((pilihan) => {
                    const aktif = modeAyat === pilihan.id;
                    return (
                      <button
                        key={pilihan.id}
                        type="button"
                        onClick={() => ubah("mode_ayat", pilihan.id)}
                        aria-pressed={aktif}
                        className={`rounded-xl border px-4 py-3 text-left transition ${
                          aktif
                            ? "border-forest-600/50 bg-forest-50"
                            : "border-forest-900/12 hover:border-forest-700/30"
                        }`}
                      >
                        <span className="block text-sm font-medium text-forest-900">
                          {pilihan.judul}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-400">{pilihan.ket}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {modeAyat === "surah" && (
                <div>
                  <label htmlFor="surah-nomor" className="field-label">
                    Surah yang ditampilkan
                  </label>
                  <select
                    id="surah-nomor"
                    className="field"
                    value={String(surahTerpilih.nomor)}
                    onChange={(e) => ubah("surah_nomor", e.target.value)}
                  >
                    {DAFTAR_SURAH.map((surah) => (
                      <option key={surah.nomor} value={surah.nomor}>
                        {surah.nomor}. {surah.nama} ({surah.ayat} ayat)
                      </option>
                    ))}
                  </select>
                  <p className="meta mt-2">
                    Aktif:{" "}
                    <strong className="font-medium">
                      QS. {surahTerpilih.nama} ({surahTerpilih.arab}) —{" "}
                      {surahTerpilih.arti}, {surahTerpilih.ayat} ayat,{" "}
                      {surahTerpilih.tempat}
                    </strong>
                    . Berlaku di papan informasi beranda setelah disimpan.
                  </p>
                </div>
              )}

              {modeAyat === "surah" && (
                <div>
                  <span className="field-label">Setelah satu surah tuntas</span>
                  <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        id: "ulang",
                        judul: "Ulangi surah ini",
                        ket: "Dibaca berulang dari ayat pertama",
                      },
                      {
                        id: "lanjut",
                        judul: "Lanjut surah berikutnya",
                        ket: "Maju berurutan 1→114→1 hingga khatam",
                      },
                    ].map((pilihan) => {
                      const aktif = (nilai.surah_lanjut ?? "ulang") === pilihan.id;
                      return (
                        <button
                          key={pilihan.id}
                          type="button"
                          onClick={() => ubah("surah_lanjut", pilihan.id)}
                          aria-pressed={aktif}
                          className={`rounded-xl border px-4 py-3 text-left transition ${
                            aktif
                              ? "border-forest-600/50 bg-forest-50"
                              : "border-forest-900/12 hover:border-forest-700/30"
                          }`}
                        >
                          <span className="block text-sm font-medium text-forest-900">
                            {pilihan.judul}
                          </span>
                          <span className="mt-0.5 block text-xs text-ink-400">{pilihan.ket}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </KartuAdmin>

          {/* Jadwal murottal */}
          <KartuAdmin className="p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <IkonJam className="h-5 w-5 text-forest-600" />
              <h2 className="section-title">Jadwal murottal</h2>
            </div>
            <div className="rule mt-4" />

            <div className="mt-6 space-y-6">
              <div className="max-w-xs">
                <label htmlFor="murottal-jeda" className="field-label">
                  Jeda setelah adzan (menit)
                </label>
                <input
                  id="murottal-jeda"
                  type="number"
                  min={0}
                  max={120}
                  className="field"
                  value={nilai.murottal_jeda_menit ?? "30"}
                  onChange={(e) => ubah("murottal_jeda_menit", e.target.value)}
                />
                <p className="meta mt-2">
                  Murottal berhenti saat adzan lalu lanjut otomatis setelah
                  jeda ini. Isi 0 untuk lanjut segera setelah adzan selesai.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="murottal-mulai" className="field-label">
                    Tayang mulai pukul
                  </label>
                  <input
                    id="murottal-mulai"
                    type="time"
                    className="field"
                    value={nilai.murottal_mulai ?? ""}
                    onChange={(e) => ubah("murottal_mulai", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="murottal-selesai" className="field-label">
                    Tayang sampai pukul
                  </label>
                  <input
                    id="murottal-selesai"
                    type="time"
                    className="field"
                    value={nilai.murottal_selesai ?? ""}
                    onChange={(e) => ubah("murottal_selesai", e.target.value)}
                  />
                </div>
              </div>
              <p className="meta -mt-3">
                Jendela jam tayang harian mengikuti zona waktu lokasi jadwal.
                Kosongkan keduanya untuk tayang seharian; rentang lewat tengah
                malam (mis. 20:00–04:00) didukung. Di luar jendela, teks ayat
                tetap berputar tanpa suara.
              </p>
            </div>
          </KartuAdmin>

          {/* Papan informasi */}
          <KartuAdmin className="p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <IkonJam className="h-5 w-5 text-forest-600" />
              <h2 className="section-title">Papan informasi</h2>
            </div>
            <div className="rule mt-4" />

            <div className="mt-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="iqomah" className="field-label">
                    {KUNCI_LABEL.iqomah_menit.judul} (menit)
                  </label>
                  <input
                    id="iqomah"
                    type="number"
                    min={1}
                    max={30}
                    className="field"
                    value={nilai.iqomah_menit ?? "10"}
                    onChange={(e) => ubah("iqomah_menit", e.target.value)}
                  />
                  <p className="meta mt-2">{KUNCI_LABEL.iqomah_menit.petunjuk}</p>
                </div>
                <div>
                  <label htmlFor="reminder" className="field-label">
                    {KUNCI_LABEL.reminder_menit.judul} (menit)
                  </label>
                  <input
                    id="reminder"
                    type="number"
                    min={1}
                    max={30}
                    className="field"
                    value={nilai.reminder_menit ?? "5"}
                    onChange={(e) => ubah("reminder_menit", e.target.value)}
                  />
                  <p className="meta mt-2">{KUNCI_LABEL.reminder_menit.petunjuk}</p>
                </div>
              </div>

              <Saklar
                label="Nada pengingat"
                petunjuk="Membunyikan nada lembut saat hitung mundur masuk rentang pengingat."
                aktif={nilai.reminder_suara === "true"}
                onUbah={(v) => ubah("reminder_suara", String(v))}
              />

              <Saklar
                label="Tampilkan pemutar murottal"
                petunjuk="Menambahkan tombol pemutar bacaan ayat (murattal) pada panel ayat di beranda."
                aktif={nilai.tampilkan_murottal === "true"}
                onUbah={(v) => ubah("tampilkan_murottal", String(v))}
              />

              <div>
                <label htmlFor="running" className="field-label">
                  {KUNCI_LABEL.running_text.judul}
                </label>
                <textarea
                  id="running"
                  className="field"
                  rows={3}
                  maxLength={500}
                  value={nilai.running_text ?? ""}
                  onChange={(e) => ubah("running_text", e.target.value)}
                />
                <p className="meta mt-2">
                  {KUNCI_LABEL.running_text.petunjuk} ({nilai.running_text?.length ?? 0}/500)
                </p>
              </div>
            </div>
          </KartuAdmin>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => void simpan()}
              disabled={menyimpan}
              className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {menyimpan ? "Menyimpan..." : "Simpan pengaturan"}
            </button>
            <button
              type="button"
              onClick={() => void muatPengaturan()}
              className="btn btn-outline"
            >
              Muat ulang nilai
            </button>
          </div>
        </div>

        {/* Pratinjau jadwal */}
        <div className="xl:sticky xl:top-6 xl:self-start">
          <KartuAdmin className="p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="section-title">Pratinjau jadwal</h2>
              <button
                type="button"
                onClick={() => void ambilPratinjau()}
                disabled={memuatPratinjau}
                className="text-sm text-forest-700 transition hover:text-forest-600 disabled:opacity-50"
              >
                {memuatPratinjau ? "Memuat..." : "Segarkan"}
              </button>
            </div>
            <div className="rule mt-4" />

            {galatPratinjau && (
              <p className="mt-4 text-sm text-red-700">{galatPratinjau}</p>
            )}

            {pratinjau && (
              <>
                <p className="mt-4 text-sm text-ink-500">
                  <strong className="font-medium text-forest-900">
                    {infoPratinjau?.lokasi}
                  </strong>
                  {infoPratinjau?.provinsi ? `, ${infoPratinjau.provinsi}` : ""}
                </p>
                <p className="meta mt-1">
                  {infoPratinjau?.tanggal} ·{" "}
                  {infoPratinjau?.zona ? LABEL_ZONA[infoPratinjau.zona as keyof typeof LABEL_ZONA] : ""}
                  {infoPratinjau?.hijriah ? ` · ${infoPratinjau.hijriah}` : ""}
                </p>

                <dl className="mt-5 divide-y divide-forest-900/10">
                  {(
                    [
                      ["Imsak", pratinjau.imsak],
                      ["Subuh", pratinjau.subuh],
                      ["Terbit", pratinjau.terbit],
                      ["Dhuha", pratinjau.dhuha],
                      ["Zuhur", pratinjau.zuhur],
                      ["Ashar", pratinjau.ashar],
                      ["Maghrib", pratinjau.maghrib],
                      ["Isya", pratinjau.isya],
                    ] as const
                  ).map(([nama, waktu]) => (
                    <div
                      key={nama}
                      className="flex items-baseline justify-between gap-4 py-2"
                    >
                      <dt className="text-sm text-ink-500">{nama}</dt>
                      <dd className="text-base font-semibold tabular-nums text-forest-900">
                        {waktu}
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="meta mt-4">
                  Sumber:{" "}
                  {infoPratinjau?.sumber === "manual"
                    ? "suntingan manual admin"
                    : infoPratinjau?.sumber === "aladhan"
                      ? "API Aladhan (metode Kemenag)"
                      : "hisab lokal"}
                  {infoPratinjau?.dariCache ? " · dari cache hari ini" : ""}
                </p>
              </>
            )}

            <p className="mt-5 border-t border-forest-900/10 pt-4 text-xs leading-relaxed text-ink-400">
              Pratinjau memakai lokasi yang <em>sedang dipilih</em> di formulir,
              tetapi metode dan ihtiyati mengikuti nilai yang sudah tersimpan.
              Simpan pengaturan untuk melihat pengaruhnya.
            </p>
          </KartuAdmin>

          <p className="mt-4 text-xs leading-relaxed text-ink-400">
            {Object.values(tersimpan).filter(Boolean).length} dari{" "}
            {Object.keys(tersimpan).length} pengaturan sudah pernah disimpan;
            sisanya masih memakai nilai bawaan dan akan tersimpan saat Anda
            menekan Simpan.
          </p>
        </div>
      </div>
    </div>
  );
}

function Saklar({
  label,
  petunjuk,
  aktif,
  onUbah,
}: {
  label: string;
  petunjuk?: string;
  aktif: boolean;
  onUbah: (nilai: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <p className="text-sm font-medium text-forest-900">{label}</p>
        {petunjuk && <p className="meta mt-1 max-w-prose">{petunjuk}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={aktif}
        aria-label={label}
        onClick={() => onUbah(!aktif)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
          aktif ? "bg-forest-600" : "bg-forest-900/20"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
            aktif ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
