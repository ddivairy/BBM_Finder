import express from "express";
import {
    getSemuaLokasi,
    cariLokasiByNama,
    tambahLokasi,
    updateLokasi,
    hapusLokasi
} from "../controllers/lokasiController.mjs";

const router = express.Router();

router.get("/", getSemuaLokasi);
router.get("/cari/:nama", cariLokasiByNama);
router.post("/", tambahLokasi);
router.put("/:id", updateLokasi);
router.delete("/:id", hapusLokasi);

export default router;