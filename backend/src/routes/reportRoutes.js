import { Router } from "express";
import { protect, denyAdminWrite, denyParent } from "../middleware/authMiddleware.js";
import { getRekap } from "../controllers/reportController.js";

const router = Router();

router.get("/rekap", protect, denyAdminWrite, denyParent, getRekap);

export default router;