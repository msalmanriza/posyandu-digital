import Peserta from "../models/Peserta.js";
import Measurement from "../models/Measurement.js";
import Immunization from "../models/Immunization.js";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import Log from "../models/Log.js";
import Schedule from "../models/Schedule.js";
import { getKmsZone } from "../utils/kmsReference.js";

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

const buildKunjunganTrend = async () => {
  const year = new Date().getFullYear();
  const trend = [];
  for (let m = 0; m < 12; m++) {
    const start = new Date(year, m, 1);
    const end = new Date(year, m + 1, 1);
    const filter = { tanggal: { $gte: start, $lt: end } };
    const [ditimbang, kehadiran] = await Promise.all([
      Measurement.countDocuments(filter),
      Attendance.countDocuments(filter),
    ]);
    trend.push({
      bulan: m + 1,
      tahun: year,
      label: start.toLocaleString("id-ID", { month: "short" }),
      ditimbang,
      kehadiran,
    });
  }
  return trend;
};

export const getKunjunganTrend = async (req, res) => {
  try {
    res.json(await buildKunjunganTrend());
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

const ZONA_RAW = ["bgm", "kuningBawah"];

const formatTanggalId = (d) =>
  d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const isBesok = (d) => {
  const now = new Date();
  const target = new Date(d);
  const besok = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return (
    target.getFullYear() === besok.getFullYear() &&
    target.getMonth() === besok.getMonth() &&
    target.getDate() === besok.getDate()
  );
};

const usiaBulanDi = (tanggalLahir, atDate) => {
  if (!tanggalLahir) return null;
  const d = new Date(atDate);
  const b = new Date(tanggalLahir);
  const bulan =
    (d.getFullYear() - b.getFullYear()) * 12 + (d.getMonth() - b.getMonth());
  return bulan >= 0 ? bulan : 0;
};

const getGiziAlerts = async () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const startNext = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const bulanIni = await Measurement.find({
    tanggal: { $gte: start, $lt: startNext },
  })
    .populate("peserta", "nama tanggalLahir jenisKelamin")
    .sort({ tanggal: 1 });

  const alerts = [];
  const flagged = new Set();
  for (const m of bulanIni) {
    if (!m.peserta) continue;
    const pid = String(m.peserta._id);
    if (flagged.has(pid)) continue;

    let zonaKey = m.statusGizi;
    if (!zonaKey && m.beratBadan != null) {
      const usia = usiaBulanDi(m.peserta.tanggalLahir, m.tanggal);
      zonaKey = getKmsZone(Number(m.beratBadan), usia, m.peserta.jenisKelamin)
        ?.key;
    }
    if (ZONA_RAW.includes(zonaKey)) {
      flagged.add(pid);
      const label = zonaKey === "bgm" ? "BGM" : "Gizi Kurang";
      alerts.push({
        key: `kesehatan-${pid}`,
        type: "kesehatan",
        icon: "⚠️",
        text: `PERINGATAN DINI GIZI: Balita (${m.peserta.nama}) tercatat berstatus ${label} pada penimbangan bulan ini. Segera tindak lanjut & sampaikan ke orang tua.`,
        link: `/peserta/${pid}`,
        linkLabel: "Lihat Peserta",
      });
    }
  }
  return alerts;
};

const getScheduleAlert = async () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  const next = await Schedule.find({
    tanggal: { $gte: start, $lt: end },
  })
    .sort({ tanggal: 1 })
    .limit(1)
    .lean();

  if (!next.length) return null;
  const s = next[0];
  const t = new Date(s.tanggal);
  const besok = isBesok(t);
  const ket = besok
    ? "akan dilaksanakan besok"
    : `pada ${formatTanggalId(t)}`;
  return {
    key: "jadwal",
    type: "jadwal",
    icon: "📅",
    text: `PENGINGAT JADWAL: ${s.kegiatan || "Kegiatan Posyandu"} ${ket}${
      s.lokasi ? ` di ${s.lokasi}` : ""
    }. Siapkan rekap penimbangan & kirim pengingat WhatsApp ke orang tua.`,
    link: "/jadwal",
    linkLabel: "Lihat Jadwal",
  };
};

export const getAlerts = async (req, res) => {
  try {
    const [gizi, jadwal] = await Promise.all([
      getGiziAlerts(),
      getScheduleAlert(),
    ]);
    const bulanNama = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toLocaleString("id-ID", { month: "long" });
    const alerts = [
      ...(jadwal ? [jadwal] : []),
      ...gizi,
      {
        key: "laporan",
        type: "laporan",
        icon: "📋",
        text: `PENGINGAT REKAP BULANAN: Laporan Posyandu bulan ${bulanNama} siap di-export ke PDF/Excel untuk diserahkan ke pengurus.`,
        link: "/laporan",
        linkLabel: "Ke Laporan",
      },
    ];
    res.json({ count: alerts.length, alerts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};