import mongoose from "mongoose";

const pilihanYaTidak = {
  type: String,
  enum: ["Ya", "Tidak"],
  default: "Tidak",
};

const statusPancaIndra = {
  type: String,
  enum: ["Normal", "Gangguan"],
  default: "Normal",
};

const pemeriksaanDewasaSchema = new mongoose.Schema(
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
      enum: ["Rutin Bulanan", "Berkala 6 Bulan", "Berkala Tahunan"],
      default: "Rutin Bulanan",
    },
    riwayatPenyakitKeluarga: {
      type: [String],
      default: [],
    },
    riwayatPenyakitDiri: {
      type: [String],
      default: [],
    },
    merokok: pilihanYaTidak,
    konsumsiGula: pilihanYaTidak,
    konsumsiGaram: pilihanYaTidak,
    konsumsiLemak: pilihanYaTidak,
    beratBadan: {
      type: Number,
      min: [0, "Berat badan tidak valid"],
    },
    tinggiBadan: {
      type: Number,
      min: [0, "Tinggi badan tidak valid"],
    },
    lingkarPerut: {
      type: Number,
      min: [0, "Lingkar perut tidak valid"],
    },
    lila: {
      type: Number,
      min: [0, "LILA tidak valid"],
    },
    tdSistolik: {
      type: Number,
      min: [0, "Tekanan darah tidak valid"],
    },
    tdDiastolik: {
      type: Number,
      min: [0, "Tekanan darah tidak valid"],
    },
    gulaDarah: {
      type: Number,
      min: [0, "Kadar gula darah tidak valid"],
    },
    imt: {
      type: Number,
      default: null,
    },
    kategoriIMT: {
      type: String,
      default: "",
    },
    kategoriTD: {
      type: String,
      default: "",
    },
    kategoriGula: {
      type: String,
      default: "",
    },
    gejalaBatuk: pilihanYaTidak,
    gejalaDemam: pilihanYaTidak,
    penurunanBeratBadan: pilihanYaTidak,
    kontakTBC: pilihanYaTidak,
    alatKontrasepsi: pilihanYaTidak,
    penglihatanKanan: statusPancaIndra,
    penglihatanKiri: statusPancaIndra,
    pendengaranKanan: statusPancaIndra,
    pendengaranKiri: statusPancaIndra,
    puKelamin: {
      type: Number,
      default: 0,
    },
    puUsia: {
      type: Number,
      default: 0,
    },
    puRokok: {
      type: Number,
      default: 0,
    },
    puSesak: {
      type: Number,
      default: 0,
    },
    puDahak: {
      type: Number,
      default: 0,
    },
    puBatuk: {
      type: Number,
      default: 0,
    },
    puSpirometri: {
      type: Number,
      default: 0,
    },
    skorPUMA: {
      type: Number,
      default: null,
    },
    kategoriPUMA: {
      type: String,
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

const PemeriksaanDewasa = mongoose.model(
  "PemeriksaanDewasa",
  pemeriksaanDewasaSchema
);

export default PemeriksaanDewasa;