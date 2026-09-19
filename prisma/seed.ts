import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SATU_HARI_MS = 24 * 60 * 60 * 1000;

const AKUN_AWAL = [
  {
    email: "admin@masjidrayapro.com",
    name: "Super Admin",
    role: "admin",
    envVar: "SEED_ADMIN_PASSWORD",
    sandiBawaan: "admin123",
  },
  {
    email: "pengurus@masjidrayapro.com",
    name: "Bendahara Masjid",
    role: "pengurus",
    envVar: "SEED_PENGURUS_PASSWORD",
    sandiBawaan: "pengurus123",
  },
];

/**
 * Pastikan akun awal ada dan sandinya benar-benar cocok dengan sandi yang
 * dimaksud. Seed lama menyimpan hash bcrypt hardcoded yang tidak sesuai
 * komentarnya, sehingga login selalu gagal; di sini hash dibuat saat runtime dan
 * baris lama otomatis diperbaiki saat seed dijalankan ulang.
 */
async function siapkanAkun({
  email,
  name,
  role,
  envVar,
  sandiBawaan,
}: (typeof AKUN_AWAL)[number]) {
  const sandiDariEnv = process.env[envVar];
  const sudahAda = await prisma.user.findUnique({ where: { email } });

  if (!sudahAda) {
    // Di produksi, tolak sandi bawaan yang mudah ditebak — operator wajib
    // menyetel SEED_*_PASSWORD. Di development, sandi bawaan tetap diizinkan
    // agar instalasi awal mudah.
    if (!sandiDariEnv && process.env.NODE_ENV === "production") {
      throw new Error(
        `Seed dibatalkan: set ${envVar} di produksi (tidak boleh memakai sandi bawaan untuk ${email}).`
      );
    }
    const sandi = sandiDariEnv || sandiBawaan;
    await prisma.user.create({
      data: {
        email,
        name,
        role,
        password: await bcrypt.hash(sandi, 12),
        emailVerified: new Date(),
      },
    });
    console.log(`Akun dibuat: ${email} (role: ${role})`);
    if (!sandiDariEnv) {
      console.log(
        `PERINGATAN: ${email} memakai sandi bawaan. Set ${envVar} sebelum produksi.`
      );
    }
    return;
  }

  // Akun sudah ada. Sandi yang tersimpan TIDAK disentuh kecuali operator memang
  // menyetel variabel env-nya. Tanpa penjagaan ini, menjalankan seed lagi di
  // produksi akan mengembalikan sandi yang sudah pernah diganti ke sandi bawaan
  // yang diketahui publik -- jalan pintas pengambilalihan akun.
  if (!sandiDariEnv) {
    console.log(
      `Akun ${email} sudah ada; sandi dibiarkan apa adanya. ` +
        `Set ${envVar} bila memang ingin menggantinya.`
    );
    return;
  }

  const cocok =
    !!sudahAda.password && (await bcrypt.compare(sandiDariEnv, sudahAda.password));
  if (!cocok) {
    await prisma.user.update({
      where: { email },
      data: { password: await bcrypt.hash(sandiDariEnv, 12) },
    });
    console.log(`Sandi akun diselaraskan dengan ${envVar}: ${email}`);
  }
}

/**
 * Hapus baris jadwal berkonvensi lama. Jadwal kini disimpan tepat pada tengah
 * malam UTC dari tanggal kalender Jakarta (kelipatan bulat satu hari), sedangkan
 * data hasil seed lama tersimpan pada tengah malam waktu lokal sehingga tidak
 * pernah cocok dengan kueri harian.
 */
async function bersihkanJadwalUsang() {
  const semua = await prisma.jadwalShalat.findMany({
    select: { id: true, tanggal: true },
  });
  const usang = semua
    .filter((baris) => baris.tanggal.getTime() % SATU_HARI_MS !== 0)
    .map((baris) => baris.id);

  if (usang.length > 0) {
    await prisma.jadwalShalat.deleteMany({ where: { id: { in: usang } } });
    console.log(`Menghapus ${usang.length} baris jadwal berkonvensi lama.`);
  }
}

