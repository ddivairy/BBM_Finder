import fs from "fs";
import db from "./config/db.mjs";

const getAlamat = (tags = {}) => {
    if (tags["addr:street"]) {
        return [
            tags["addr:street"],
            tags["addr:housenumber"],
            tags["addr:city"]
        ]
            .filter(Boolean)
            .join(", ");
    }

    if (tags.branch) {
        return `Jl. ${tags.branch}`;
    }

    if (tags.alt_name) {
        return tags.alt_name;
    }

    return "Alamat belum tersedia";
};

try {
    console.log("Membaca data SPBU dari spbu-bandung.json...");

    const rawData = fs.readFileSync("./spbu-bandung.json", "utf-8");
    const data = JSON.parse(rawData);

    console.log(`Ditemukan ${data.elements.length} lokasi dari OpenStreetMap.`);

    let berhasil = 0;
    let dilewati = 0;

    for (const item of data.elements) {
        const lat = item.lat ?? item.center?.lat;
        const lon = item.lon ?? item.center?.lon;

        if (!lat || !lon) {
            dilewati++;
            continue;
        }

        const tags = item.tags || {};

        const nama = tags.name || "SPBU";

        const kategori =
            /pertamini|pertashop/i.test(nama)
                ? "eceran"
                : "spbu";

        const externalId = `osm-${item.type}-${item.id}`;

        // Ambil alamat dari data OSM
        const alamat = getAlamat(tags);

        const tipeBensin = [
            "Pertalite",
            "Pertamax"
        ];

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
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_DATE, ?)

            ON DUPLICATE KEY UPDATE
                nama = VALUES(nama),
                kategori = VALUES(kategori),
                alamat = VALUES(alamat),
                lintang = VALUES(lintang),
                bujur = VALUES(bujur),
                jam_operasi = VALUES(jam_operasi),
                verifikasi_terakhir = CURRENT_DATE
            `,
            [
                nama,
                kategori,
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
        console.log(`  📍 ${alamat}`);
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