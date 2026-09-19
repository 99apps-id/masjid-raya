import { NextRequest, NextResponse } from "next/server";
import { cariKota, cariKotaTerdekat, KOTA_DEFAULT } from "@/lib/kota";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Cek apakah IP adalah alamat internal/lokal privat.
 */
function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  return false;
}

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const latParam = sp.get("lat");
    const lonParam = sp.get("lon");

    // 1. Deteksi via koordinat GPS yang dikirimkan klien
    if (latParam && lonParam) {
      const lat = parseFloat(latParam);
      const lon = parseFloat(lonParam);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        const kota = cariKotaTerdekat(lat, lon);
        return NextResponse.json({
          kota: kota.nama,
          provinsi: kota.provinsi,
          zona: kota.zona,
          lat: kota.lat,
          lon: kota.lon,
          sumber: "gps",
        });
      }
    }

    // 2. Deteksi via header jaringan (Cloudflare / reverse proxy geolokasi)
    const headerLat = request.headers.get("cf-iplatitude") || request.headers.get("x-vercel-ip-latitude");
    const headerLon = request.headers.get("cf-iplongitude") || request.headers.get("x-vercel-ip-longitude");
    const headerCity = request.headers.get("cf-ipcity") || request.headers.get("x-vercel-ip-city");

    if (headerLat && headerLon) {
      const lat = parseFloat(headerLat);
      const lon = parseFloat(headerLon);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        const kota = cariKotaTerdekat(lat, lon);
        return NextResponse.json({
          kota: kota.nama,
          provinsi: kota.provinsi,
          zona: kota.zona,
          lat: kota.lat,
          lon: kota.lon,
          sumber: "jaringan",
        });
      }
    }

    if (headerCity) {
      const kotaTepat = cariKota(headerCity);
      if (kotaTepat) {
        return NextResponse.json({
          kota: kotaTepat.nama,
          provinsi: kotaTepat.provinsi,
          zona: kotaTepat.zona,
          lat: kotaTepat.lat,
          lon: kotaTepat.lon,
          sumber: "jaringan",
        });
      }
    }

    // 3. Deteksi via IP publik pengguna (bila tersedia dan bukan IP lokal)
    const clientIp =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "";

    if (clientIp && !isPrivateIp(clientIp)) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1800);

        const resGeo = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,countryCode,city,lat,lon`, {
          signal: controller.signal,
          cache: "no-store",
        });
        clearTimeout(timeout);

        if (resGeo.ok) {
          const dataGeo = (await resGeo.json()) as {
            status?: string;
            countryCode?: string;
            city?: string;
            lat?: number;
            lon?: number;
          };

          if (dataGeo.status === "success" && dataGeo.countryCode === "ID") {
            if (typeof dataGeo.lat === "number" && typeof dataGeo.lon === "number") {
              const kota = cariKotaTerdekat(dataGeo.lat, dataGeo.lon);
              return NextResponse.json({
                kota: kota.nama,
                provinsi: kota.provinsi,
                zona: kota.zona,
                lat: kota.lat,
                lon: kota.lon,
                sumber: "jaringan",
              });
            }
            if (dataGeo.city) {
              const kota = cariKota(dataGeo.city);
              if (kota) {
                return NextResponse.json({
                  kota: kota.nama,
                  provinsi: kota.provinsi,
                  zona: kota.zona,
                  lat: kota.lat,
                  lon: kota.lon,
                  sumber: "jaringan",
                });
              }
            }
          }
        }
      } catch {
        // Abaikan kegagalan jaringan eksternal dan lanjutkan ke fallback default
      }
    }

    // 4. Default: Jakarta bila tidak terdeteksi via GPS maupun Jaringan
    return NextResponse.json({
      kota: KOTA_DEFAULT.nama,
      provinsi: KOTA_DEFAULT.provinsi,
      zona: KOTA_DEFAULT.zona,
      lat: KOTA_DEFAULT.lat,
      lon: KOTA_DEFAULT.lon,
      sumber: "default",
    });
  } catch {
    return NextResponse.json({
      kota: KOTA_DEFAULT.nama,
      provinsi: KOTA_DEFAULT.provinsi,
      zona: KOTA_DEFAULT.zona,
      lat: KOTA_DEFAULT.lat,
      lon: KOTA_DEFAULT.lon,
      sumber: "default",
    });
  }
}
