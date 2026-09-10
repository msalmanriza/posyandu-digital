import User from "../models/User.js";
import OrangTua from "../models/OrangTua.js";
import Peserta from "../models/Peserta.js";
import Measurement from "../models/Measurement.js";
import Immunization from "../models/Immunization.js";
import Vitamin from "../models/Vitamin.js";
import Attendance from "../models/Attendance.js";
import Schedule from "../models/Schedule.js";
import Announcement from "../models/Announcement.js";
import Log from "../models/Log.js";

export const DATA_COLLECTIONS = [
  { name: "OrangTua", model: OrangTua },
  { name: "Peserta", model: Peserta },
  { name: "Penimbangan (Measurement)", model: Measurement },
  { name: "Imunisasi (Immunization)", model: Immunization },
  { name: "Vitamin", model: Vitamin },
  { name: "Kehadiran (Attendance)", model: Attendance },
  { name: "Jadwal (Schedule)", model: Schedule },
  { name: "Pengumuman (Announcement)", model: Announcement },
  { name: "Log Aktivitas (Log)", model: Log },
];

export const resetDataCollections = async () => {
  const results = [];
  for (const c of DATA_COLLECTIONS) {
    const { deletedCount } = await c.model.deleteMany({});
    results.push({ collection: c.name, deletedCount });
  }
  return results;
};

export const purgeUsers = async () => {
  const { deletedCount } = await User.deleteMany({});
  return deletedCount;
};

export const countUsers = async () => {
  return User.countDocuments();
};

export const seedDefaultUsers = async () => {
  const kaderPassword = process.env.SEED_KADER_PASSWORD || "kader21ilp";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin21ilp";

  const defaults = [
    {
      nama: "Admin Posyandu",
      email: (process.env.SEED_ADMIN_EMAIL || "admin@posyandu.id").toLowerCase(),
      password: adminPassword,
      role: "admin",
    },
    {
      nama: "Kader RT 01",
      email: "kader.rt01@posyandu.id",
      password: kaderPassword,
      role: "kader",
    },
    {
      nama: "Kader RT 02",
      email: "kader.rt02@posyandu.id",
      password: kaderPassword,
      role: "kader",
    },
    {
      nama: "Kader RT 03",
      email: "kader.rt03@posyandu.id",
      password: kaderPassword,
      role: "kader",
    },
    {
      nama: "Kader RT 04",
      email: "kader.rt04@posyandu.id",
      password: kaderPassword,
      role: "kader",
    },
    {
      nama: "Kader RT 05",
      email: "kader.rt05@posyandu.id",
      password: kaderPassword,
      role: "kader",
    },
  ];

  const created = [];
  for (const d of defaults) {
    const exists = await User.findOne({ email: d.email });
    if (exists) {
      created.push({
        email: d.email,
        role: d.role,
        status: "sudah ada, dilewati",
      });
      continue;
    }
    const user = await User.create(d);
    created.push({
      email: user.email,
      role: user.role,
      status: "dibuat",
    });
  }
  return created;
};