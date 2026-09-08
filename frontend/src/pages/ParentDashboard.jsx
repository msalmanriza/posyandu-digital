import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { formatTanggal, hitungUmur, getKategoriUmur } from "../utils/helpers";

const kategoriColors = {
  Balita: "bg-primary-100 text-primary-700",
  Apras: "bg-purple-100 text-purple-700",
  Produktif: "bg-green-100 text-green-700",
  Lansia: "bg-red-100 text-red-700",
  Lainnya: "bg-gray-100 text-gray-600",
};

const emojiAnak = (tanggalLahir) => {
  const lahir = new Date(tanggalLahir);
  const now = new Date();
  const bulan =
    (now.getFullYear() - lahir.getFullYear()) * 12 +
    (now.getMonth() - lahir.getMonth());
  return bulan < 24 ? "👶" : "🧒";
};

function ParentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    orangTua: null,
    peserta: [],
    summary: {
      lastMeasurement: null,
      lastImmunization: null,
      lastVitamin: null,
      nextSchedule: null,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "parent") return;
    api
      .get("/parent/dashboard")
      .then(({ data }) => {
        setData(data);
        setError("");
      })
      .catch((err) => setError(err.response?.data?.message || "Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [user?.role]);

  if (user?.role !== "parent") {
    return <Navigate to="/dashboard" replace />;
  }

  const {
    orangTua,
    peserta,
    summary: { lastMeasurement, lastImmunization, lastVitamin, nextSchedule },
  } = data;

  const statCards = [
    {
      label: "Berat Terakhir",
      value: lastMeasurement ? `${lastMeasurement.beratBadan} kg` : "-",
      icon: "⚖️",
      color: "bg-primary-100 text-primary-700",
    },
    {
      label: "Tinggi Terakhir",
      value: lastMeasurement?.tinggiBadan
        ? `${lastMeasurement.tinggiBadan} cm`
        : "-",
      icon: "📏",
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Imunisasi Terakhir",
      value: lastImmunization?.jenisVaksin || "-",
      icon: "💉",
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "Vitamin Terakhir",
      value: lastVitamin?.jenisVitamin || "-",
      icon: "💊",
      color: "bg-purple-100 text-purple-700",
    },
    {
      label: "Jadwal Posyandu Berikutnya",
      value: nextSchedule ? formatTanggal(nextSchedule.tanggal) : "-",
      icon: "📅",
      color: "bg-green-100 text-green-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Selamat datang, {user?.nama || "Orang Tua"} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Pantau tumbuh kembang dan jadwal kesehatan anak Anda.
          </p>
        </div>
        <span className="inline-flex self-start px-3 py-1 text-xs font-semibold bg-primary-100 text-primary-700 rounded-full">
          Portal Orang Tua
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center text-2xl">
          👨‍👩‍👧
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">{peserta.length}</p>
          <p className="text-sm text-gray-500">Jumlah anak terdaftar</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Memuat data...</div>
      ) : error ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-red-600">
          {error}
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Peserta Terdaftar
            </h2>
            {peserta.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm py-12 text-center text-gray-400">
                Belum ada anak terdaftar
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {peserta.map((row) => {
                  const kategori = getKategoriUmur(row.tanggalLahir);
                  return (
                    <div
                      key={row._id}
                      className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-2xl">
                        {emojiAnak(row.tanggalLahir)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 truncate">
                          {row.nama}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500">
                            {hitungUmur(row.tanggalLahir)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              kategoriColors[kategori] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {kategori}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/parent/peserta/${row._id}`}
                        className="text-sm text-primary-600 hover:text-primary-700 shrink-0"
                      >
                        Profil →
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Ringkasan Data Terakhir
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-3"
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${card.color}`}
                  >
                    {card.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-gray-800 truncate">
                      {card.value}
                    </p>
                    <p className="text-xs text-gray-500">{card.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ParentDashboard;