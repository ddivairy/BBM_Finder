import fs from "fs";
import db from "./config/db.mjs";

try {
    console.log("Membaca data SPBU dari spbu-bandung.json...");

    const rawData = fs.readFileSync("./spbu-bandung.json", "utf-8");
    const data = JSON.parse(rawData);

    console.log(`Ditemukan ${data.elements.length} lokasi dari OpenStreetMap.`);

    let berhasil = 0;
    let dilewati = 0;

    for (const item of data.elements) {
        // Ambil koordinat dari node atau center (way)
        const lat = item.lat ?? item.center?.lat;
        const lon = item.lon ?? item.center?.lon;

        if (!lat || !lon) {
            dilewati++;
            continue;
        }

        const tags = item.tags || {};

        // Nama SPBU
        const nama = tags.name || "SPBU";

        // ID unik dari OpenStreetMap
        const externalId = `osm-${item.type}-${item.id}`;

        // Alamat
        const alamat = [
            tags["addr:street"],
            tags["addr:housenumber"],
            tags["addr:city"]
        ]
            .filter(Boolean)
            .join(", ");

        // Untuk sementara kita gunakan tipe BBM ini
        const tipeBensin = [
            "Pertalite",
            "Pertamax"
        ];

        // Masukkan / update ke MySQL
        await db.execute(
            `
            INSERT INTO Lokasi
            (
                nama,
                kategori,
                alamat,
                lintang,
                bujur,
                tipe_bensin,
                jam_operasi,
                verifikasi_terakhir,
                external_id
            )
            VALUES (?, 'SPBU', ?, ?, ?, ?, ?, CURRENT_DATE, ?)

            ON DUPLICATE KEY UPDATE
                nama = VALUES(nama),
                alamat = VALUES(alamat),
                lintang = VALUES(lintang),
                bujur = VALUES(bujur),
                jam_operasi = VALUES(jam_operasi),
                verifikasi_terakhir = CURRENT_DATE
            `,
            [
                nama,
                alamat,
                lat,
                lon,
                JSON.stringify(tipeBensin),
                tags.opening_hours || "24 Jam",
                externalId
            ]
        );

        berhasil++;

        console.log(`✓ ${nama}`);
    }

    console.log("\n==============================");
    console.log("✅ IMPORT SELESAI!");
    console.log(`Berhasil diproses : ${berhasil}`);
    console.log(`Dilewati          : ${dilewati}`);
    console.log("==============================");

    process.exit(0);

} catch (error) {
    console.error("❌ Gagal:", error);
    process.exit(1);
}