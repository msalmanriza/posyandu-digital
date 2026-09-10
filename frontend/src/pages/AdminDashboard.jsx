import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { formatTanggal } from "../utils/helpers";
import TrendChart from "../components/TrendChart";
import KirimWhatsApp from "../components/KirimWhatsApp";
import NotifBell from "../components/NotifBell";

const modulIcons = {
  Penimbangan: "⚖️",
  Imunisasi: "💉",
  Vitamin: "💊",
  Kehadiran: "📋",
  Peserta: "👶",
  "Orang Tua": "👨‍👩‍👧",
  Jadwal: "📅",
  Pengumuman: "📢",
};

function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    totalPeserta: 0,
    totalKader: 0,
    penimbanganBulanIni: 0,
    tingkatKehadiran: 0,
    trend: [],
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "admin") return;
    api
      .get("/dashboard/admin")
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.role]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    api
      .get("/dashboard/activities", { params: { limit: 10 } })
      .then(({ data }) => setActivities(data))
      .catch(() => setActivities([]));
  }, [user?.role]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    const timer = setInterval(() => {
      api
        .get("/dashboard/activities", { params: { limit: 10 } })
        .then(({ data }) => setActivities(data))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(timer);
  }, [user?.role]);

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const statCards = [
    {
      label: "Total Peserta Posyandu",
      value: data.totalPeserta,
      icon: "👶",
      color: "bg-primary-100 text-primary-700",
    },
    {
      label: "Total Kader Aktif",
      value: data.totalKader,
      icon: "🩺",
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Penimbangan Bulan Ini",
      value: data.penimbanganBulanIni,
      icon: "⚖️",
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "Tingkat Kehadiran Bulanan",
      value: `${data.tingkatKehadiran}%`,
      icon: "📈",
      color: "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Selamat datang kembali, {user?.nama || "Admin"} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Pantau aktivitas seluruh Posyandu dari satu layar.
          </p>
        </div>
        <div className="flex items-center gap-3 self-end">
          <NotifBell />
          <span className="inline-flex px-3 py-1 text-xs font-semibold bg-gray-800 text-white rounded-full">
            Dashboard Admin / Pengawas
          </span>
        </div>
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

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-1">
          Tren Rata-rata Berat & Tinggi Badan Balita
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Rata-rata per bulan selama 12 bulan di tahun berjalan
        </p>
        <TrendChart data={data.trend} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">
          Aktivitas Input Terbaru (Log Activity)
        </h2>
        {activities.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl py-10 text-center text-gray-400">
            <div className="text-4xl mb-3">🗒️</div>
            <p className="font-medium">Belum ada aktivitas tercatat</p>
            <p className="text-sm mt-1">
              Log akan muncul saat kader melakukan input data
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="py-2.5 pr-4 font-semibold">Waktu</th>
                  <th className="py-2.5 pr-4 font-semibold">Kader</th>
                  <th className="py-2.5 pr-4 font-semibold">Aktivitas</th>
                  <th className="py-2.5 font-semibold">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activities.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                      {formatTanggal(log.createdAt)}
                    </td>
                    <td className="py-3 pr-4 font-medium text-gray-800">
                      <span className="block">{log.namaUser || "-"}</span>
                      {log.emailUser && (
                        <span className="block text-xs text-gray-400 font-normal">
                          {log.emailUser}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      <span className="inline-flex items-center gap-2">
                        <span>{modulIcons[log.modul] || "📌"}</span>
                        <span className="capitalize">
                          {log.namaUser || "Seseorang"} {log.aksi || ""}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">{log.target || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;