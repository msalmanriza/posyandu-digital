import { Router } from "express";
import { protect, denyAdminWrite, denyParent } from "../middleware/authMiddleware.js";
import PemeriksaanRemaja from "../models/PemeriksaanRemaja.js";
import Peserta from "../models/Peserta.js";
import crudController from "../utils/crudController.js";

const router = Router();

router.use(protect, denyAdminWrite, denyParent);

const controller = crudController(PemeriksaanRemaja, {
  searchFields: ["jenis", "statusAnemia", "catatanRujukan", "topikPenyuluhan", "catatan"],
  searchRefs: [{ path: "peserta", Model: Peserta, field: "nama" }],
  populate: { path: "peserta", select: "nama nik jenisKelamin tanggalLahir" },
  activity: {
    modul: "Pemeriksaan Anak Sekolah & Remaja",
    aksi: {
      create: "mencatat pemeriksaan anak sekolah & remaja",
      update: "mengubah pemeriksaan anak sekolah & remaja",
      delete: "menghapus pemeriksaan anak sekolah & remaja",
    },
    target: (doc) => `${doc.peserta?.nama || ""} (${doc.jenis || ""})`,
  },
});

router.route("/").get(controller.getList).post(controller.create);
router.route("/:id").get(controller.getById).put(controller.update).delete(controller.remove);

export default router;