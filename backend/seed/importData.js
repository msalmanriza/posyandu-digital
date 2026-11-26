import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import OrangTua from "../src/models/OrangTua.js";
import Peserta from "../src/models/Peserta.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sesuaikan nama file jika di folder seed bernama lain
const JSON_PATH = path.join(__dirname, "posyandu_web.json");

function normalizeNik(val) {
  if (!val) return undefined;
  const cleaned = String(val).replace(/\D/g, "").trim();
  return cleaned.length === 16 ? cleaned : undefined;
}

function normalizeGender(val, fallback = "L") {
  if (!val) return fallback;
  const s = String(val).trim().toUpperCase();
  if (["L", "LAKI-LAKI", "LAKI", "M"].includes(s)) return "L";
  if (["P", "PEREMPUAN", "WANITA", "F"].includes(s)) return "P";
  return fallback;
}

function normalizeYaTidak(val, fallback = "Tidak") {
  if (typeof val === "boolean") return val ? "Ya" : "Tidak";
  if (!val) return fallback;
  const s = String(val).trim().toLowerCase();
  if (["ya", "yes", "true", "1", "aktif"].includes(s)) return "Ya";
  if (["tidak", "no", "false", "0", "nonaktif"].includes(s)) return "Tidak";
  return fallback;
}

function parseDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function runImport() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!mongoUri) {
    throw new Error("URI MongoDB tidak ditemukan di .env");
  }

  await mongoose.connect(mongoUri);
  console.log("Terhubung ke MongoDB");

  const raw = JSON.parse(fs.readFileSync(JSON_PATH, "utf-8"));
  const listOrangTua = raw.orang_tua || [];
  const listPeserta = raw.peserta || [];

  const groupKeyToId = new Map();
  let otCount = 0;

  // 1. Upsert OrangTua & simpan mapping _group_key -> _id
  for (const item of listOrangTua) {
    const nik = normalizeNik(item.nik);
    const payload = {
      nama: item.nama ? String(item.nama).trim() : "Tanpa Nama",
      ...(nik ? { nik } : {}),
      jenisKelamin: normalizeGender(item.jenisKelamin, "L"),
      ...(item.umur !== undefined && item.umur !== null && item.umur !== ""
        ? { umur: Number(item.umur) }
        : {}),
      ...(parseDate(item.tanggalLahir) ? { tanggalLahir: parseDate(item.tanggalLahir) } : {}),
      statusBPJS: normalizeYaTidak(item.statusBPJS, "Tidak"),
      ...(item.jumlahAnak !== undefined && item.jumlahAnak !== null && item.jumlahAnak !== ""
        ? { jumlahAnak: Number(item.jumlahAnak) }
        : {}),
      telepon: item.telepon ? String(item.telepon).trim() : undefined,
      alamat: item.alamat ? String(item.alamat).trim() : undefined,
    };

    const filter = nik
      ? { nik }
      : { nama: payload.nama, alamat: payload.alamat || null };

    const doc = await OrangTua.findOneAndUpdate(
      filter,
      { $set: payload },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    if (item._group_key) {
      groupKeyToId.set(item._group_key, doc._id);
    }
    otCount += 1;
  }

  let psCount = 0;
  let psSkipped = 0;

  // 2. Upsert Peserta dengan relasi orangTua
  for (const p of listPeserta) {
    const tglLahir = parseDate(p.tanggalLahir);
    if (!p.nama || !tglLahir) {
      psSkipped += 1;
      console.warn("Lewati peserta karena nama/tanggalLahir tidak valid:", p.nama);
      continue;
    }

    const parentId = p._parent_group_key ? groupKeyToId.get(p._parent_group_key) : undefined;
    const nikAnak = p.nik ? String(p.nik).trim() : undefined;

    const payload = {
      nama: String(p.nama).trim(),
      ...(nikAnak ? { nik: nikAnak } : {}),
      jenisKelamin: normalizeGender(p.jenisKelamin, "L"),
      tanggalLahir: tglLahir,
      ...(parentId ? { orangTua: parentId } : {}),
      namaOrangTua: p.namaOrangTua ? String(p.namaOrangTua).trim() : undefined,
      alamat: p.alamat ? String(p.alamat).trim() : undefined,
      statusBPJSAnak: normalizeYaTidak(p.statusBPJSAnak, "Tidak"),
    };

    const filter = nikAnak
      ? { nik: nikAnak, nama: payload.nama }
      : { nama: payload.nama, tanggalLahir: payload.tanggalLahir };

    await Peserta.findOneAndUpdate(
      filter,
      { $set: payload },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    psCount += 1;
  }

  console.log(`Selesai! OrangTua diproses: ${otCount} | Peserta diproses: ${psCount} | Dilewati: ${psSkipped}`);
  await mongoose.disconnect();
}

runImport().catch(async (err) => {
  console.error("Error saat import:", err);
  await mongoose.disconnect();
  process.exit(1);
});