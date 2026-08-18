import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    kegiatan: {
      type: String,
      required: [true, "Kegiatan wajib diisi"],
      trim: true,
      maxlength: [150, "Kegiatan maksimal 150 karakter"],
    },
    tanggal: {
      type: Date,
      required: [true, "Tanggal wajib diisi"],
    },
    lokasi: {
      type: String,
      trim: true,
    },
    keterangan: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;