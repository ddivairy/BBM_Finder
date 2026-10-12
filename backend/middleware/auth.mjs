import db from "../config/db.mjs";

// Verifikasi token dari header Authorization: Bearer <token>
export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        message: "Silakan login terlebih dahulu."
      });
    }

    const [rows] = await db.query(
      "SELECT id, nama, email, role FROM User WHERE token = ?",
      [token]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Sesi tidak valid. Silakan login lagi."
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan pada server."
    });
  }
};

// Opsional: isi req.user kalau token valid, tapi tetap lanjut tanpa token
export const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (token) {
      const [rows] = await db.query(
        "SELECT id, nama, email, role FROM User WHERE token = ?",
        [token]
      );
      if (rows[0]) req.user = rows[0];
    }
  } catch {
    // abaikan, yang penting request tetap jalan
  }
  next();
};

// Hanya admin yang boleh akses (untuk acc lokasi)
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Hanya admin yang diizinkan."
    });
  }
  next();
};
