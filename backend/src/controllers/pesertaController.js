import Peserta from "../models/Peserta.js";
import logActivity from "../utils/logActivity.js";

const recordLog = async (req, aksi, target) => {
  return logActivity({
    userId: req.user?._id,
    namaUser: req.user?.nama,
    role: req.user?.role,
    modul: "Peserta",
    aksi,
    target,
  });
};

export const getPesertas = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = search
      ? {
          $or: [
            { nama: { $regex: search, $options: "i" } },
            { namaOrangTua: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const pesertas = await Peserta.find(filter)
      .populate("orangTua", "nama nik telepon alamat")
      .sort({ createdAt: -1 });
    res.json(pesertas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPeserta = async (req, res) => {
  try {
    const peserta = await Peserta.findById(req.params.id).populate(
      "orangTua",
      "nama nik telepon alamat"
    );
    if (!peserta) {
      return res.status(404).json({ message: "Peserta tidak ditemukan" });
    }
    res.json(peserta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPeserta = async (req, res) => {
  try {
    const peserta = await Peserta.create(req.body);
    const populated = await Peserta.findById(peserta._id).populate(
      "orangTua",
      "nama nik telepon alamat"
    );
    await recordLog(req, "menambahkan peserta", populated?.nama || "");
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePeserta = async (req, res) => {
  try {
    const peserta = await Peserta.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("orangTua", "nama nik telepon alamat");
    if (!peserta) {
      return res.status(404).json({ message: "Peserta tidak ditemukan" });
    }
    await recordLog(req, "mengubah peserta", peserta?.nama || "");
    res.json(peserta);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePeserta = async (req, res) => {
  try {
    const peserta = await Peserta.findByIdAndDelete(req.params.id);
    if (!peserta) {
      return res.status(404).json({ message: "Peserta tidak ditemukan" });
    }
    await recordLog(req, "menghapus peserta", peserta?.nama || "");
    res.json({ message: "Peserta berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};