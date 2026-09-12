import mongoose from "mongoose";

const skriningLansiaSchema = new mongoose.Schema(
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
    riwayatPenyakit: {
      type: [String],
      default: [],
    },
    merokok: {
      type: String,
      enum: ["Ya", "Tidak"],
      default: "Tidak",
    },
    makanSehari: {
      type: Number,
      min: [0, "Frekuensi makan tidak valid"],
    },
    mandi: {
      type: String,
      enum: ["Tergantung", "Perlu Bantuan", "Mandiri"],
      default: "Mandiri",
    },
    perawatanDiri: {
      type: String,
      enum: ["Tergantung", "Perlu Bantuan", "Mandiri"],
      default: "Mandiri",
    },
    berpakaian: {
      type: String,
      enum: ["Tergantung", "Perlu Bantuan", "Mandiri"],
      default: "Mandiri",
    },
    kontrolBAB: {
      type: String,
      enum: ["Tergantung", "Perlu Bantuan", "Mandiri"],
      default: "Mandiri",
    },
    kontrolBAK: {
      type: String,
      enum: ["Tergantung", "Perlu Bantuan", "Mandiri"],
      default: "Mandiri",
    },
    toileting: {
      type: String,
      enum: ["Tergantung", "Perlu Bantuan", "Mandiri"],
      default: "Mandiri",
    },
    berpindah: {
      type: String,
      enum: ["Tergantung", "Perlu Bantuan", "Mandiri"],
      default: "Mandiri",
    },
    berjalan: {
      type: String,
      enum: ["Tergantung", "Perlu Bantuan", "Mandiri"],
      default: "Mandiri",
    },
    naikTangga: {
      type: String,
      enum: ["Tergantung", "Perlu Bantuan", "Mandiri"],
      default: "Mandiri",
    },
    makan: {
      type: String,
      enum: ["Tergantung", "Perlu Bantuan", "Mandiri"],
      default: "Mandiri",
    },
    skorBarthel: {
      type: Number,
      min: [0, "Skor Barthel tidak valid"],
      max: [20, "Skor Barthel tidak valid"],
      default: 20,
    },
    kognitif: {
      type: String,
      enum: ["Normal", "Perlu Evaluasi Kognitif"],
      default: "Normal",
    },
    mobilitas: {
      type: String,
      enum: ["Mandiri", "Perlu Bantuan", "Tergantung"],
      default: "Mandiri",
    },
    malnutrisi: {
      type: String,
      enum: ["Normal", "Berisiko Malnutrisi", "Malnutrisi"],
      default: "Normal",
    },
    penglihatan: {
      type: String,
      enum: ["Baik", "Gangguan"],
      default: "Baik",
    },
    pendengaran: {
      type: String,
      enum: ["Baik", "Gangguan"],
      default: "Baik",
    },
    kesimpulan: {
      type: String,
      enum: ["Sehat / Mandiri", "Perlu Pemantauan", "Rujuk ke Puskesmas"],
      default: "Sehat / Mandiri",
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

const SkriningLansia = mongoose.model("SkriningLansia", skriningLansiaSchema);

export default SkriningLansia;