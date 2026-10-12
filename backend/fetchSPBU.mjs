
import fs from "fs";

const url = "https://overpass-api.de/api/interpreter";

const wilayah = [
    "Kota Bandung",
    "Kabupaten Bandung"
];

async function ambilData(namaWilayah) {
    const query = `
[out:json][timeout:120];
area["name"="${namaWilayah}"]["boundary"="administrative"]->.wilayah;
(
  node["amenity"="fuel"](area.wilayah);
  way["amenity"="fuel"](area.wilayah);
  relation["amenity"="fuel"](area.wilayah);
);
out center tags;
`;

    console.log(`Mengambil data ${namaWilayah}...`);

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "BBM-Finder/1.0"
        },
        body: "data=" + encodeURIComponent(query),
        signal: AbortSignal.timeout(150000)
    });

    if (!response.ok) {
        throw new Error(
            `${namaWilayah}: HTTP ${response.status}`
        );
    }

    const data = await response.json();

    if (!Array.isArray(data.elements)) {
        throw new Error(`Data ${namaWilayah} tidak valid.`);
    }

    console.log(
        `${namaWilayah}: ${data.elements.length} lokasi ditemukan.`
    );

    return data.elements;
}

async function fetchSPBU() {
    try {
        const semuaData = [];

        for (const nama of wilayah) {
            const hasil = await ambilData(nama);
            semuaData.push(...hasil);
        }

        // Hindari elemen OSM yang sama terhitung dua kali.
        const unik = new Map();

        for (const lokasi of semuaData) {
            unik.set(`${lokasi.type}/${lokasi.id}`, lokasi);
        }

        const dataFinal = {
            version: 0.6,
            generator: "BBM Finder",
            elements: [...unik.values()]
        };

        fs.writeFileSync(
            "./spbu-bandung.json",
            JSON.stringify(dataFinal, null, 2)
        );

        console.log("Pengambilan data berhasil!");
        console.log(`Total lokasi unik: ${dataFinal.elements.length}`);
        console.log("File: spbu-bandung.json");

    } catch (error) {
        console.error("Gagal mengambil data:", error.message);
        console.log("File JSON lama tidak ditimpa oleh script ini.");
    }
}

fetchSPBU();