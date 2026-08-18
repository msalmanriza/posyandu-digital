import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    judul: {
      type: String,
      required: [true, "Judul wajib diisi"],
      trim: true,
      maxlength: [150, "Judul maksimal 150 karakter"],
    },
    isi: {
      type: String,
      required: [true, "Isi pengumuman wajib diisi"],
      trim: true,
    },
    tanggal: {
      type: Date,
      required: [true, "Tanggal wajib diisi"],
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;