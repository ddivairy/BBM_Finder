import express from "express";
import {
  getSemuaLaporan,
  buatLaporan,
  toggleLike
} from "../controllers/laporanController.mjs";
import { requireAuth, optionalAuth } from "../middleware/auth.mjs";

const router = express.Router();

// Daftar laporan aktif (semua orang bisa lihat)
router.get("/", optionalAuth, getSemuaLaporan);

// Kirim laporan (wajib login)
router.post("/lokasi/:id", requireAuth, buatLaporan);

// Toggle like (wajib login)
router.post("/:id/like", requireAuth, toggleLike);

export default router;
