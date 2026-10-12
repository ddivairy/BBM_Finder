import db from "../config/db.mjs";

// Database menyimpan waktu dalam UTC, pengguna ada di WIB (UTC+7).
// "Sampai akhir hari" = sampai tengah malam WIB, jadi hari dihitung +7 jam.
const HARI_INI_WIB = `DATE(i.dibuat_pada + INTERVAL 7 HOUR) = DATE(NOW() + INTERVAL 7 HOUR)`;

// GET /api/info — info pengecer yang berlaku hari ini (WIB)
export const getInfoHariIni = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
          i.id,
          i.lokasi_id,
          i.tempat,
          i.teks,
          i.dibuat_pada,
          TIMESTAMPDIFF(MINUTE, i.dibuat_pada, NOW()) AS menit_lalu,
          i.user_id,
          u.nama AS nama_pelapor,
          lo.nama AS nama_lokasi,
          lo.alamat,
          lo.lintang,
          lo.bujur,
          (SELECT COUNT(*) FROM info_like il WHERE il.info_id = i.id) AS jumlah_like,
          ${
            req.user
              ? "EXISTS(SELECT 1 FROM info_like il2 WHERE il2.info_id = i.id AND il2.user_id = ?)"
              : "0"
          } AS disukai_saya
       FROM info_pengecer i
       JOIN User u ON u.id = i.user_id
       LEFT JOIN lokasi lo ON lo.id = i.lokasi_id
       WHERE ${HARI_INI_WIB}
       ORDER BY i.dibuat_pada DESC`,
      req.user ? [req.user.id] : []
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error getInfo:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil info."
    });
  }
};

// POST /api/info — buat info baru (wajib login)
export const buatInfo = async (req, res) => {
  try {
    const { teks, lokasi_id, tempat } = req.body;

    if (!teks || !teks.trim()) {
      return res.status(400).json({
        message: "Isi info tidak boleh kosong."
      });
    }

    if (teks.trim().length > 500) {
      return res.status(400).json({
        message: "Info maksimal 500 karakter."
      });
    }

    let lokasiId = null;
    let tempatAkhir = tempat ? String(tempat).trim().slice(0, 150) : null;

    // Pilih lokasi dari daftar ATAU tulis bebas — salah satu wajib
    if (lokasi_id) {
      const [lokasi] = await db.query(
        "SELECT id FROM lokasi WHERE id = ? AND status = 'disetujui'",
        [lokasi_id]
      );

      if (lokasi.length === 0) {
        return res.status(404).json({
          message: "Lokasi tidak ditemukan."
        });
      }

      lokasiId = Number(lokasi_id);
      tempatAkhir = null;
    } else if (!tempatAkhir) {
      return res.status(400).json({
        message: "Pilih lokasi dari daftar atau tulis nama tempatnya."
      });
    }

    const [result] = await db.query(
      "INSERT INTO info_pengecer (user_id, lokasi_id, tempat, teks) VALUES (?, ?, ?, ?)",
      [req.user.id, lokasiId, tempatAkhir, teks.trim()]
    );

    res.status(201).json({
      message: "Info berhasil diposting.",
      id: result.insertId
    });
  } catch (error) {
    console.error("Error buatInfo:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat memposting info."
    });
  }
};

// POST /api/info/:id/like — toggle like (wajib login)
export const toggleLikeInfo = async (req, res) => {
  try {
    const { id: infoId } = req.params;

    const [info] = await db.query(
      `SELECT i.id FROM info_pengecer i WHERE ${HARI_INI_WIB} AND i.id = ?`,
      [infoId]
    );

    if (info.length === 0) {
      return res.status(404).json({
        message: "Info tidak ditemukan atau sudah lewat hari ini."
      });
    }

    const [sudah] = await db.query(
      "SELECT id FROM info_like WHERE info_id = ? AND user_id = ?",
      [infoId, req.user.id]
    );

    let disukai;

    if (sudah.length > 0) {
      await db.query(
        "DELETE FROM info_like WHERE info_id = ? AND user_id = ?",
        [infoId, req.user.id]
      );
      disukai = false;
    } else {
      await db.query(
        "INSERT INTO info_like (info_id, user_id) VALUES (?, ?)",
        [infoId, req.user.id]
      );
      disukai = true;
    }

    const [[{ jumlah }]] = await db.query(
      "SELECT COUNT(*) AS jumlah FROM info_like WHERE info_id = ?",
      [infoId]
    );

    res.status(200).json({ disukai, jumlah_like: jumlah });
  } catch (error) {
    console.error("Error toggleLikeInfo:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat memproses like."
    });
  }
};