async function main() {
  for (const akun of AKUN_AWAL) {
    await siapkanAkun(akun);
  }

  const existingProfil = await prisma.profilMasjid.findFirst();
  if (!existingProfil) {
    await prisma.profilMasjid.create({
      data: {
        nama: "Masjid Raya Pro",
        deskripsi:
          "Masjid Raya Pro adalah pusat kegiatan keislaman yang melayani jamaah dengan fasilitas modern dan program yang beragam.",
        visi: "Menjadi pusat dakwah dan ibadah yang terdepan di wilayah Nusantara.",
        misi:
          "Menyelenggarakan ibadah yang khusyuk, mengembangkan pendidikan Islam, dan memperkuat ukhuwah Islamiyah.",
        sejarah:
          "Didirikan pada tahun 2010, Masjid Raya Pro telah berkembang menjadi pusat kegiatan Islam yang melayani ribuan jamaah setiap harinya.",
        alamat: "Jl. Merdeka No. 1, Jakarta Pusat, Indonesia",
        kontak: "(021) 123-4567",
        email: "info@masjidrayapro.com",
      },
    });
  }

  const ustadzCount = await prisma.ustadz.count();
  if (ustadzCount === 0) {
    await prisma.ustadz.createMany({
      data: [
        {
          nama: "Ustadz Ahmad Fauzi, Lc.",
          spesialisasi: "Tafsir Al-Quran, Fiqh",
          bio: "Lulusan Universitas Al-Azhar Kairo dengan spesialisasi tafsir dan fikih. Mengajar di Masjid Raya Pro sejak 2015.",
        },
        {
          nama: "Ustadzah Siti Aisyah, S.Pd.I",
          spesialisasi: "Akidah, Pendidikan Anak",
          bio: "Aktivis pendidikan Islam anak dan remaja. Mentor di berbagai program da'wah nasional.",
        },
        {
          nama: "Ustadz Muhammad Rizki, M.Pd.I",
          spesialisasi: "Hadits, Sejarah Islam",
          bio: "Peneliti hadits dengan ribuan sanad terverifikasi. Penulis buku tentang sirah nabawiyah.",
        },
      ],
    });
  }

  const pengurusCount = await prisma.pengurus.count();
  if (pengurusCount === 0) {
    await prisma.pengurus.createMany({
      data: [
        { nama: "H. Muhammad Yusuf", jabatan: "Ketua Takmir", urutan: 1 },
        { nama: "Ahmad Hidayatullah, S.E.", jabatan: "Wakil Ketua", urutan: 2 },
        { nama: "Ir. Hj. Siti Nurhaliza", jabatan: "Sekretaris", urutan: 3 },
        { nama: "H. Budi Santoso", jabatan: "Bendahara", urutan: 4 },
        { nama: "Ustadz Ahmad Fauzi, Lc.", jabatan: "Penceramah", urutan: 5 },
      ],
    });
  }

  const beritaCount = await prisma.berita.count();
  if (beritaCount === 0) {
    await prisma.berita.createMany({
      data: [
        {
          judul: "Pengajian Rutin Kamis Malam Bersama Ustadz Ahmad Fauzi",
          isi: "Jamaah Masjid Raya Pro diundang untuk hadir dalam pengajian rutin kamis malam yang membahas tafsir Al-Quran surat Al-Baqarah.",
          kategori: "pengumuman",
          published: true,
          publishedAt: new Date(),
        },
        {
          judul: "Program Bantuan Sosial untuk 1000 Anak Yatim di Bulan Ramadhan",
          isi: "Masjid Raya Pro mengadakan program bantuan sosial untuk 1000 anak yatim dan dhuafa di bulan Ramadhan tahun ini.",
          kategori: "berita",
          published: true,
          publishedAt: new Date(),
        },
        {
          judul: "Pelantikan Pengurus Masjid Raya Pro Periode 2024-2029",
          isi: "Pelantikan pengurus baru Masjid Raya Pro untuk periode 2024-2029 dilaksanakan secara khidmat dihadiri ribuan jamaah.",
          kategori: "berita",
          published: true,
          publishedAt: new Date(),
        },
      ],
    });
  }

  const today = new Date();
  const nextFriday = new Date(today);
  const daysUntilFriday = (5 - nextFriday.getDay() + 7) % 7 || 7;
  nextFriday.setDate(today.getDate() + daysUntilFriday);
  nextFriday.setHours(0, 0, 0, 0);

  const khutbahCount = await prisma.khutbah.count();
  if (khutbahCount === 0) {
    await prisma.khutbah.createMany({
      data: [
        {
          tanggal: nextFriday,
          tema: "Kesabaran dalam Menghadapi Ujian Kehidupan",
          penceramah: "Ustadz Ahmad Fauzi, Lc.",
        },
        {
          tanggal: new Date(nextFriday.getTime() + 7 * SATU_HARI_MS),
          tema: "Keutamaan Bulan Ramadhan dan Amal Sholih",
          penceramah: "Ustadzah Siti Aisyah, S.Pd.I",
        },
      ],
    });
  }

  const kegiatanCount = await prisma.kegiatan.count();
  if (kegiatanCount === 0) {
    await prisma.kegiatan.createMany({
      data: [
        {
          nama: "Pengajian Rutin Jumat Pagi",
          deskripsi: "Pengajian rutin setiap hari Jumat pukul 07.00 WIB setelah subuh.",
          tanggalMulai: new Date(today.getFullYear(), today.getMonth(), 1),
          lokasi: "Masjid Utama",
        },
        {
          nama: "Kelas Tafsir Al-Quran",
          deskripsi: "Kelas tafsir Al-Quran untuk pemula setiap hari Sabtu pukul 19.00 WIB.",
          tanggalMulai: new Date(today.getFullYear(), today.getMonth(), 5),
          lokasi: "Ruang Kajian",
        },
        {
          nama: "Buka Puasa Bersama",
          deskripsi: "Buka puasa bersama jamaah dengan iftar massal setiap hari Ramadhan.",
          tanggalMulai: new Date(today.getFullYear(), 2, 1),
          lokasi: "Masjid Utama",
        },
      ],
    });
  }

  const agendaCount = await prisma.agenda.count();
  if (agendaCount === 0) {
    await prisma.agenda.createMany({
      data: [
        { nama: "Sholat Jumat", tanggal: nextFriday, waktu: "12:30", lokasi: "Masjid Utama" },
        {
          nama: "Halaqah Daurah",
          tanggal: new Date(nextFriday.getTime() + 2 * SATU_HARI_MS),
          waktu: "19:30",
          lokasi: "Ruang Kajian",
        },
      ],
    });
  }

  // Jadwal shalat sengaja tidak diisi statis. Sumber kebenarannya adalah
  // getJadwalHarian() yang mengambil jadwal Kemenag (Aladhan) lalu menyimpannya
  // sebagai cache, sehingga yang tersaji selalu data tanggal berjalan.
  await bersihkanJadwalUsang();

  // Koordinat tidak lagi disimpan sebagai pengaturan: ia dihitung dari katalog
  // kota (`src/lib/kota.ts`) memakai `lokasi_default`. Baris lama dari versi
  // sebelumnya dibuang agar tidak tersisa sebagai kunci yatim.
  await prisma.pengaturan.deleteMany({
    where: { key: { in: ["latitude_default", "longitude_default"] } },
  });

  const pengaturanBawaan: { key: string; value: string }[] = [
    { key: "lokasi_default", value: "Jakarta" },
    { key: "adzan_enabled", value: "true" },
    { key: "adzan_audio_url", value: "" },
    { key: "murottal_reciter", value: "alafasy" },
    {
      key: "running_text",
      value:
        "Selamat datang di masjid kami. Mari jaga kebersihan dan ketertiban bersama.",
    },
  ];

  for (const item of pengaturanBawaan) {
    const ada = await prisma.pengaturan.findUnique({ where: { key: item.key } });
    if (!ada) {
      await prisma.pengaturan.create({ data: item });
    }
  }

  console.log("Seed selesai.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
