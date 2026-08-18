import mongoose from "mongoose";

const pesertaSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, "Nama wajib diisi"],
      trim: true,
      maxlength: [100, "Nama maksimal 100 karakter"],
    },
    nik: {
      type: String,
      trim: true,
    },
    jenisKelamin: {
      type: String,
      enum: ["L", "P"],
      required: [true, "Jenis kelamin wajib diisi"],
    },
    tanggalLahir: {
      type: Date,
      required: [true, "Tanggal lahir wajib diisi"],
    },
    beratLahir: {
      type: Number,
      min: [0, "Berat lahir tidak valid"],
    },
    tinggiLahir: {
      type: Number,
      min: [0, "Tinggi lahir tidak valid"],
    },
    orangTua: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrangTua",
    },
    namaOrangTua: {
      type: String,
      trim: true,
    },
    alamat: {
      type: String,
      trim: true,
    },
    statusBPJSAnak: {
      type: String,
      enum: ["Ya", "Tidak"],
      default: "Tidak",
    },
  },
  {
    timestamps: true,
  }
);

const Peserta = mongoose.model("Peserta", pesertaSchema);

export default Peserta;