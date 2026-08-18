import { Router } from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  getDashboard,
  getProfil,
  getPesertaList,
  getPesertaDetail,
  getPenimbangan,
  getImunisasi,
  getJadwal,
} from "../controllers/parentController.js";

const router = Router();

router.use(protect, authorize("parent"));

router.get("/dashboard", getDashboard);
router.get("/profil", getProfil);
router.get("/peserta", getPesertaList);
router.get("/peserta/:id", getPesertaDetail);
router.get("/penimbangan", getPenimbangan);
router.get("/imunisasi", getImunisasi);
router.get("/jadwal", getJadwal);

export default router;
