import bcrypt from "bcrypt";
import crypto from "crypto";
import db from "../config/db.mjs";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi."
      });
    }

    const [users] = await db.query(
      "SELECT id, nama, email, password, role FROM User WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Email belum terdaftar. Silakan daftar terlebih dahulu."
      });
    }

    const user = users[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        message: "Password salah. Coba lagi."
      });
    }

    // Buat token sesi lalu simpan ke database
    const token = crypto.randomBytes(32).toString("hex");

    await db.query("UPDATE User SET token = ? WHERE id = ?", [
      token,
      user.id
    ]);

    res.status(200).json({
      message: "Login berhasil.",
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server."
    });
  }
};

export const logout = async (req, res) => {
  try {
    await db.query("UPDATE User SET token = NULL WHERE id = ?", [
      req.user.id
    ]);

    res.status(200).json({
      message: "Logout berhasil."
    });
  } catch (error) {
    console.error("Logout error:", error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server."
    });
  }
};

export const register = async (req, res) => {
  try {
    const { nama, email, password } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({
        message: "Nama, email, dan password wajib diisi."
      });
    }

    const [existingUser] = await db.query(
      "SELECT id FROM User WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "Email sudah terdaftar."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO User (nama, email, password, status_verifikasi)
       VALUES (?, ?, ?, 'pending')`,
      [nama, email, hashedPassword]
    );

    res.status(201).json({
      message: "Registrasi berhasil."
    });

  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server."
    });
  }
};
