import fs from "fs";

const url = "https://overpass-api.de/api/interpreter";

const query = `
[out:json][timeout:120];

area["name"="Kota Bandung"]["boundary"="administrative"]->.bandung;

(
  node["amenity"="fuel"](area.bandung);
  way["amenity"="fuel"](area.bandung);
  relation["amenity"="fuel"](area.bandung);
);

out center tags;
`;

async function fetchSPBU() {
    try {
        console.log("Mengambil data SPBU Bandung dari OpenStreetMap...");

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "BBM-Finder/1.0 (local development)",
                "Referer": "https://overpass-turbo.eu/"
            },
            body: "data=" + encodeURIComponent(query)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        fs.writeFileSync(
            "./spbu-bandung.json",
            JSON.stringify(data, null, 2)
        );

        console.log("✅ Data berhasil diambil!");
        console.log(`📍 Jumlah lokasi: ${data.elements.length}`);
        console.log("💾 Disimpan sebagai: spbu-bandung.json");

    } catch (error) {
        console.error("❌ Gagal mengambil data:", error.message);
    }
}

fetchSPBU();