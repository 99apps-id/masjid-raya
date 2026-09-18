import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { withAdminAuth } from "@/lib/api-auth";
import { bacaTubuh, galatDatabase } from "@/lib/api-util";
import {
  bawaanPengaturan,
  daftarPengaturanLengkap,
  KUNCI_PENGATURAN,
  type KunciPengaturan,
} from "@/lib/settings";
import { cariKota, KOTA_INDONESIA } from "@/lib/kota";
import { ID_ADZAN_KUSTOM, PILIHAN_ADZAN, urlSuaraValid } from "@/lib/azan";
import { getJadwalHarian, kunciTanggal } from "@/lib/prayer-times";

export const dynamic = "force-dynamic";

type HasilPeriksa = { ok: true; nilai: string } | { ok: false; pesan: string };

function bulatAntara(min: number, maks: number) {
  return (nilai: string): HasilPeriksa => {
    const angka = Number(nilai);
    if (!Number.isInteger(angka) || angka < min || angka > maks) {
      return { ok: false, pesan: `Harus bilangan bulat antara ${min} dan ${maks}` };
    }
    return { ok: true, nilai: String(angka) };
  };
}

function saklarStrict(nilai: string): HasilPeriksa {
  return nilai === "true" || nilai === "false"
    ? { ok: true, nilai }
    : { ok: false, pesan: 'Harus "true" atau "false"' };
}

/** Pemeriksa per kunci. Semua nilai disimpan sebagai teks di database. */
const PEMERIKSA: Record<KunciPengaturan, (nilai: string) => HasilPeriksa> = {
  lokasi_default: (nilai) => {
    const kota = cariKota(nilai);
    if (!kota) {
      return {
        ok: false,
        pesan: `Lokasi harus salah satu dari ${KOTA_INDONESIA.length} kota yang tersedia`,
      };
    }
    return { ok: true, nilai: kota.nama };
  },
  sumber_jadwal: (nilai) =>
    nilai === "hisab" || nilai === "aladhan"
      ? { ok: true, nilai }
      : { ok: false, pesan: 'Harus "hisab" atau "aladhan"' },
  ihtiyati_menit: bulatAntara(0, 5),
  hijriah_offset_hari: bulatAntara(-2, 2),
  iqomah_menit: bulatAntara(1, 30),
  reminder_menit: bulatAntara(1, 30),
  adzan_enabled: saklarStrict,
  reminder_suara: saklarStrict,
  tampilkan_murottal: saklarStrict,
  adzan_pilihan: (nilai) =>
    nilai === ID_ADZAN_KUSTOM || PILIHAN_ADZAN.some((p) => p.id === nilai)
      ? { ok: true, nilai }
      : { ok: false, pesan: "Pilihan suara adzan tidak dikenal" },
  adzan_audio_url: (nilai) => {
    const bersih = nilai.trim();
    if (bersih === "") return { ok: true, nilai: "" };
    return urlSuaraValid(bersih)
      ? { ok: true, nilai: bersih }
      : {
          ok: false,
          pesan: "Tautan suara harus https, atau berkas hasil unggahan aplikasi",
        };
  },
  running_text: (nilai) => {
    const bersih = nilai.trim();
    return bersih.length <= 500
      ? { ok: true, nilai: bersih }
      : { ok: false, pesan: "Teks berjalan maksimal 500 karakter" };
  },
};

const itemSchema = z.strictObject({
  key: z.string().refine((k) => (KUNCI_PENGATURAN as string[]).includes(k), "Kunci pengaturan tidak dikenal"),
  value: z.string().max(2000),
});

const muatSchema = z.union([itemSchema, z.array(itemSchema).min(1).max(50)]);

async function getHandler() {
  const daftar = await daftarPengaturanLengkap();
  return NextResponse.json(daftar, { headers: { "Cache-Control": "no-store" } });
}

async function putHandler(req: NextRequest) {
  const dibaca = await bacaTubuh(req, muatSchema);
  if (!dibaca.ok) return dibaca.respons;

  const daftar = Array.isArray(dibaca.data) ? dibaca.data : [dibaca.data];

  const nilaiFinal = new Map<KunciPengaturan, string>();
  const galat: { field: string; message: string }[] = [];

  for (const item of daftar) {
    const kunci = item.key as KunciPengaturan;
    const hasil = PEMERIKSA[kunci](item.value);
    if (!hasil.ok) {
      galat.push({ field: kunci, message: hasil.pesan });
      continue;
    }
    nilaiFinal.set(kunci, hasil.nilai);
  }

  if (galat.length > 0) {
    return NextResponse.json(
      { error: "Sebagian nilai pengaturan tidak sah", detail: galat },
      { status: 400 }
    );
  }

  try {
    const sebelum = new Map<string, string>();
    for (const kunci of nilaiFinal.keys()) {
      const baris = await prisma.pengaturan.findUnique({ where: { key: kunci } });
      sebelum.set(kunci, baris?.value ?? bawaanPengaturan(kunci));
    }

    for (const [kunci, nilai] of nilaiFinal) {
      await prisma.pengaturan.upsert({
        where: { key: kunci },
        update: { value: nilai },
        create: { key: kunci, value: nilai },
      });
    }

    // Perubahan yang memengaruhi jadwal langsung dihitung ulang supaya papan
    // informasi tidak menampilkan jadwal lama sampai cache kedaluwarsa.
    const mempengaruhiJadwal = [
      "lokasi_default",
      "sumber_jadwal",
      "ihtiyati_menit",
    ] as const;
    const perluSegarkan = mempengaruhiJadwal.some(
      (kunci) =>
        nilaiFinal.has(kunci) && nilaiFinal.get(kunci) !== sebelum.get(kunci)
    );

    if (perluSegarkan) {
      const lokasi = nilaiFinal.get("lokasi_default") ?? sebelum.get("lokasi_default")!;
      const sumber =
        (nilaiFinal.get("sumber_jadwal") ?? sebelum.get("sumber_jadwal")) === "aladhan"
          ? "aladhan"
          : "hisab";
      const ihtiyati = Number(nilaiFinal.get("ihtiyati_menit") ?? sebelum.get("ihtiyati_menit"));

      await getJadwalHarian(lokasi, kunciTanggal(), {
        segarkan: true,
        sumber,
        ihtiyatiMenit: Number.isFinite(ihtiyati) ? ihtiyati : 2,
      }).catch((error) => {
        console.error("Gagal menghitung ulang jadwal setelah pengaturan berubah:", error);
      });
    }

    return NextResponse.json({
      success: true,
      diubah: nilaiFinal.size,
      jadwalDihitungUlang: perluSegarkan,
    });
  } catch (error) {
    return galatDatabase(error, "Gagal menyimpan pengaturan");
  }
}

export const GET = withAdminAuth(getHandler, ["admin"]);
export const PUT = withAdminAuth(putHandler, ["admin"]);
