import express from "express";
import cors from "cors";
import path from "path";
import db from "./config/db.mjs";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Kehabisan bensin?");
});

// 1. POST LOKASI
app.post("/api/lokasi", async (req, res) => {
    try {
        const {
            nama, 
            kategori, 
            alamat, 
            lintang, 
            bujur, 
            tipe_bensin
        } = req.body;

        if (!nama || !kategori || !lintang || !bujur || !tipe_bensin) {
            return res.status(400).json({ message: "Data wajib belum lengkap." });
        }

        const query = "INSERT INTO lokasi (nama, kategori, alamat, lintang, bujur, tipe_bensin, jam_operasi, verifikasi_terakhir) VALUES (?, ?, ?, ?, ?, ?, DEFAULT, CURRENT_DATE)";

        const [result] = await db.execute(query, [
            nama, 
            kategori, 
            alamat, 
            lintang, 
            bujur, 
            JSON.stringify(tipe_bensin)
        ]);

        res.status(201).json({
            message: "Lokasi berhasil didaftarkan",
            lokasiId: result.insertId
        });
    } catch (error) {
        console.error("Error database:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat menambahkan lokasi." });
    }
});

// 2. GET LOKASI 
app.get("/api/lokasi", async (req, res) => {
    try {
        const { kategori } = req.query; 
        let query = "SELECT * FROM lokasi"; 
        const queryParams = [];

        if (kategori && (kategori === 'spbu' || kategori === 'eceran')) {
            query += " WHERE kategori = ?";
            queryParams.push(kategori);
        }

        const [rows] = await db.execute(query, queryParams);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error database:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil lokasi." });
    }
});

// 3. PUT LOKASI (Update Data + Verifikasi Otomatis)
app.put("/api/lokasi/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nama, 
            kategori, 
            alamat, 
            lintang, 
            bujur, 
            tipe_bensin, 
            jam_operasi
        } = req.body;

        const verifikasi_otomatis = new Date().toISOString().split("T")[0];

        const query = `UPDATE lokasi SET nama = ?, kategori = ?, alamat = ?, lintang = ?, bujur = ?, tipe_bensin = ?, jam_operasi = ?, verifikasi_terakhir = ? WHERE id = ?`;

        const [result] = await db.execute(query, [
            nama, 
            kategori, 
            alamat || '', 
            lintang, 
            bujur, 
            JSON.stringify(tipe_bensin), 
            jam_operasi || '24 Jam',
            verifikasi_otomatis,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Lokasi tidak ditemukan." });
        }
        res.status(200).json({ message: "Data lokasi berhasil diperbarui." });
    } catch (error) {
        console.error("Error database:", error);
        res.status(500).json({ error: error.message });
    }
});

// 4. DELETE LOKASI
app.delete("/api/lokasi/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const query = "DELETE FROM lokasi WHERE id = ?";
        const [result] = await db.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Lokasi tidak ditemukan." });
        }
        res.status(200).json({ message: "Lokasi berhasil dihapus." });
    } catch (error) {
        console.error("Error database:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});