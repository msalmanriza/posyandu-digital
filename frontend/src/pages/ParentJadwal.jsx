import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { formatTanggal } from "../utils/helpers";

function ParentJadwal() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "parent") return;
    api
      .get("/parent/jadwal")
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

  const now = new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Jadwal Posyandu</h1>
        <p className="text-gray-500 mt-1">
          Jadwal kegiatan posyandu yang akan datang (read-only).
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Memuat data...</div>
      ) : error ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-red-600">
          {error}
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm py-12 text-center text-gray-400">
          Belum ada jadwal posyandu
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((s) => {
            const isUpcoming = new Date(s.tanggal) >= now;
            return (
              <div
                key={s._id}
                className={`bg-white rounded-2xl shadow-sm p-5 ${
                  isUpcoming ? "ring-2 ring-primary-600" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {s.kegiatan}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatTanggal(s.tanggal)}
                    </p>
                  </div>
                  {isUpcoming && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 whitespace-nowrap">
                      Akan datang
                    </span>
                  )}
                </div>
                {s.lokasi && (
                  <p className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                    📍 {s.lokasi}
                  </p>
                )}
                {s.keterangan && (
                  <p className="mt-1.5 text-sm text-gray-500">{s.keterangan}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ParentJadwal;