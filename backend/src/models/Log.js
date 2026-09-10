import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    namaUser: { type: String, trim: true },
    emailUser: { type: String, trim: true },
    role: { type: String, trim: true },
    modul: { type: String, trim: true },
    aksi: { type: String, trim: true },
    target: { type: String, trim: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

logSchema.index({ createdAt: -1 });

const Log = mongoose.model("Log", logSchema);

export default Log;
