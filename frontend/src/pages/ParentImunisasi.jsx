import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { formatTanggal } from "../utils/helpers";

function ParentImunisasi() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "parent") return;
    api
      .get("/parent/imunisasi")
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Riwayat Imunisasi</h1>
        <p className="text-gray-500 mt-1">
          Riwayat imunisasi seluruh anak Anda (read-only).
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm">
        {loading ? (
          <div className="px-4 py-10 text-center text-gray-400">
            Memuat data...
          </div>
        ) : error ? (
          <div className="px-4 py-10 text-center text-red-600">{error}</div>
        ) : data.length === 0 ? (
          <div className="px-4 py-10 text-center text-gray-400">
            Belum ada data imunisasi
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Nama Anak</th>
                  <th className="px-4 py-3 font-medium">Jenis Vaksin</th>
                  <th className="px-4 py-3 font-medium">Usia Saat Ini (bln)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((i) => (
                  <tr key={i._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatTanggal(i.tanggal)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {i.peserta?.nama || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{i.jenisVaksin}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {i.usiaBulan != null ? i.usiaBulan : "-"}
                    </td>
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

export default ParentImunisasi;