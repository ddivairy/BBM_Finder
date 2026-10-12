import express from "express";
import { register, login, logout } from "../controllers/authController.mjs";
import { requireAuth } from "../middleware/auth.mjs";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", requireAuth, logout);

export default router;
