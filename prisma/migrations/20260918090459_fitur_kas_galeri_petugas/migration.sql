-- CreateTable
CREATE TABLE "kas_transaksi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tanggal" DATETIME NOT NULL,
    "jenis" TEXT NOT NULL,
    "kategori" TEXT,
    "keterangan" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "galeri" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "gambar" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "petugas_jadwal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tanggal" DATETIME NOT NULL,
    "peran" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "keterangan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "kas_transaksi_tanggal_idx" ON "kas_transaksi"("tanggal");

-- CreateIndex
CREATE INDEX "petugas_jadwal_tanggal_idx" ON "petugas_jadwal"("tanggal");
