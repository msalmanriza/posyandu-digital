import { Router } from "express";
import { register, registerParent, login, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/register-parent", registerParent);
router.post("/login", login);
router.get("/me", protect, getMe);

export default router;