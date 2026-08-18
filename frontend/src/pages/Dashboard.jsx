import { lazy, Suspense, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import KirimWhatsApp from "../components/KirimWhatsApp";

const TrendChart = lazy(() => import("../components/TrendChart"));

const quickActions = [
  { to: "/penimbangan?input=1", icon: "⚖️", label: "Input Penimbangan", desc: "Catat berat & tinggi" },
  { to: "/imunisasi?input=1", icon: "💉", label: "Input Imunisasi", desc: "Catat riwayat vaksin" },
  { to: "/vitamin?input=1", icon: "💊", label: "Input Vitamin", desc: "Catat pemberian vitamin" },
  { to: "/kehadiran?input=1", icon: "📋", label: "Catat Kehadiran", desc: "Catat daftar hadir" },
];

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPeserta: 0,
    penimbanganBulanIni: 0,
    imunisasiBulanIni: 0,
    kehadiranBulanIni: 0,
  });
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then(({ data }) =>
        setStats({
          totalPeserta: data.totalPeserta,
          penimbanganBulanIni: data.penimbanganBulanIni,
          imunisasiBulanIni: data.imunisasiBulanIni,
          kehadiranBulanIni: data.kehadiranBulanIni,
        })
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api
      .get("/dashboard/trend-berat")
      .then(({ data }) => setTrend(data))
      .catch(() => setTrend([]));
  }, []);

  const statCards = [
    { label: "Total Peserta", value: stats.totalPeserta, icon: "👶", color: "bg-primary-100 text-primary-700" },
    { label: "Penimbangan Bulan Ini", value: stats.penimbanganBulanIni, icon: "⚖️", color: "bg-blue-100 text-blue-700" },
    { label: "Imunisasi Bulan Ini", value: stats.imunisasiBulanIni, icon: "💉", color: "bg-amber-100 text-amber-700" },
    { label: "Kehadiran Bulan Ini", value: stats.kehadiranBulanIni, icon: "📋", color: "bg-purple-100 text-purple-700" },
  ];

  if (user?.role === "admin") {
    return <Navigate to="/dashboard/admin" replace />;
  }
  if (user?.role === "parent") {
    return <Navigate to="/dashboard/parent" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Selamat datang kembali, {user?.nama || "Siti Kader"} 👋
          </h1>
          <p className="text-gray-500 mt-1">Pantau aktivitas Posyandu Anda hari ini.</p>
        </div>
        <span className="inline-flex self-start px-3 py-1 text-xs font-semibold bg-primary-100 text-primary-700 rounded-full">
          Dashboard Kader
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${card.color}`}
            >
              {card.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {loading ? "..." : card.value}
              </p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <KirimWhatsApp />

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center text-xl mb-3">
                {action.icon}
              </div>
              <p className="font-semibold text-gray-800">{action.label}</p>
              <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          Tren Rata-rata Berat & Tinggi Badan Balita
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          Rata-rata per bulan selama 12 bulan di tahun berjalan
        </p>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <Suspense
            fallback={
              <div className="py-16 text-center text-gray-400">
                Memuat grafik...
              </div>
            }
          >
            <TrendChart data={trend} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;