import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import db from "./config/db.mjs";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.mjs";
import laporanRoutes from "./routes/laporanRoutes.mjs";
import infoRoutes from "./routes/infoRoutes.mjs";
import { requireAuth, requireAdmin } from "./middleware/auth.mjs";

const app = express();
const PORT = 5000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
let initializationPromise;

async function ensureCommunitySchema() {
    const [columns] = await db.execute(`
        SELECT COLUMN_NAME
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'User'
          AND COLUMN_NAME = 'status_verifikasi'
    `);

    if (columns.length === 0) {
        await db.execute(`
            ALTER TABLE User
            ADD COLUMN status_verifikasi ENUM('pending','disetujui','ditolak')
            NOT NULL DEFAULT 'disetujui' AFTER role
        `);
        console.log("Kolom verifikasi user berhasil ditambahkan.");
    }

    await db.execute(`
        CREATE TABLE IF NOT EXISTS info_pengecer (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            lokasi_id INT DEFAULT NULL,
            tempat VARCHAR(150) DEFAULT NULL,
            teks TEXT NOT NULL,
            dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            KEY idx_info_waktu (dibuat_pada)
        )
    `);
    await db.execute(`
        CREATE TABLE IF NOT EXISTS info_like (
            id INT AUTO_INCREMENT PRIMARY KEY,
            info_id INT NOT NULL,
            user_id INT NOT NULL,
            UNIQUE KEY uq_info_user (info_id, user_id)
        )
    `);
    await db.execute(`
        CREATE TABLE IF NOT EXISTS info_dislike (
            id INT AUTO_INCREMENT PRIMARY KEY,
            info_id INT NOT NULL,
            user_id INT NOT NULL,
            UNIQUE KEY uq_info_user (info_id, user_id)
        )
    `);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(async (req, res, next) => {
    try {
        await initializeBackend();
        next();
    } catch (error) {
        console.error("Gagal menyiapkan backend:", error);
        res.status(500).json({ message: "Backend belum siap. Periksa konfigurasi database." });
    }
});
app.use("/api/auth", authRoutes);
app.use("/api/laporan", laporanRoutes);
app.use("/api/info", infoRoutes);

// HOME
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// POST LOKASI (wajib login — disimpan sebagai 'pending' sampai di-acc admin)
app.post("/api/lokasi", requireAuth, async (req, res) => {
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
            return res.status(400).json({
                message: "Data wajib belum lengkap."
            });
        }

        const query = `
            INSERT INTO lokasi
            (
                nama,
                kategori,
                alamat,
                lintang,
                bujur,
                tipe_bensin,
                jam_operasi,
                verifikasi_terakhir,
                ditambahkan_oleh,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, DEFAULT, CURRENT_DATE, ?, 'pending')
        `;

        const [result] = await db.execute(query, [
            nama,
            kategori,
            alamat,
            lintang,
            bujur,
            JSON.stringify(tipe_bensin),
            req.user.id
        ]);

        res.status(201).json({
            message: "Lokasi berhasil dikirim dan menunggu persetujuan admin.",
            lokasiId: result.insertId
        });

    } catch (error) {
        console.error("Error database:", error);

        res.status(500).json({
            message: "Terjadi kesalahan saat menambahkan lokasi."
        });
    }
});

