import mongoose from "mongoose";
import Peserta from "./Peserta.js";

const statusPancaIndra = {
  type: String,
  enum: ["Normal", "Gangguan"],
  default: "Normal",
};

const hitungUsiaTahun = (tanggalLahir) => {
  const lahir = new Date(tanggalLahir);
  const now = new Date();
  let tahun = now.getFullYear() - lahir.getFullYear();
  let bulan = now.getMonth() - lahir.getMonth();
  if (bulan < 0) {
    tahun -= 1;
    bulan += 12;
  }
  return tahun;
};

const pemeriksaanRemajaSchema = new mongoose.Schema(
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
    jenis: {
      type: String,
      enum: ["Anamnesis Awal", "Berkala 6 Bulan", "Tahunan Remaja Putri"],
      default: "Anamnesis Awal",
    },
    riwayatKeluarga: {
      type: [String],
      default: [],
    },
    riwayatDiri: {
      type: [String],
      default: [],
    },
    penglihatanKanan: statusPancaIndra,
    penglihatanKiri: statusPancaIndra,
    pendengaranKanan: statusPancaIndra,
    pendengaranKiri: statusPancaIndra,
    kadarHb: {
      type: Number,
      min: [0, "Kadar Hb tidak valid"],
      max: [25, "Kadar Hb tidak valid"],
    },
    statusAnemia: {
      type: String,
      trim: true,
      default: "",
    },
    topikPenyuluhan: {
      type: String,
      trim: true,
      default: "",
    },
    catatanRujukan: {
      type: String,
      trim: true,
      default: "",
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

const validasiUsiaPeserta = (peserta, jenis) => {
  const usia = hitungUsiaTahun(peserta.tanggalLahir);
  if (usia < 6 || usia > 18) {
    return new Error(
      "Peserta harus berusia 6 - 18 tahun (data master Peserta Posyandu)"
    );
  }
  if (jenis === "Tahunan Remaja Putri" && peserta.jenisKelamin !== "P") {
    return new Error(
      "Pemeriksaan tahunan khusus remaja putri hanya untuk peserta perempuan"
    );
  }
  return null;
};

pemeriksaanRemajaSchema.pre("save", async function (next) {
  if (!this.peserta) return next();
  try {
    const peserta = await Peserta.findById(this.peserta).select(
      "jenisKelamin tanggalLahir"
    );
    if (!peserta) {
      return next(new Error("Peserta tidak ditemukan pada data master"));
    }
    const err = validasiUsiaPeserta(peserta, this.jenis);
    return next(err || undefined);
  } catch (error) {
    return next(error);
  }
});

pemeriksaanRemajaSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  const pesertaId = update?.peserta ?? update?.$set?.peserta;
  if (!pesertaId) return next();
  try {
    const peserta = await Peserta.findById(pesertaId).select(
      "jenisKelamin tanggalLahir"
    );
    if (!peserta) {
      return next(new Error("Peserta tidak ditemukan pada data master"));
    }
    const jenis = update?.jenis ?? update?.$set?.jenis ?? this.getQuery().jenis;
    const err = validasiUsiaPeserta(peserta, jenis);
    return next(err || undefined);
  } catch (error) {
    return next(error);
  }
});

const PemeriksaanRemaja = mongoose.model(
  "PemeriksaanRemaja",
  pemeriksaanRemajaSchema
);

export default PemeriksaanRemaja;