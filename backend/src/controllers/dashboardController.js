import Peserta from "../models/Peserta.js";
import Measurement from "../models/Measurement.js";
import Immunization from "../models/Immunization.js";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import Log from "../models/Log.js";

const buildYearTrend = async () => {
  const year = new Date().getFullYear();
  const trend = [];
  for (let m = 0; m < 12; m++) {
    const start = new Date(year, m, 1);
    const end = new Date(year, m + 1, 1);
    const agg = await Measurement.aggregate([
      { $match: { tanggal: { $gte: start, $lt: end } } },
      {
        $lookup: {
          from: "pesertas",
          localField: "peserta",
          foreignField: "_id",
          as: "p",
        },
      },
      { $unwind: { path: "$p", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          beratBadan: 1,
          tinggiBadan: 1,
          umurBln: {
            $cond: {
              if: { $and: ["$p.tanggalLahir", "$tanggal"] },
              then: {
                $max: [
                  0,
                  {
                    $floor: {
                      $divide: [
                        {
                          $dateDiff: {
                            startDate: "$p.tanggalLahir",
                            endDate: "$tanggal",
                            unit: "day",
                          },
                        },
                        30.44,
                      ],
                    },
                  },
                ],
              },
              else: null,
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          berat: { $avg: "$beratBadan" },
          tinggi: { $avg: "$tinggiBadan" },
          umur: { $avg: "$umurBln" },
        },
      },
    ]);
    trend.push({
      bulan: m + 1,
      tahun: year,
      label: start.toLocaleString("id-ID", { month: "short" }),
      rataBerat: agg.length ? Math.round(agg[0].berat * 100) / 100 : 0,
      rataTinggi: agg.length ? Math.round((agg[0].tinggi || 0) * 100) / 100 : 0,
      rataUmurBln: agg.length ? Math.round(agg[0].umur || 0) : 0,
    });
  }
  return trend;
};

export const getTrendBerat = async (req, res) => {
  try {
    res.json(await buildYearTrend());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );

    const [
      totalPeserta,
      penimbanganBulanIni,
      imunisasiBulanIni,
      kehadiranBulanIni,
    ] = await Promise.all([
      Peserta.countDocuments(),
      Measurement.countDocuments({
        tanggal: { $gte: startOfMonth, $lt: startOfNextMonth },
      }),
      Immunization.countDocuments({
        tanggal: { $gte: startOfMonth, $lt: startOfNextMonth },
      }),
      Attendance.countDocuments({
        tanggal: { $gte: startOfMonth, $lt: startOfNextMonth },
      }),
    ]);

    res.json({
      totalPeserta,
      penimbanganBulanIni,
      imunisasiBulanIni,
      kehadiranBulanIni,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );
    const monthFilter = {
      tanggal: { $gte: startOfMonth, $lt: startOfNextMonth },
    };

    const [totalPeserta, totalKader, penimbanganBulanIni, kehadiranBulanIni, hadirBulanIni] =
      await Promise.all([
        Peserta.countDocuments(),
        User.countDocuments({ role: "kader", aktif: true }),
        Measurement.countDocuments(monthFilter),
        Attendance.countDocuments(monthFilter),
        Attendance.countDocuments({ ...monthFilter, statusKehadiran: "Hadir" }),
      ]);

    const tingkatKehadiran =
      kehadiranBulanIni > 0
        ? Math.round((hadirBulanIni / kehadiranBulanIni) * 100)
        : 0;

    const trend = await buildYearTrend();

    res.json({
      totalPeserta,
      totalKader,
      penimbanganBulanIni,
      tingkatKehadiran,
      trend,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActivities = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const activities = await Log.find().sort({ createdAt: -1 }).limit(limit);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};