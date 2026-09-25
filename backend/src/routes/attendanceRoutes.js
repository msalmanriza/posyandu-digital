import { Router } from "express";
import { protect, denyAdminWrite, denyParent } from "../middleware/authMiddleware.js";
import Attendance from "../models/Attendance.js";
import Peserta from "../models/Peserta.js";
import crudController from "../utils/crudController.js";

const router = Router();

router.use(protect, denyAdminWrite, denyParent);

const controller = crudController(Attendance, {
  searchFields: ["statusKehadiran"],
  searchRefs: [{ path: "peserta", Model: Peserta, field: "nama" }],
  populate: { path: "peserta", select: "nama nik jenisKelamin" },
  activity: {
    modul: "Kehadiran",
    aksi: {
      create: "mencatat kehadiran",
      update: "mengubah kehadiran",
      delete: "menghapus kehadiran",
    },
    target: (doc) => `${doc.peserta?.nama || ""} (${doc.statusKehadiran || ""})`,
  },
});

router.route("/").get(controller.getList).post(controller.create);
router.route("/:id").get(controller.getById).put(controller.update).delete(controller.remove);

export default router;