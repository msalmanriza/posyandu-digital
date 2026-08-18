import mongoose from "mongoose";

const measurementSchema = new mongoose.Schema(
  {
    tanggal: {
      type: Date,
      required: [true, "Tanggal wajib diisi"],
      default: Date.now,
    },
    peserta: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Peserta",
      required: [true, "Peserta wajib diisi"],
    },
    beratBadan: {
      type: Number,
      required: [true, "Berat badan wajib diisi"],
      min: [0, "Berat badan tidak valid"],
    },
    tinggiBadan: {
      type: Number,
      min: [0, "Tinggi badan tidak valid"],
    },
    lingkarKepala: {
      type: Number,
      min: [0, "Lingkar kepala tidak valid"],
    },
    lingkarLengan: {
      type: Number,
      min: [0, "Lingkar lengan tidak valid"],
    },
    imunisasi: {
      type: String,
      trim: true,
    },
    vitamin: {
      type: String,
      trim: true,
    },
    imunisasiRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Immunization",
    },
    vitaminRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vitamin",
    },
    catatan: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Measurement = mongoose.model("Measurement", measurementSchema);

export default Measurement;