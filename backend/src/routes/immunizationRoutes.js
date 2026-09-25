import { Router } from "express";
import { protect, denyAdminWrite, denyParent } from "../middleware/authMiddleware.js";
import Immunization from "../models/Immunization.js";
import Peserta from "../models/Peserta.js";
import crudController from "../utils/crudController.js";

const router = Router();

router.use(protect, denyAdminWrite, denyParent);

const controller = crudController(Immunization, {
  searchFields: ["jenisVaksin", "catatan"],
  searchRefs: [{ path: "peserta", Model: Peserta, field: "nama" }],
  populate: { path: "peserta", select: "nama nik jenisKelamin" },
  activity: {
    modul: "Imunisasi",
    aksi: {
      create: "mencatat imunisasi",
      update: "mengubah imunisasi",
      delete: "menghapus imunisasi",
    },
    target: (doc) => `${doc.peserta?.nama || ""} (${doc.jenisVaksin || ""})`,
  },
});

router.route("/").get(controller.getList).post(controller.create);
router.route("/:id").get(controller.getById).put(controller.update).delete(controller.remove);

export default router;