// GET LOKASI MENUNGGU PERSETUJUAN (admin)
app.get("/api/lokasi/pending", requireAuth, requireAdmin, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT l.*, u.nama AS nama_penambah
            FROM lokasi l
            LEFT JOIN User u ON u.id = l.ditambahkan_oleh
            WHERE l.status = 'pending'
            ORDER BY l.dibuat_pada DESC
        `);

        res.status(200).json(rows);
    } catch (error) {
        console.error("Error database:", error);
        res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data pending."
        });
    }
});

// ACC / TOLAK LOKASI (admin)
app.put("/api/lokasi/:id/verifikasi", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["disetujui", "ditolak"].includes(status)) {
            return res.status(400).json({
                message: "Status harus 'disetujui' atau 'ditolak'."
            });
        }

        const [result] = await db.execute(
            "UPDATE lokasi SET status = ? WHERE id = ?",
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Lokasi tidak ditemukan."
            });
        }

        res.status(200).json({
            message: `Lokasi berhasil ${status}.`
        });
    } catch (error) {
        console.error("Error database:", error);
        res.status(500).json({
            message: "Terjadi kesalahan saat memverifikasi lokasi."
        });
    }
});

// DAFTAR USER YANG MENUNGGU VERIFIKASI (admin)
app.get("/api/admin/users/pending", requireAuth, requireAdmin, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT id, nama, email, created_at
            FROM User
            WHERE role = 'user' AND status_verifikasi = 'pending'
            ORDER BY created_at ASC
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error mengambil user pending:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil user pending." });
    }
});

// SETUJUI / TOLAK USER (admin)
app.put("/api/admin/users/:id/verifikasi", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!["disetujui", "ditolak"].includes(status)) {
            return res.status(400).json({ message: "Status harus 'disetujui' atau 'ditolak'." });
        }

        const [result] = await db.execute(
            "UPDATE User SET status_verifikasi = ? WHERE id = ? AND role = 'user' AND status_verifikasi = 'pending'",
            [status, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Pengajuan user tidak ditemukan atau sudah diproses." });
        }
        res.status(200).json({ message: `User berhasil ${status}.` });
    } catch (error) {
        console.error("Error memverifikasi user:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat memverifikasi user." });
    }
});

// GET SEMUA LOKASI + FILTER KATEGORI (hanya yang sudah disetujui admin)
app.get("/api/lokasi", async (req, res) => {
    try {
        const { kategori } = req.query;

        let query = "SELECT * FROM lokasi WHERE status = 'disetujui'";
        const queryParams = [];

        if (
            kategori &&
            (kategori === "spbu" || kategori === "eceran")
        ) {
            query += " AND kategori = ?";
            queryParams.push(kategori);
        }

        const [rows] = await db.execute(query, queryParams);

        res.status(200).json(rows);

    } catch (error) {
        console.error("Error database:", error);

        res.status(500).json({
            message: "Terjadi kesalahan saat mengambil lokasi."
        });
    }
});

// SEARCH LOKASI
app.get("/api/lokasi/cari", async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || !q.trim()) {
            const [rows] = await db.execute(
                "SELECT * FROM lokasi WHERE status = 'disetujui'"
            );

            return res.status(200).json(rows);
        }

        const keyword = `%${q.trim()}%`;

        const query = `
            SELECT *
            FROM lokasi
            WHERE
                status = 'disetujui'
                AND (
                    nama LIKE ?
                    OR alamat LIKE ?
                    OR tipe_bensin LIKE ?
                    OR kategori LIKE ?
                )
        `;

        const [rows] = await db.execute(query, [
            keyword,
            keyword,
            keyword,
            keyword
        ]);

        res.status(200).json(rows);

    } catch (error) {
        console.error("Error search database:", error);

        res.status(500).json({
            message: "Terjadi kesalahan saat mencari lokasi."
        });
    }
});

// PUT LOKASI
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

        const verifikasi_otomatis =
            new Date().toISOString().split("T")[0];

        const query = `
            UPDATE lokasi
            SET
                nama = ?,
                kategori = ?,
                alamat = ?,
                lintang = ?,
                bujur = ?,
                tipe_bensin = ?,
                jam_operasi = ?,
                verifikasi_terakhir = ?
            WHERE id = ?
        `;

        const [result] = await db.execute(query, [
            nama,
            kategori,
            alamat || "",
            lintang,
            bujur,
            JSON.stringify(tipe_bensin),
            jam_operasi || "24 Jam",
            verifikasi_otomatis,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Lokasi tidak ditemukan."
            });
        }

        res.status(200).json({
            message: "Data lokasi berhasil diperbarui."
        });

    } catch (error) {
        console.error("Error database:", error);

        res.status(500).json({
            error: error.message
        });
    }
});

// DELETE LOKASI
app.delete("/api/lokasi/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            DELETE FROM lokasi
            WHERE id = ?
        `;

        const [result] = await db.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Lokasi tidak ditemukan."
            });
        }

        res.status(200).json({
            message: "Lokasi berhasil dihapus."
        });

    } catch (error) {
        console.error("Error database:", error);

        res.status(500).json({
            error: error.message
        });
    }
});

async function ensureDefaultAdmin() {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        throw new Error("ADMIN_EMAIL dan ADMIN_PASSWORD wajib diatur di environment backend.");
    }
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await db.execute(
        `INSERT INTO User (nama, email, password, role)
         VALUES ('Admin', ?, ?, 'admin')
         ON DUPLICATE KEY UPDATE role = 'admin'`,
        [ADMIN_EMAIL, passwordHash]
    );
    console.log("Akun admin tersedia.");
}

function initializeBackend() {
    if (!initializationPromise) {
        initializationPromise = (process.env.VERCEL === "1"
            ? Promise.resolve()
            : ensureCommunitySchema()
        ).then(ensureDefaultAdmin);
    }
    return initializationPromise;
}

export default app;

// START SERVER LOKAL; Vercel memakai default export sebagai Function.
if (process.env.VERCEL !== "1") {
    initializeBackend()
        .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
        })
        .catch((error) => {
            console.error("Gagal menyiapkan akun admin default:", error);
            process.exit(1);
        });
}
