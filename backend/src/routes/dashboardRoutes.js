import { Router } from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  getSummary,
  getTrendBerat,
  getAdminSummary,
  getActivities,
} from "../controllers/dashboardController.js";

const router = Router();

router.get("/summary", protect, getSummary);
router.get("/trend-berat", protect, getTrendBerat);
router.get("/admin", protect, authorize("admin"), getAdminSummary);
router.get("/activities", protect, authorize("admin"), getActivities);

export default router;