import mongoose from "mongoose";

const vitaminSchema = new mongoose.Schema(
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
    jenisVitamin: {
      type: String,
      required: [true, "Jenis vitamin wajib diisi"],
      trim: true,
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

const Vitamin = mongoose.model("Vitamin", vitaminSchema);

export default Vitamin;