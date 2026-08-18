import { Router } from "express";
import { protect, denyAdminWrite, denyParent } from "../middleware/authMiddleware.js";
import Measurement from "../models/Measurement.js";
import Peserta from "../models/Peserta.js";
import crudController from "../utils/crudController.js";
import {
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
} from "../controllers/measurementController.js";

const router = Router();

router.use(protect, denyAdminWrite, denyParent);

const controller = crudController(Measurement, {
  searchFields: ["catatan"],
  searchRefs: [{ path: "peserta", Model: Peserta, field: "nama" }],
  populate: { path: "peserta", select: "nama jenisKelamin" },
});

router.route("/").get(controller.getList).post(createMeasurement);
router
  .route("/:id")
  .get(controller.getById)
  .put(updateMeasurement)
  .delete(deleteMeasurement);

export default router;