import { Router } from "express";
import { protect, denyAdminWrite, denyParent } from "../middleware/authMiddleware.js";
import Announcement from "../models/Announcement.js";
import crudController from "../utils/crudController.js";

const router = Router();

router.use(protect, denyAdminWrite, denyParent);

const controller = crudController(Announcement, {
  searchFields: ["judul", "isi"],
  activity: {
    modul: "Pengumuman",
    aksi: {
      create: "menambahkan pengumuman",
      update: "mengubah pengumuman",
      delete: "menghapus pengumuman",
    },
    target: (doc) => doc.judul || "",
  },
});

router.route("/").get(controller.getList).post(controller.create);
router.route("/:id").get(controller.getById).put(controller.update).delete(controller.remove);

export default router;