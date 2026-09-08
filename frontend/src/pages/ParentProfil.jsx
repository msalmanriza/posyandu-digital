import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { formatTanggal } from "../utils/helpers";

function ParentProfil() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "parent") return;
    api
      .get("/parent/profil")
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

  if (loading) {
    return <div className="text-center py-10 text-gray-400">Memuat data...</div>;
  }

  if (error || !data?.orangTua) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-red-600">
        {error || "Profil tidak ditemukan"}
      </div>
    );
  }

  const { orangTua, jumlahAnak } = data;

  const fields = [
    { label: "Nama", value: orangTua.nama },
    { label: "Nomor HP", value: orangTua.telepon || "-" },
    { label: "Umur", value: orangTua.umur != null ? `${orangTua.umur} thn` : "-" },
    {
      label: "Tanggal Lahir",
      value: formatTanggal(orangTua.tanggalLahir),
    },
    { label: "Jumlah Anak", value: jumlahAnak },
    { label: "Alamat", value: orangTua.alamat || "-" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Profil Orang Tua</h1>
          <p className="text-gray-500 mt-1">
            Data profil Anda sebagai orang tua/wali peserta posyandu.
          </p>
        </div>
        <span className="inline-flex self-start px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full">
          Mode Baca (Read-Only)
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold">
            {(orangTua.nama || "O").charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{orangTua.nama}</h2>
            <p className="text-sm text-gray-500">Orang Tua / Wali Peserta</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((f) => (
            <div
              key={f.label}
              className="border border-gray-100 rounded-xl p-4"
            >
              <p className="text-xs text-gray-500">{f.label}</p>
              <div className="font-semibold text-gray-800 mt-1">
                {f.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ParentProfil;
