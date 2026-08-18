import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Tidak terautentikasi, silakan login terlebih dahulu" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "Token tidak valid" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token tidak valid atau kadaluarsa" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: `Akses ditolak untuk role ${req.user.role}` });
    }
    next();
  };
};

export const denyAdminWrite = (req, res, next) => {
  if (
    req.user?.role === "admin" &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)
  ) {
    return res.status(403).json({
      message: "Admin hanya memiliki akses baca (read-only / monitoring)",
    });
  }
  next();
};

export const denyParent = (req, res, next) => {
  if (req.user?.role === "parent") {
    return res.status(403).json({
      message: "Orang tua hanya dapat mengakses Portal Orang Tua",
    });
  }
  next();
};