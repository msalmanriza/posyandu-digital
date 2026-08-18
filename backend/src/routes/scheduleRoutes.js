import { Router } from "express";
import { protect, denyAdminWrite, denyParent } from "../middleware/authMiddleware.js";
import Schedule from "../models/Schedule.js";
import crudController from "../utils/crudController.js";

const router = Router();

router.use(protect, denyAdminWrite, denyParent);

const controller = crudController(Schedule, {
  searchFields: ["kegiatan", "lokasi", "keterangan"],
  activity: {
    modul: "Jadwal",
    aksi: {
      create: "menambahkan jadwal",
      update: "mengubah jadwal",
      delete: "menghapus jadwal",
    },
    target: (doc) => doc.kegiatan || "",
  },
});

router.route("/").get(controller.getList).post(controller.create);
router.route("/:id").get(controller.getById).put(controller.update).delete(controller.remove);

export default router;