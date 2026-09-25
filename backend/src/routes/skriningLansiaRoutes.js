import { Router } from "express";
import { protect, denyAdminWrite, denyParent } from "../middleware/authMiddleware.js";
import SkriningLansia from "../models/SkriningLansia.js";
import Peserta from "../models/Peserta.js";
import crudController from "../utils/crudController.js";

const router = Router();

router.use(protect, denyAdminWrite, denyParent);

const controller = crudController(SkriningLansia, {
  searchFields: ["kesimpulan", "catatan"],
  searchRefs: [{ path: "peserta", Model: Peserta, field: "nama" }],
  populate: { path: "peserta", select: "nama nik jenisKelamin tanggalLahir" },
  activity: {
    modul: "Skrining Lansia",
    aksi: {
      create: "mencatat skrining lansia",
      update: "mengubah skrining lansia",
      delete: "menghapus skrining lansia",
    },
    target: (doc) => `${doc.peserta?.nama || ""} (${doc.kesimpulan || ""})`,
  },
});

router.route("/").get(controller.getList).post(controller.create);
router.route("/:id").get(controller.getById).put(controller.update).delete(controller.remove);

export default router;