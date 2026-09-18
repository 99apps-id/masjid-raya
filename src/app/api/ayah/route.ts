import { NextRequest, NextResponse } from "next/server";
import { ambilAyatAcak, KUMPULAN_AYAT } from "@/lib/ayat";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const jumlahParam = request.nextUrl.searchParams.get("jumlah");
    const jumlahDiminta = Number(jumlahParam);

    if (jumlahParam !== null && (!Number.isInteger(jumlahDiminta) || jumlahDiminta < 1)) {
      return NextResponse.json(
        { error: "Parameter jumlah harus bilangan bulat positif" },
        { status: 400 }
      );
    }

    const jumlah = Math.min(jumlahDiminta || 1, KUMPULAN_AYAT.length);
    const ayat = ambilAyatAcak(jumlah);

    // Tanpa parameter jumlah, respons dijaga tetap satu objek agar pemanggil
    // lama tidak perlu berubah.
    if (jumlahParam === null) {
      return NextResponse.json(ayat[0]);
    }

    return NextResponse.json({ jumlah: ayat.length, ayat });
  } catch (error) {
    console.error("Error fetching ayah:", error);
    return NextResponse.json(
      { error: "Gagal memuat ayat" },
      { status: 500 }
    );
  }
}
