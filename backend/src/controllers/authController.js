import jwt from "jsonwebtoken";
import User from "../models/User.js";
import OrangTua from "../models/OrangTua.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export const register = async (req, res) => {
  try {
    const { nama, email, password, role, orangTua } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const user = await User.create({
      nama,
      email,
      password,
      role: role || "kader",
      orangTua: orangTua || undefined,
    });

    res.status(201).json({
      _id: user._id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerParent = async (req, res) => {
  try {
    const {
      nama,
      email,
      password,
      telepon,
      alamat,
      tanggalLahir,
      statusKb,
      statusHamil,
      statusBPJS,
    } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({ message: "Nama, email, dan password wajib diisi" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const nik = `900${String(Date.now())}`;

    const umur = tanggalLahir
      ? Math.max(
          0,
          Math.floor(
            (Date.now() - new Date(tanggalLahir).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        )
      : undefined;

    const orangTua = await OrangTua.create({
      nama,
      nik,
      jenisKelamin: "P",
      umur,
      tanggalLahir: tanggalLahir || undefined,
      statusKb: statusKb || "Tidak",
      statusHamil: statusHamil || "Tidak",
      statusBPJS: statusBPJS || "Tidak",
      telepon: telepon || "",
      alamat: alamat || "",
    });

    const user = await User.create({
      nama,
      email,
      password,
      role: "parent",
      orangTua: orangTua._id,
    });

    res.status(201).json({
      _id: user._id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Data sudah terdaftar, coba email lain" });
    }
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password wajib diisi" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    if (!user.aktif) {
      return res.status(403).json({ message: "Akun Anda dinonaktifkan" });
    }

    res.json({
      _id: user._id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json({
      _id: user._id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      orangTua: user.orangTua,
      aktif: user.aktif,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};