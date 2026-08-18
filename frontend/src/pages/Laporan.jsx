import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import { inputClass, labelClass } from "../components/ui";
import { formatTanggal } from "../utils/helpers";

const bulanNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const statusColors = {
  Hadir: "bg-primary-100 text-primary-700",
  "Tidak Hadir": "bg-red-100 text-red-700",
  Sakit: "bg-amber-100 text-amber-700",
  Izin: "bg-blue-100 text-blue-700",
};

function Laporan() {
  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());
  const [rekap, setRekap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const years = [];
  for (let y = now.getFullYear(); y >= 2020; y--) {
    years.push(y);
  }

  const fetchRekap = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/reports/rekap", {
        params: { bulan, tahun },
      });
      setRekap(data);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  }, [bulan, tahun]);

  useEffect(() => {
    fetchRekap();
  }, [fetchRekap]);

  const exportExcel = async () => {
    if (!rekap) return;
    const XLSX = await import("xlsx");
    const ringkasan = [
      { Keterangan: "Periode", Nilai: rekap.periode.label },
      { Keterangan: "Total Penimbangan", Nilai: rekap.penimbangan.total },
      { Keterangan: "Total Imunisasi", Nilai: rekap.imunisasi.total },
      { Keterangan: "Total Kehadiran", Nilai: rekap.kehadiran.total },
      { Keterangan: "Hadir", Nilai: rekap.kehadiran.hadir },
      { Keterangan: "Tidak Hadir", Nilai: rekap.kehadiran.tidakHadir },
      { Keterangan: "Sakit", Nilai: rekap.kehadiran.sakit },
      { Keterangan: "Izin", Nilai: rekap.kehadiran.izin },
    ];
    const penimbanganRows = rekap.penimbangan.data.map((d) => ({
      Tanggal: formatTanggal(d.tanggal),
      "Nama Peserta": d.peserta?.nama || "-",
      "Berat Badan (kg)": d.beratBadan,
      "Tinggi Badan (cm)": d.tinggiBadan ?? "",
      "Lingkar Kepala (cm)": d.lingkarKepala ?? "",
      Catatan: d.catatan || "",
    }));
    const imunisasiRows = rekap.imunisasi.data.map((d) => ({
      Tanggal: formatTanggal(d.tanggal),
      "Nama Peserta": d.peserta?.nama || "-",
      "Jenis Vaksin": d.jenisVaksin,
      "Usia (bln)": d.usiaBulan ?? "",
    }));
    const kehadiranRows = rekap.kehadiran.data.map((d) => ({
      Tanggal: formatTanggal(d.tanggal),
      "Nama Peserta": d.peserta?.nama || "-",
      Status: d.statusKehadiran,
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(ringkasan),
      "Ringkasan"
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(penimbanganRows),
      "Penimbangan"
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(imunisasiRows),
      "Imunisasi"
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(kehadiranRows),
      "Kehadiran"
    );
    XLSX.writeFile(
      wb,
      `Laporan_Posyandu_${rekap.periode.label.replace(/\s+/g, "_")}.xlsx`
    );
  };

  const summaryCards = [
    {
      label: "Penimbangan",
      value: rekap?.penimbangan?.total ?? 0,
      icon: "⚖️",
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Imunisasi",
      value: rekap?.imunisasi?.total ?? 0,
      icon: "💉",
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "Kehadiran",
      value: rekap?.kehadiran?.total ?? 0,
      icon: "📋",
      color: "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Laporan Pelayanan Posyandu
        </h1>
        <p className="text-center text-gray-600 mt-1">
          {rekap?.periode?.label || `${bulanNames[bulan - 1]} ${tahun}`}
        </p>
        <hr className="my-4" />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan Bulanan</h1>
          <p className="text-gray-500 mt-1">
            Rekap data pelayanan berdasarkan bulan & tahun.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className={labelClass}>Bulan</label>
            <select
              value={bulan}
              onChange={(e) => setBulan(Number(e.target.value))}
              className={`${inputClass} w-40`}
            >
              {bulanNames.map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Tahun</label>
            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className={`${inputClass} w-32`}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportExcel}
              disabled={!rekap}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
            >
              ⬇ Export Excel
            </button>
            <button
              onClick={() => window.print()}
              disabled={!rekap}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 rounded-lg disabled:opacity-50"
            >
              🖨 Cetak / PDF
            </button>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading && !rekap ? (
        <div className="text-center py-10 text-gray-400">Memuat laporan...</div>
      ) : (
        rekap && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {summaryCards.map((card) => (
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
                    <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                    <p className="text-sm text-gray-500">{card.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap gap-2 print:hidden">
              <span className="text-sm font-medium text-gray-600">
                Rincian Kehadiran:
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                Hadir: {rekap.kehadiran.hadir}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                Tidak Hadir: {rekap.kehadiran.tidakHadir}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                Sakit: {rekap.kehadiran.sakit}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                Izin: {rekap.kehadiran.izin}
              </span>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
                <h2 className="px-4 pt-4 font-semibold text-gray-800">
                  Rekap Penimbangan
                </h2>
                <table className="w-full text-sm mt-2">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="px-4 py-3 font-medium">No</th>
                      <th className="px-4 py-3 font-medium">Tanggal</th>
                      <th className="px-4 py-3 font-medium">Peserta</th>
                      <th className="px-4 py-3 font-medium">Berat (kg)</th>
                      <th className="px-4 py-3 font-medium">Tinggi (cm)</th>
                      <th className="px-4 py-3 font-medium">LK (cm)</th>
                      <th className="px-4 py-3 font-medium">Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rekap.penimbangan.data.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-6 text-center text-gray-400">
                          Tidak ada data
                        </td>
                      </tr>
                    ) : (
                      rekap.penimbangan.data.map((d, i) => (
                        <tr key={d._id} className="border-b border-gray-50">
                          <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {formatTanggal(d.tanggal)}
                          </td>
                          <td className="px-4 py-3 text-gray-800 font-medium">
                            {d.peserta?.nama || "-"}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{d.beratBadan}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {d.tinggiBadan ?? "-"}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {d.lingkarKepala ?? "-"}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {d.catatan || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
                <h2 className="px-4 pt-4 font-semibold text-gray-800">
                  Rekap Imunisasi
                </h2>
                <table className="w-full text-sm mt-2">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="px-4 py-3 font-medium">No</th>
                      <th className="px-4 py-3 font-medium">Tanggal</th>
                      <th className="px-4 py-3 font-medium">Peserta</th>
                      <th className="px-4 py-3 font-medium">Jenis Vaksin</th>
                      <th className="px-4 py-3 font-medium">Usia (bln)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rekap.imunisasi.data.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-6 text-center text-gray-400">
                          Tidak ada data
                        </td>
                      </tr>
                    ) : (
                      rekap.imunisasi.data.map((d, i) => (
                        <tr key={d._id} className="border-b border-gray-50">
                          <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {formatTanggal(d.tanggal)}
                          </td>
                          <td className="px-4 py-3 text-gray-800 font-medium">
                            {d.peserta?.nama || "-"}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{d.jenisVaksin}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {d.usiaBulan ?? "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
                <h2 className="px-4 pt-4 font-semibold text-gray-800">
                  Rekap Kehadiran
                </h2>
                <table className="w-full text-sm mt-2">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="px-4 py-3 font-medium">No</th>
                      <th className="px-4 py-3 font-medium">Tanggal</th>
                      <th className="px-4 py-3 font-medium">Peserta</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rekap.kehadiran.data.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-6 text-center text-gray-400">
                          Tidak ada data
                        </td>
                      </tr>
                    ) : (
                      rekap.kehadiran.data.map((d, i) => (
                        <tr key={d._id} className="border-b border-gray-50">
                          <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {formatTanggal(d.tanggal)}
                          </td>
                          <td className="px-4 py-3 text-gray-800 font-medium">
                            {d.peserta?.nama || "-"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                statusColors[d.statusKehadiran] ||
                                "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {d.statusKehadiran}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}

export default Laporan;