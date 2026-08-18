import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { formatTanggal, hitungUmur, getKategoriUmur } from "../utils/helpers";

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

function ParentPesertaDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "parent") return;
    api
      .get(`/parent/peserta/${id}`)
      .then(({ data }) => {
        setData(data);
        setError("");
      })
      .catch((err) => setError(err.response?.data?.message || "Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [user?.role, id]);

  if (user?.role !== "parent") {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return <div className="text-center py-10 text-gray-400">Memuat data...</div>;
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <p className="text-red-600">{error || "Data tidak ditemukan"}</p>
        <Link
          to="/parent/peserta"
          className="inline-block mt-4 text-sm text-primary-600 hover:text-primary-700"
        >
          ← Kembali ke Profil Peserta
        </Link>
      </div>
    );
  }

  const { peserta, measurements, immunizations } = data;
  const kategori = getKategoriUmur(peserta.tanggalLahir);

  const info = [
    { label: "Jenis Kelamin", value: peserta.jenisKelamin === "L" ? "Laki-laki" : "Perempuan" },
    { label: "Usia", value: hitungUmur(peserta.tanggalLahir) },
    { label: "Berat Lahir", value: peserta.beratLahir != null ? `${peserta.beratLahir} kg` : "-" },
    { label: "Tinggi Lahir", value: peserta.tinggiLahir != null ? `${peserta.tinggiLahir} cm` : "-" },
    { label: "Status BPJS", value: peserta.statusBPJSAnak || "Tidak" },
    { label: "Alamat", value: peserta.alamat || "-" },
  ];

  return (
    <div className="space-y-6">
      <Link
        to="/parent/peserta"
        className="inline-flex items-center text-sm text-gray-500 hover:text-primary-600"
      >
        ← Kembali ke Profil Peserta
      </Link>

      <div className="bg-white rounded-2xl shadow-sm p-6">
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
                  kategoriColors[kategori] || "bg-gray-100 text-gray-600"
                }`}
              >
                {kategori}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          {info.map((f) => (
            <div key={f.label} className="border border-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-500">{f.label}</p>
              <p className="text-sm font-semibold text-gray-800 mt-1 break-words">
                {f.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Riwayat Penimbangan</h2>
        {measurements.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada data penimbangan</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Berat (kg)</th>
                  <th className="px-4 py-3 font-medium">Tinggi (cm)</th>
                  <th className="px-4 py-3 font-medium">LILA (cm)</th>
                  <th className="px-4 py-3 font-medium">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m) => (
                  <tr key={m._id} className="border-b border-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatTanggal(m.tanggal)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {m.beratBadan}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {m.tinggiBadan ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {m.lingkarLengan ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{m.catatan || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Riwayat Imunisasi</h2>
        {immunizations.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada data imunisasi</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Jenis Vaksin</th>
                  <th className="px-4 py-3 font-medium">Usia Saat Ini (bln)</th>
                </tr>
              </thead>
              <tbody>
                {immunizations.map((i) => (
                  <tr key={i._id} className="border-b border-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatTanggal(i.tanggal)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {i.jenisVaksin}
                    </td>
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

export default ParentPesertaDetail;