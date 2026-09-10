import { Router } from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  getSummary,
  getTrendBerat,
  getKunjunganTrend,
  getAdminSummary,
  getActivities,
  getAlerts,
} from "../controllers/dashboardController.js";

const router = Router();

router.get("/summary", protect, getSummary);
router.get("/trend-berat", protect, getTrendBerat);
router.get("/trend-kunjungan", protect, getKunjunganTrend);
router.get("/alerts", protect, authorize("kader", "admin"), getAlerts);
router.get("/admin", protect, authorize("admin"), getAdminSummary);
router.get("/activities", protect, authorize("admin"), getActivities);

export default router;