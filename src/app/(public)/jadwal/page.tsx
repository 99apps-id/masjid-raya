import type { Metadata } from "next";
import { getPetaPengaturan, pengaturanAngka } from "@/lib/settings";
import { ambilProfil } from "@/lib/profil";
import { LABEL_ZONA } from "@/lib/kota";
import {
  getJadwalHarian,
  hijriahLokal,
  keMenit,
  kunciTanggal,
  menitHari,
  SHALAT_WAJIB,
  URUTAN_SHALAT,
} from "@/lib/prayer-times";
import { tanggalPanjang } from "@/lib/format";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await ambilProfil();
  return {
    title: "Jadwal Shalat",
    description: `Jadwal shalat terkini ${branding.nama} sesuai metode Kementerian Agama RI, lengkap dengan imsak, syuruq, dan dhuha.`,
  };
}

export default async function JadwalPage() {
  const [pengaturan, branding] = await Promise.all([
    getPetaPengaturan(),
    ambilProfil(),
  ]);

  const ihtiyati = pengaturanAngka(pengaturan, "ihtiyati_menit", { min: 0, max: 5 });
  const hijriahOffsetHari = pengaturanAngka(pengaturan, "hijriah_offset_hari", {
    min: -2,
    max: 2,
  });
  const jadwal = await getJadwalHarian(pengaturan.lokasi_default, kunciTanggal(), {
    sumber: pengaturan.sumber_jadwal === "aladhan" ? "aladhan" : "hisab",
    ihtiyatiMenit: ihtiyati,
    hijriahOffsetHari,
  });

  // Hitung di zona waktu lokasi masjid, bukan selalu Asia/Jakarta.
  const zona = jadwal?.zona ?? "Asia/Jakarta";
  const sekarangMenit = menitHari(new Date(), zona);

  const jadwalWajib = SHALAT_WAJIB.map((shalat) => ({
    ...shalat,
    menit: keMenit(jadwal?.[shalat.key]),
  }));

  const shalatBerikutnya = jadwalWajib.find(
    (item) => item.menit !== null && item.menit > sekarangMenit
  );
  const shalatSekarang =
    shalatBerikutnya?.key === "subuh"
      ? jadwalWajib[jadwalWajib.length - 1]
      : [...jadwalWajib]
          .reverse()
          .find((item) => item.menit !== null && item.menit <= sekarangMenit);

  const labelSumber =
    jadwal?.sumber === "manual"
      ? "disunting manual oleh pengurus"
      : jadwal?.sumber === "aladhan"
        ? "Aladhan (metode Kemenag)"
        : "hisab lokal, metode Kementerian Agama RI";

  return (
    <div className="page-shell">
      <PageHeader
        kicker={jadwal?.hijriah || hijriahLokal(new Date(), zona, hijriahOffsetHari)}
        title="Jadwal Shalat"
        lead={`${branding.nama} — ${jadwal?.lokasi ?? pengaturan.lokasi_default}${
          jadwal?.provinsi ? `, ${jadwal.provinsi}` : ""
        }`}
      />

      <p className="meta mt-4">
        {tanggalPanjang(new Date(`${kunciTanggal(new Date(), zona)}T00:00:00`), zona)}{" "}
        · zona waktu {LABEL_ZONA[zona]}
      </p>

      {jadwal ? (
        <section className="mt-10">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {URUTAN_SHALAT.map((waktu) => {
              const aktif = shalatSekarang?.key === waktu.key;
              const berikutnya = shalatBerikutnya?.key === waktu.key;
              const nilai = jadwal[waktu.key] || "-";

              return (
                <div
                  key={waktu.key}
                  className={`rounded-xl border p-5 text-center transition ${
                    aktif
                      ? "border-forest-600/40 bg-forest-100"
                      : berikutnya
                        ? "border-brass/40 bg-forest-50"
                        : "border-forest-900/10 bg-white/60 hover:border-forest-700/30"
                  }`}
                >
                  <p className="text-xs font-medium uppercase tracking-widest text-ink-400">
                    {waktu.nama}
                  </p>
                  <p
                    className={`mt-2 text-2xl font-semibold tabular-nums ${
                      aktif || berikutnya ? "text-forest-800" : "text-forest-700"
                    }`}
                  >
                    {nilai}
                  </p>
                  {aktif && (
                    <p className="mt-2 text-xs uppercase tracking-widest text-forest-600">
                      Sekarang
                    </p>
                  )}
                  {berikutnya && (
                    <p className="mt-2 text-xs uppercase tracking-widest text-brass">
                      Berikutnya
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="surface-quiet mt-10 p-6">
            <p className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm tabular-nums text-ink-500">
              <span>Imsak {jadwal.imsak}</span>
              <span>Syuruq {jadwal.terbit}</span>
              <span>Dhuha {jadwal.dhuha}</span>
            </p>
            <div className="rule my-4" />
            <p className="text-center text-sm leading-relaxed text-ink-400">
              Jadwal dihitung untuk {jadwal.lokasi}
              {jadwal.provinsi ? `, ${jadwal.provinsi}` : ""} memakai subuh 20°,
              isya 18°, ashar mazhab Syafi&apos;i, dan ihtiyati {ihtiyati} menit
              ({labelSumber}). Perbedaan satu hingga dua menit dengan jadwal
              setempat masih wajar.
            </p>
          </div>
        </section>
      ) : (
        <p className="mt-12 text-sm text-ink-400">
          Jadwal shalat sedang tidak dapat dimuat. Silakan muat ulang halaman
          beberapa saat lagi.
        </p>
      )}
    </div>
  );
}
