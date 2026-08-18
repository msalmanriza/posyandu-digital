import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
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
    statusKehadiran: {
      type: String,
      enum: ["Hadir", "Tidak Hadir", "Sakit", "Izin"],
      required: [true, "Status kehadiran wajib diisi"],
      default: "Hadir",
    },
  },
  {
    timestamps: true,
  }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;