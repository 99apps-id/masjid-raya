import { NextRequest, NextResponse } from "next/server";
import { cariSurah } from "@/lib/surah";

export const dynamic = "force-dynamic";

/**
 * Proksi teks satu surah (Arab rasm Utsmani + terjemahan Indonesia).
 *
 * Klien tidak boleh memanggil arsip luar langsung karena CSP
 * `connect-src 'self'` — satu-satunya jalan adalah route ini. Teks Arab
 * diambil dari edisi `quran-uthmani` dan terjemahan dari `id.indonesian`
 * milik api.alquran.cloud, digabung per nomor ayat, lalu di-cache di memori
 * 6 jam (satu surah = satu entri, teks tidak pernah berubah).
 */

interface AyahLuar {
  numberInSurah: number;
  text: string;
}

interface SurahLuar {
  ayahs: AyahLuar[];
}

interface AyatSurah {
  nomor: number;
  ar: string;
  idn: string;
}

interface EntriCache {
  data: {
    surah: number;
    nama: string;
    arab: string;
    jumlahAyat: number;
    ayat: AyatSurah[];
  };
  kedaluwarsa: number;
}

const TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map<number, EntriCache>();

async function ambilEdisi(nomor: number, edisi: string): Promise<SurahLuar> {
  const res = await fetch(`https://api.alquran.cloud/v1/surah/${nomor}/${edisi}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Arsip ${edisi} menjawab ${res.status}`);
  const badan = (await res.json()) as { code: number; data: SurahLuar };
  if (badan.code !== 200 || !Array.isArray(badan.data?.ayahs)) {
    throw new Error(`Format arsip ${edisi} tidak dikenal`);
  }
  return badan.data;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ nomor: string }> }
) {
  const nomor = Number((await params).nomor);
  const info = cariSurah(nomor);
  if (!info) {
    return NextResponse.json(
      { error: "Nomor surah harus 1–114" },
      { status: 400 }
    );
  }

  const tersimpan = cache.get(nomor);
  if (tersimpan && tersimpan.kedaluwarsa > Date.now()) {
    return NextResponse.json(tersimpan.data, {
      headers: { "Cache-Control": "public, max-age=21600" },
    });
  }

  try {
    const [arab, terjemah] = await Promise.all([
      ambilEdisi(nomor, "quran-uthmani"),
      ambilEdisi(nomor, "id.indonesian"),
    ]);

    const arti = new Map(terjemah.ayahs.map((a) => [a.numberInSurah, a.text]));
    const ayat: AyatSurah[] = arab.ayahs.map((a) => ({
      nomor: a.numberInSurah,
      ar: a.text,
      idn: arti.get(a.numberInSurah) ?? "",
    }));

    const data = {
      surah: info.nomor,
      nama: info.nama,
      arab: info.arab,
      jumlahAyat: ayat.length,
      ayat,
    };
    cache.set(nomor, { data, kedaluwarsa: Date.now() + TTL_MS });

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=21600" },
    });
  } catch (error) {
    console.error(`Gagal memuat surah ${nomor}:`, error);
    return NextResponse.json(
      { error: "Gagal memuat teks surah dari arsip" },
      { status: 502 }
    );
  }
}
