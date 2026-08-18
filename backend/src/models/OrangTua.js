import mongoose from "mongoose";

const orangTuaSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, "Nama wajib diisi"],
      trim: true,
      maxlength: [100, "Nama maksimal 100 karakter"],
    },
    nik: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
      minlength: [16, "NIK harus 16 digit"],
      maxlength: [16, "NIK harus 16 digit"],
    },
    jenisKelamin: {
      type: String,
      enum: ["L", "P"],
      default: "L",
    },
    umur: {
      type: Number,
      required: [true, "Umur orang tua wajib diisi"],
      min: [15, "Umur tidak valid"],
      max: [100, "Umur tidak valid"],
    },
    statusKb: {
      type: String,
      enum: ["Ya", "Tidak"],
      default: "Tidak",
    },
    jumlahAnak: {
      type: Number,
      required: [true, "Jumlah anak wajib diisi"],
      min: [0, "Jumlah anak tidak valid"],
    },
    statusHamil: {
      type: String,
      enum: ["Ya", "Tidak"],
      default: "Tidak",
    },
    statusBPJS: {
      type: String,
      enum: ["Ya", "Tidak"],
      default: "Tidak",
    },
    telepon: {
      type: String,
      trim: true,
    },
    alamat: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const OrangTua = mongoose.model("OrangTua", orangTuaSchema);

export default OrangTua;