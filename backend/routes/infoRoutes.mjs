import express from "express";
import {
  getInfoHariIni,
  buatInfo,
  toggleLikeInfo,
  toggleDislikeInfo
} from "../controllers/infoController.mjs";
import { requireAuth, optionalAuth } from "../middleware/auth.mjs";

const router = express.Router();

// Info hari ini (semua orang bisa lihat)
router.get("/", optionalAuth, getInfoHariIni);

// Posting info (wajib login)
router.post("/", requireAuth, buatInfo);

// Toggle like (wajib login)
router.post("/:id/like", requireAuth, toggleLikeInfo);
router.post("/:id/dislike", requireAuth, toggleDislikeInfo);

export default router;
