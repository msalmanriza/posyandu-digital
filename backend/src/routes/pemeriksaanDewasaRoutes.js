import { Router } from "express";
import { protect, denyAdminWrite, denyParent } from "../middleware/authMiddleware.js";
import PemeriksaanDewasa from "../models/PemeriksaanDewasa.js";
import Peserta from "../models/Peserta.js";
import crudController from "../utils/crudController.js";

const router = Router();

router.use(protect, denyAdminWrite, denyParent);

const controller = crudController(PemeriksaanDewasa, {
  searchFields: ["jenis", "kategoriPUMA", "catatan", "kategoriIMT"],
  searchRefs: [{ path: "peserta", Model: Peserta, field: "nama" }],
  populate: { path: "peserta", select: "nama nik jenisKelamin tanggalLahir" },
  activity: {
    modul: "Pemeriksaan Dewasa & Lansia",
    aksi: {
      create: "mencatat pemeriksaan dewasa/lansia",
      update: "mengubah pemeriksaan dewasa/lansia",
      delete: "menghapus pemeriksaan dewasa/lansia",
    },
    target: (doc) => `${doc.peserta?.nama || ""} (${doc.jenis || ""})`,
  },
});

router.route("/").get(controller.getList).post(controller.create);
router.route("/:id").get(controller.getById).put(controller.update).delete(controller.remove);

export default router;