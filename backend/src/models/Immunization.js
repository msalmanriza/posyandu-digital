import mongoose from "mongoose";

const immunizationSchema = new mongoose.Schema(
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
    jenisVaksin: {
      type: String,
      required: [true, "Jenis vaksin wajib diisi"],
      trim: true,
    },
    usiaBulan: {
      type: Number,
      min: [0, "Usia bulan tidak valid"],
    },
    catatan: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Immunization = mongoose.model("Immunization", immunizationSchema);

export default Immunization;