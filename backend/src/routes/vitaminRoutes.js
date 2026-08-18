import { Router } from "express";
import { protect, denyAdminWrite, denyParent } from "../middleware/authMiddleware.js";
import Vitamin from "../models/Vitamin.js";
import Peserta from "../models/Peserta.js";
import crudController from "../utils/crudController.js";

const router = Router();

router.use(protect, denyAdminWrite, denyParent);

const controller = crudController(Vitamin, {
  searchFields: ["jenisVitamin", "catatan"],
  searchRefs: [{ path: "peserta", Model: Peserta, field: "nama" }],
  populate: { path: "peserta", select: "nama jenisKelamin" },
  activity: {
    modul: "Vitamin",
    aksi: {
      create: "mencatat vitamin",
      update: "mengubah vitamin",
      delete: "menghapus vitamin",
    },
    target: (doc) => `${doc.peserta?.nama || ""} (${doc.jenisVitamin || ""})`,
  },
});

router.route("/").get(controller.getList).post(controller.create);
router.route("/:id").get(controller.getById).put(controller.update).delete(controller.remove);

export default router;