import { Router } from "express";
import { protect, denyAdminWrite, denyParent } from "../middleware/authMiddleware.js";
import {
  getOrangTuas,
  getOrangTua,
  createOrangTua,
  updateOrangTua,
  deleteOrangTua,
} from "../controllers/orangTuaController.js";

const router = Router();

router.use(protect, denyAdminWrite, denyParent);

router.route("/").get(getOrangTuas).post(createOrangTua);
router.route("/:id").get(getOrangTua).put(updateOrangTua).delete(deleteOrangTua);

export default router;