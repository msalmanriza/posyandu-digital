import OrangTua from "../models/OrangTua.js";
import Peserta from "../models/Peserta.js";
import Measurement from "../models/Measurement.js";
import Immunization from "../models/Immunization.js";
import Vitamin from "../models/Vitamin.js";
import Schedule from "../models/Schedule.js";

const getChildren = (req) => {
  if (!req.user?.orangTua) return Promise.resolve([]);
  return Peserta.find({ orangTua: req.user.orangTua }).sort({ createdAt: -1 });
};

const getChildById = async (req, res) => {
  if (!req.user?.orangTua) return null;
  const peserta = await Peserta.findOne({
    _id: req.params.id,
    orangTua: req.user.orangTua,
  });
  if (!peserta) {
    res.status(404).json({ message: "Peserta tidak ditemukan" });
    return null;
  }
  return peserta;
};

export const getDashboard = async (req, res) => {
  try {
    const orangTua = await OrangTua.findById(req.user.orangTua);
    const peserta = await getChildren(req);
    const childIds = peserta.map((p) => p._id);

    const [measurements, immunizations, vitamins, schedules] =
      await Promise.all([
        Measurement.find({ peserta: { $in: childIds } }).sort({
          tanggal: -1,
          createdAt: -1,
        }),
        Immunization.find({ peserta: { $in: childIds } }).sort({
          tanggal: -1,
          createdAt: -1,
        }),
        Vitamin.find({ peserta: { $in: childIds } }).sort({
          tanggal: -1,
          createdAt: -1,
        }),
        Schedule.find().sort({ tanggal: 1 }),
      ]);

    const now = new Date();
    const nextSchedule =
      schedules.find((s) => new Date(s.tanggal) >= now) || null;

    res.json({
      orangTua,
      peserta,
      summary: {
        lastMeasurement: measurements[0] || null,
        lastImmunization: immunizations[0] || null,
        lastVitamin: vitamins[0] || null,
        nextSchedule,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfil = async (req, res) => {
  try {
    const orangTua = await OrangTua.findById(req.user.orangTua);
    if (!orangTua) {
      return res
        .status(404)
        .json({ message: "Profil orang tua tidak ditemukan" });
    }
    const jumlahAnak = await Peserta.countDocuments({
      orangTua: orangTua._id,
    });
    res.json({ orangTua, jumlahAnak });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPesertaList = async (req, res) => {
  try {
    res.json(await getChildren(req));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPesertaDetail = async (req, res) => {
  try {
    const peserta = await getChildById(req, res);
    if (!peserta) return;
    const [measurements, immunizations] = await Promise.all([
      Measurement.find({ peserta: peserta._id }).sort({
        tanggal: -1,
        createdAt: -1,
      }),
      Immunization.find({ peserta: peserta._id }).sort({
        tanggal: -1,
        createdAt: -1,
      }),
    ]);
    res.json({ peserta, measurements, immunizations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPenimbangan = async (req, res) => {
  try {
    const peserta = await getChildren(req);
    const childIds = peserta.map((p) => p._id);
    const records = await Measurement.find({ peserta: { $in: childIds } })
      .populate("peserta", "nama jenisKelamin tanggalLahir")
      .sort({ tanggal: -1, createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getImunisasi = async (req, res) => {
  try {
    const peserta = await getChildren(req);
    const childIds = peserta.map((p) => p._id);
    const records = await Immunization.find({ peserta: { $in: childIds } })
      .populate("peserta", "nama jenisKelamin tanggalLahir")
      .sort({ tanggal: -1, createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJadwal = async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ tanggal: 1, createdAt: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
