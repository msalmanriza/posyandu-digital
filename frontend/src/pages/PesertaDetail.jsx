import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { formatTanggal, hitungUmur, getKategoriUmur } from "../utils/helpers";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const kategoriColors = {
  Bayi: "bg-primary-100 text-primary-700",
  Batita: "bg-blue-100 text-blue-700",
  Anak: "bg-amber-100 text-amber-700",
  Remaja: "bg-purple-100 text-purple-700",
  Dewasa: "bg-green-100 text-green-700",
  Pralansia: "bg-orange-100 text-orange-700",
  Lansia: "bg-red-100 text-red-700",
  Lainnya: "bg-gray-100 text-gray-600",
};

const statusColors = {
  Hadir: "bg-primary-100 text-primary-700",
  "Tidak Hadir": "bg-red-100 text-red-700",
  Sakit: "bg-amber-100 text-amber-700",
  Izin: "bg-blue-100 text-blue-700",
};

function PesertaDetail() {
  const { id } = useParams();
  const [peserta, setPeserta] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [immunizations, setImmunizations] = useState([]);
  const [vitamins, setVitamins] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [p, m, i, v, a] = await Promise.all([
          api.get(`/peserta/${id}`),
          api.get(`/measurements`, { params: { peserta: id } }),
          api.get(`/immunizations`, { params: { peserta: id } }),
          api.get(`/vitamins`, { params: { peserta: id } }),
          api.get(`/attendance`, { params: { peserta: id } }),
        ]);
        setPeserta(p.data);
        setMeasurements(m.data);
        setImmunizations(i.data);
        setVitamins(v.data);
        setAttendance(a.data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Gagal memuat detail peserta");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-400">Memuat detail...</div>
    );
  }

  if (error || !peserta) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
        <p className="text-red-600">{error || "Peserta tidak ditemukan"}</p>
        <Link
          to="/peserta"
          className="inline-block mt-4 text-sm text-primary-600 hover:text-primary-700"
        >
          ← Kembali ke Peserta
        </Link>
      </div>
    );
  }

  const kategoriRow = getKategoriUmur(peserta.tanggalLahir);
  const lastMeasurement = measurements[0] || null;
  const lastImun = immunizations[0] || null;
  const lastVit = vitamins[0] || null;
  const lastAtt = attendance[0] || null;

  const chartData = [...measurements]
    .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
    .map((m) => ({
      tanggal: formatTanggal(m.tanggal),
      "Berat (kg)": m.beratBadan,
      "Tinggi (cm)": m.tinggiBadan ?? null,
    }));

  const statCards = [
    { label: "Nama Peserta", value: peserta.nama },
    { label: "Usia", value: hitungUmur(peserta.tanggalLahir) },
    {
      label: "Berat Terakhir",
      value: lastMeasurement ? `${lastMeasurement.beratBadan} kg` : "-",
    },
    {
      label: "Tinggi Terakhir",
      value: lastMeasurement?.tinggiBadan
        ? `${lastMeasurement.tinggiBadan} cm`
        : "-",
    },
    {
      label: "Imunisasi Terakhir",
      value: lastImun?.jenisVaksin || "-",
    },
    { label: "Vitamin Terakhir", value: lastVit?.jenisVitamin || "-" },
  ];

  return (
    <div className="space-y-6">
      <Link
        to="/peserta"
        className="inline-flex items-center text-sm text-gray-500 hover:text-primary-600"
      >
        ← Kembali ke Peserta
      </Link>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold">
              {peserta.nama.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{peserta.nama}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-gray-500">
                <span>{peserta.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</span>
                <span>•</span>
                <span>{hitungUmur(peserta.tanggalLahir)}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    kategoriColors[kategoriRow] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {kategoriRow}
                </span>
                <span>•</span>
                <span>Ortu: {peserta.namaOrangTua || "-"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className="text-base font-bold text-gray-800 mt-1 break-words">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">
          Grafik Pertumbuhan (Berat Badan & Tinggi Badan)
        </h2>
        {chartData.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl h-72 flex flex-col items-center justify-center text-gray-400">
            <div className="text-4xl mb-3">📈</div>
            <p className="font-medium">Belum ada data penimbangan</p>
            <p className="text-sm mt-1">
              Grafik akan tampil setelah ada riwayat penimbangan
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Berat (kg)"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="Tinggi (cm)"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Riwayat Terakhir</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-500">Imunisasi Terakhir</p>
            <p className="font-semibold text-gray-800 mt-1">
              {lastImun?.jenisVaksin || "-"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {lastImun ? formatTanggal(lastImun.tanggal) : "Belum ada"}
            </p>
          </div>
          <div className="border border-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-500">Vitamin Terakhir</p>
            <p className="font-semibold text-gray-800 mt-1">
              {lastVit?.jenisVitamin || "-"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {lastVit ? formatTanggal(lastVit.tanggal) : "Belum ada"}
            </p>
          </div>
          <div className="border border-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-500">Status Kehadiran Terakhir</p>
            <p className="mt-1">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  lastAtt
                    ? statusColors[lastAtt.statusKehadiran] ||
                      "bg-gray-100 text-gray-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {lastAtt?.statusKehadiran || "Belum ada"}
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {lastAtt ? formatTanggal(lastAtt.tanggal) : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PesertaDetail;