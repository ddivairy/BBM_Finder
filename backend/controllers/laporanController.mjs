import db from "../config/db.mjs";

// Laporan dianggap masih berlaku selama 2 jam
const JAM_BERLAKU = 2;

// Tanpa alias — untuk query tanpa alias tabel
const WAKTU_AKTIF = `dibuat_pada >= NOW() - INTERVAL ${JAM_BERLAKU} HOUR`;
// Dengan alias l — untuk query JOIN yang memakai alias l
const WAKTU_AKTIF_L = `l.${WAKTU_AKTIF}`;

// GET /api/laporan — semua laporan aktif, lengkap dengan info lokasi & like
export const getSemuaLaporan = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
          l.id,
          l.lokasi_id,
          l.status,
          l.komentar,
          l.dibuat_pada,
          l.user_id,
          TIMESTAMPDIFF(MINUTE, l.dibuat_pada, NOW()) AS menit_lalu,
          u.nama AS nama_pelapor,
          lo.nama AS nama_lokasi,
          lo.kategori,
          lo.alamat,
          lo.lintang,
          lo.bujur,
          (SELECT COUNT(*) FROM laporan_like ll WHERE ll.laporan_id = l.id) AS jumlah_like,
          ${req.user ? "EXISTS(SELECT 1 FROM laporan_like ll2 WHERE ll2.laporan_id = l.id AND ll2.user_id = ?)" : "0"} AS disukai_saya
       FROM laporan l
       JOIN lokasi lo ON lo.id = l.lokasi_id
       JOIN User u ON u.id = l.user_id
       WHERE ${WAKTU_AKTIF_L}
       ORDER BY l.dibuat_pada DESC`,
      req.user ? [req.user.id] : []
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error getLaporan:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil laporan."
    });
  }
};

// POST /api/lokasi/:id/laporan — buat laporan (wajib login)
export const buatLaporan = async (req, res) => {
  try {
    const { id: lokasiId } = req.params;
    const { status, komentar } = req.body;

    if (!["sepi", "normal", "ramai"].includes(status)) {
      return res.status(400).json({
        message: "Status harus 'sepi', 'normal', atau 'ramai'."
      });
    }

    // Pastikan lokasi ada dan sudah disetujui
    const [lokasi] = await db.query(
      "SELECT id FROM lokasi WHERE id = ? AND status = 'disetujui'",
      [lokasiId]
    );

    if (lokasi.length === 0) {
      return res.status(404).json({
        message: "Lokasi tidak ditemukan."
      });
    }

    // Cegah spam: satu laporan per user per lokasi dalam 2 jam terakhir
    const [duplikat] = await db.query(
      `SELECT id FROM laporan
       WHERE lokasi_id = ? AND user_id = ? AND ${WAKTU_AKTIF}`,
      [lokasiId, req.user.id]
    );

    if (duplikat.length > 0) {
      // Perbarui laporan lama, jangan bikin baru
      await db.query(
        "UPDATE laporan SET status = ?, komentar = ?, dibuat_pada = NOW() WHERE id = ?",
        [status, komentar || null, duplikat[0].id]
      );

      return res.status(200).json({
        message: "Laporan kamu sudah diperbarui.",
        id: duplikat[0].id
      });
    }

    const [result] = await db.query(
      "INSERT INTO laporan (lokasi_id, user_id, status, komentar) VALUES (?, ?, ?, ?)",
      [lokasiId, req.user.id, status, komentar || null]
    );

    res.status(201).json({
      message: "Laporan berhasil dikirim.",
      id: result.insertId
    });
  } catch (error) {
    console.error("Error buatLaporan:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat mengirim laporan."
    });
  }
};

// POST /api/laporan/:id/like — toggle like (wajib login)
export const toggleLike = async (req, res) => {
  try {
    const { id: laporanId } = req.params;

    const [laporan] = await db.query(
      `SELECT id FROM laporan WHERE id = ? AND ${WAKTU_AKTIF}`,
      [laporanId]
    );

    if (laporan.length === 0) {
      return res.status(404).json({
        message: "Laporan tidak ditemukan atau sudah kedaluwarsa."
      });
    }

    const [sudah] = await db.query(
      "SELECT id FROM laporan_like WHERE laporan_id = ? AND user_id = ?",
      [laporanId, req.user.id]
    );

    let disukai;

    if (sudah.length > 0) {
      await db.query(
        "DELETE FROM laporan_like WHERE laporan_id = ? AND user_id = ?",
        [laporanId, req.user.id]
      );
      disukai = false;
    } else {
      await db.query(
        "INSERT INTO laporan_like (laporan_id, user_id) VALUES (?, ?)",
        [laporanId, req.user.id]
      );
      disukai = true;
    }

    const [[{ jumlah }]] = await db.query(
      "SELECT COUNT(*) AS jumlah FROM laporan_like WHERE laporan_id = ?",
      [laporanId]
    );

    res.status(200).json({ disukai, jumlah_like: jumlah });
  } catch (error) {
    console.error("Error toggleLike:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat memproses like."
    });
  }
};
