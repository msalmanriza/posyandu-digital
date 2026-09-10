import { Router } from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import {
  resetDataCollections,
  purgeUsers,
  seedDefaultUsers,
  countUsers,
} from "../utils/dbReset.js";

const router = Router();

router.post(
  "/reset",
  protect,
  authorize("admin"),
  async (req, res) => {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        message: "Endpoint ini hanya tersedia untuk lingkungan development",
      });
    }

    const { purgeUsers: purge = false } = req.body || {};

    try {
      const results = await resetDataCollections();

      let users;
      if (purge) {
        const deleted = await purgeUsers();
        const reseed = await seedDefaultUsers();
        users = { deleted, reseed };
      } else {
        users = {
          deleted: 0,
          reseed: [],
          preserved: await countUsers(),
        };
      }

      res.json({ ok: true, results, users });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;