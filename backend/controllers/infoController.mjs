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
          u.status_verifikasi AS status_verifikasi_pelapor,
          lo.nama AS nama_lokasi,
          lo.alamat,
          lo.lintang,
          lo.bujur,
          (SELECT COUNT(*) FROM info_like il WHERE il.info_id = i.id) AS jumlah_like,
          (SELECT COUNT(*) FROM info_dislike idl WHERE idl.info_id = i.id) AS jumlah_dislike,
          ${
            req.user
              ? "EXISTS(SELECT 1 FROM info_like il2 WHERE il2.info_id = i.id AND il2.user_id = ?)"
              : "0"
          } AS disukai_saya,
          ${
            req.user
              ? "EXISTS(SELECT 1 FROM info_dislike idl2 WHERE idl2.info_id = i.id AND idl2.user_id = ?)"
              : "0"
          } AS tidak_disukai_saya
       FROM info_pengecer i
       JOIN User u ON u.id = i.user_id
       LEFT JOIN lokasi lo ON lo.id = i.lokasi_id
       WHERE ${HARI_INI_WIB}
       ORDER BY i.dibuat_pada DESC`,
      req.user ? [req.user.id, req.user.id] : []
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

const toggleReaksiInfo = async (req, res, reaksi) => {
  let connection;
  try {
    const { id: infoId } = req.params;
    const tabelAktif = reaksi === 'like' ? 'info_like' : 'info_dislike';
    const tabelLawan = reaksi === 'like' ? 'info_dislike' : 'info_like';

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [info] = await connection.query(
      `SELECT i.id FROM info_pengecer i WHERE ${HARI_INI_WIB} AND i.id = ? FOR UPDATE`,
      [infoId]
    );

    if (info.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: "Info tidak ditemukan atau sudah lewat hari ini."
      });
    }

    const [sudah] = await connection.query(
      `SELECT id FROM ${tabelAktif} WHERE info_id = ? AND user_id = ?`,
      [infoId, req.user.id]
    );

    if (sudah.length > 0) {
      await connection.query(
        `DELETE FROM ${tabelAktif} WHERE info_id = ? AND user_id = ?`,
        [infoId, req.user.id]
      );
    } else {
      await connection.query(
        `DELETE FROM ${tabelLawan} WHERE info_id = ? AND user_id = ?`,
        [infoId, req.user.id]
      );
      await connection.query(
        `INSERT INTO ${tabelAktif} (info_id, user_id) VALUES (?, ?)`,
        [infoId, req.user.id]
      );
    }

    const [[{ jumlahLike }]] = await connection.query(
      "SELECT COUNT(*) AS jumlahLike FROM info_like WHERE info_id = ?",
      [infoId]
    );
    const [[{ jumlahDislike }]] = await connection.query(
      "SELECT COUNT(*) AS jumlahDislike FROM info_dislike WHERE info_id = ?",
      [infoId]
    );
    const statusAktif = sudah.length === 0;
    await connection.commit();

    res.status(200).json({
      disukai: reaksi === 'like' ? statusAktif : false,
      tidak_disukai: reaksi === 'dislike' ? statusAktif : false,
      jumlah_like: jumlahLike,
      jumlah_dislike: jumlahDislike,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error(`Error toggle ${reaksi} info:`, error);
    res.status(500).json({
      message: `Terjadi kesalahan saat memproses ${reaksi} info.`
    });
  } finally {
    connection?.release();
  }
};

// POST /api/info/:id/like — toggle like (wajib login)
export const toggleLikeInfo = (req, res) => toggleReaksiInfo(req, res, 'like');

// POST /api/info/:id/dislike — toggle dislike (wajib login)
export const toggleDislikeInfo = (req, res) => toggleReaksiInfo(req, res, 'dislike');
