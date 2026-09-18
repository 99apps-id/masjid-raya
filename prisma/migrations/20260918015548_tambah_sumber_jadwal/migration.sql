-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_jadwal_shalat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tanggal" DATETIME NOT NULL,
    "lokasi" TEXT NOT NULL,
    "provinsi" TEXT,
    "imsak" TEXT NOT NULL,
    "subuh" TEXT NOT NULL,
    "terbit" TEXT,
    "dhuha" TEXT,
    "zuhur" TEXT NOT NULL,
    "ashar" TEXT NOT NULL,
    "maghrib" TEXT NOT NULL,
    "isya" TEXT NOT NULL,
    "sumber" TEXT NOT NULL DEFAULT 'hisab',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_jadwal_shalat" ("ashar", "createdAt", "dhuha", "id", "imsak", "isya", "lokasi", "maghrib", "provinsi", "subuh", "tanggal", "terbit", "zuhur") SELECT "ashar", "createdAt", "dhuha", "id", "imsak", "isya", "lokasi", "maghrib", "provinsi", "subuh", "tanggal", "terbit", "zuhur" FROM "jadwal_shalat";
DROP TABLE "jadwal_shalat";
ALTER TABLE "new_jadwal_shalat" RENAME TO "jadwal_shalat";
CREATE UNIQUE INDEX "jadwal_shalat_tanggal_lokasi_key" ON "jadwal_shalat"("tanggal", "lokasi");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
