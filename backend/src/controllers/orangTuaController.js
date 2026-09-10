import OrangTua from "../models/OrangTua.js";
import logActivity from "../utils/logActivity.js";

const recordLog = async (req, aksi, target) => {
  return logActivity({
    userId: req.user?._id,
    namaUser: req.user?.nama,
    emailUser: req.user?.email,
    role: req.user?.role,
    modul: "Orang Tua",
    aksi,
    target,
  });
};

export const getOrangTuas = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = search
      ? {
          $or: [
            { nama: { $regex: search, $options: "i" } },
            { nik: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const orangTuas = await OrangTua.find(filter).sort({ createdAt: -1 });
    res.json(orangTuas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrangTua = async (req, res) => {
  try {
    const orangTua = await OrangTua.findById(req.params.id);
    if (!orangTua) {
      return res.status(404).json({ message: "Orang tua tidak ditemukan" });
    }
    res.json(orangTua);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrangTua = async (req, res) => {
  try {
    const orangTua = await OrangTua.create(req.body);
    await recordLog(req, "menambahkan orang tua", orangTua?.nama || "");
    res.status(201).json(orangTua);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "NIK sudah terdaftar" });
    }
    res.status(400).json({ message: error.message });
  }
};

export const updateOrangTua = async (req, res) => {
  try {
    const orangTua = await OrangTua.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!orangTua) {
      return res.status(404).json({ message: "Orang tua tidak ditemukan" });
    }
    await recordLog(req, "mengubah orang tua", orangTua?.nama || "");
    res.json(orangTua);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "NIK sudah terdaftar" });
    }
    res.status(400).json({ message: error.message });
  }
};

export const deleteOrangTua = async (req, res) => {
  try {
    const orangTua = await OrangTua.findByIdAndDelete(req.params.id);
    if (!orangTua) {
      return res.status(404).json({ message: "Orang tua tidak ditemukan" });
    }
    await recordLog(req, "menghapus orang tua", orangTua?.nama || "");
    res.json({ message: "Orang tua berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};