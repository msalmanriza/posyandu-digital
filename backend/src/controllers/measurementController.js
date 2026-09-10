import Measurement from "../models/Measurement.js";
import Immunization from "../models/Immunization.js";
import Vitamin from "../models/Vitamin.js";
import Peserta from "../models/Peserta.js";
import logActivity from "../utils/logActivity.js";
import { getKmsZone } from "../utils/kmsReference.js";

const populateOpt = { path: "peserta", select: "nama jenisKelamin" };

const recordLog = async (req, aksi, target) => {
  return logActivity({
    userId: req.user?._id,
    namaUser: req.user?.nama,
    emailUser: req.user?.email,
    role: req.user?.role,
    modul: "Penimbangan",
    aksi,
    target: typeof target === "string" ? target : target?.peserta?.nama || "",
  });
};

const hitungUsiaBulan = (tanggalLahir, atDate) => {
  if (!tanggalLahir) return undefined;
  const lahir = new Date(tanggalLahir);
  const now = atDate ? new Date(atDate) : new Date();
  const bulan =
    (now.getFullYear() - lahir.getFullYear()) * 12 +
    (now.getMonth() - lahir.getMonth());
  return bulan >= 0 ? bulan : undefined;
};

const hitungStatusGizi = async (pesertaId, beratBadan, tanggal) => {
  if (!pesertaId || beratBadan == null) return undefined;
  const peserta = await Peserta.findById(pesertaId).select(
    "tanggalLahir jenisKelamin"
  );
  if (!peserta) return undefined;
  const usia = hitungUsiaBulan(peserta.tanggalLahir, tanggal);
  const zone = getKmsZone(Number(beratBadan), usia, peserta.jenisKelamin);
  return zone?.key;
};

const getUsiaBulan = async (pesertaId) => {
  const peserta = await Peserta.findById(pesertaId).select("tanggalLahir");
  return hitungUsiaBulan(peserta?.tanggalLahir);
};

const catatImunisasi = async (pesertaId, tanggal, jenisVaksin) => {
  const usiaBulan = await getUsiaBulan(pesertaId);
  return Immunization.create({ tanggal, peserta: pesertaId, jenisVaksin, usiaBulan });
};

const catatVitamin = async (pesertaId, tanggal, jenisVitamin) => {
  return Vitamin.create({ tanggal, peserta: pesertaId, jenisVitamin });
};

export const createMeasurement = async (req, res) => {
  try {
    const { imunisasi, vitamin } = req.body;
    const statusGizi = await hitungStatusGizi(
      req.body.peserta,
      req.body.beratBadan,
      req.body.tanggal
    );
    const measurement = await Measurement.create({ ...req.body, statusGizi });

    if (imunisasi) {
      const record = await catatImunisasi(
        measurement.peserta,
        measurement.tanggal,
        imunisasi
      );
      measurement.imunisasiRecord = record._id;
      await measurement.save();
    }
    if (vitamin) {
      const record = await catatVitamin(
        measurement.peserta,
        measurement.tanggal,
        vitamin
      );
      measurement.vitaminRecord = record._id;
      await measurement.save();
    }

    const populated = await Measurement.findById(measurement._id).populate(
      populateOpt
    );
    await recordLog(req, "mencatat penimbangan", populated);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateMeasurement = async (req, res) => {
  try {
    const existing = await Measurement.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const { imunisasi, vitamin, tanggal, peserta, ...rest } = req.body;
    const newTanggal = tanggal || existing.tanggal;
    const newPeserta = peserta || existing.peserta;

    if (imunisasi) {
      if (existing.imunisasiRecord) {
        await Immunization.findByIdAndUpdate(existing.imunisasiRecord, {
          tanggal: newTanggal,
          peserta: newPeserta,
          jenisVaksin: imunisasi,
        });
      } else {
        const record = await catatImunisasi(newPeserta, newTanggal, imunisasi);
        existing.imunisasiRecord = record._id;
      }
    } else if (existing.imunisasiRecord) {
      await Immunization.findByIdAndDelete(existing.imunisasiRecord);
      existing.imunisasiRecord = undefined;
    }

    if (vitamin) {
      if (existing.vitaminRecord) {
        await Vitamin.findByIdAndUpdate(existing.vitaminRecord, {
          tanggal: newTanggal,
          peserta: newPeserta,
          jenisVitamin: vitamin,
        });
      } else {
        const record = await catatVitamin(newPeserta, newTanggal, vitamin);
        existing.vitaminRecord = record._id;
      }
    } else if (existing.vitaminRecord) {
      await Vitamin.findByIdAndDelete(existing.vitaminRecord);
      existing.vitaminRecord = undefined;
    }

    const statusGizi = await hitungStatusGizi(
      newPeserta,
      rest.beratBadan ?? existing.beratBadan,
      newTanggal
    );

    Object.assign(existing, rest, {
      tanggal: newTanggal,
      peserta: newPeserta,
      imunisasi,
      vitamin,
      statusGizi,
    });
    await existing.save();

    const populated = await Measurement.findById(existing._id).populate(
      populateOpt
    );
    await recordLog(req, "mengubah penimbangan", populated);
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteMeasurement = async (req, res) => {
  try {
    const measurement = await Measurement.findByIdAndDelete(req.params.id);
    if (!measurement) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }
    const target = await Peserta.findById(measurement.peserta).select("nama");
    await recordLog(req, "menghapus penimbangan", target?.nama || "");
    if (measurement.imunisasiRecord) {
      await Immunization.findByIdAndDelete(measurement.imunisasiRecord);
    }
    if (measurement.vitaminRecord) {
      await Vitamin.findByIdAndDelete(measurement.vitaminRecord);
    }
    res.json({ message: "Data berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};