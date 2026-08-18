import Measurement from "../models/Measurement.js";
import Immunization from "../models/Immunization.js";
import Attendance from "../models/Attendance.js";

export const getRekap = async (req, res) => {
  try {
    const bulan = parseInt(req.query.bulan, 10) || new Date().getMonth() + 1;
    const tahun = parseInt(req.query.tahun, 10) || new Date().getFullYear();

    if (bulan < 1 || bulan > 12) {
      return res.status(400).json({ message: "Bulan tidak valid" });
    }

    const start = new Date(tahun, bulan - 1, 1);
    const end = new Date(tahun, bulan, 1);
    const filter = { tanggal: { $gte: start, $lt: end } };

    const [penimbangan, imunisasi, kehadiran] = await Promise.all([
      Measurement.find(filter).populate("peserta", "nama").sort({ tanggal: 1 }),
      Immunization.find(filter).populate("peserta", "nama").sort({ tanggal: 1 }),
      Attendance.find(filter).populate("peserta", "nama").sort({ tanggal: 1 }),
    ]);

    const hadir = kehadiran.filter((k) => k.statusKehadiran === "Hadir").length;
    const tidakHadir = kehadiran.filter(
      (k) => k.statusKehadiran === "Tidak Hadir"
    ).length;
    const sakit = kehadiran.filter((k) => k.statusKehadiran === "Sakit").length;
    const izin = kehadiran.filter((k) => k.statusKehadiran === "Izin").length;

    const label = `${new Date(tahun, bulan - 1, 1).toLocaleString("id-ID", {
      month: "long",
    })} ${tahun}`;

    res.json({
      periode: { bulan, tahun, label },
      penimbangan: { total: penimbangan.length, data: penimbangan },
      imunisasi: { total: imunisasi.length, data: imunisasi },
      kehadiran: {
        total: kehadiran.length,
        hadir,
        tidakHadir,
        sakit,
        izin,
        data: kehadiran,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};