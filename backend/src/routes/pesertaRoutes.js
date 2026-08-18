import { Router } from "express";
import { protect, denyAdminWrite, denyParent } from "../middleware/authMiddleware.js";
import {
  getPesertas,
  getPeserta,
  createPeserta,
  updatePeserta,
  deletePeserta,
} from "../controllers/pesertaController.js";

const router = Router();

router.use(protect, denyAdminWrite, denyParent);

router.route("/").get(getPesertas).post(createPeserta);
router.route("/:id").get(getPeserta).put(updatePeserta).delete(deletePeserta);

export default router;