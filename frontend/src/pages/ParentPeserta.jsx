import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { hitungUmur, getKategoriUmur } from "../utils/helpers";

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

const emojiAnak = (tanggalLahir) => {
  const lahir = new Date(tanggalLahir);
  const now = new Date();
  const bulan =
    (now.getFullYear() - lahir.getFullYear()) * 12 +
    (now.getMonth() - lahir.getMonth());
  return bulan < 24 ? "👶" : "🧒";
};

function ParentPeserta() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "parent") return;
    api
      .get("/parent/peserta")
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
        <h1 className="text-2xl font-bold text-gray-800">Profil Peserta</h1>
        <p className="text-gray-500 mt-1">
          Data lengkap anak Anda yang terdaftar di posyandu.
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
          Belum ada anak terdaftar
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((row) => {
            const kategori = getKategoriUmur(row.tanggalLahir);
            return (
              <div
                key={row._id}
                className="bg-white rounded-2xl shadow-sm p-5 flex flex-col"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center text-3xl">
                    {emojiAnak(row.tanggalLahir)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 text-lg truncate">
                      {row.nama}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          kategoriColors[kategori] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {kategori}
                      </span>
                      <span className="text-sm text-gray-500">
                        {hitungUmur(row.tanggalLahir)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-sm text-gray-600">
                  <p>
                    Jenis Kelamin:{" "}
                    <span className="font-medium text-gray-800">
                      {row.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
                    </span>
                  </p>
                  <p>
                    Berat Lahir:{" "}
                    <span className="font-medium text-gray-800">
                      {row.beratLahir != null ? `${row.beratLahir} kg` : "-"}
                    </span>
                  </p>
                  <p>
                    Tinggi Lahir:{" "}
                    <span className="font-medium text-gray-800">
                      {row.tinggiLahir != null ? `${row.tinggiLahir} cm` : "-"}
                    </span>
                  </p>
                  <p>
                    Status BPJS:{" "}
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        row.statusBPJSAnak === "Ya"
                          ? "bg-primary-100 text-primary-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {row.statusBPJSAnak || "Tidak"}
                    </span>
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to={`/parent/peserta/${row._id}`}
                    className="block w-full text-center px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Lihat Profil & Riwayat →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ParentPeserta;