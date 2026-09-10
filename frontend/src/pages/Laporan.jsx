import { useCallback, useEffect, useMemo, useState } from "react";
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

const kategoriOptions = [
  { value: "", label: "Semua Kategori" },
  { value: "balita", label: "Balita (1 - 59 Bulan)" },
  { value: "prasekolah-remaja", label: "Anak Prasekolah & Remaja (6 - 18 Tahun)" },
  { value: "produktif-dewasa", label: "Usia Produktif & Dewasa (19 - 59 Tahun)" },
  { value: "lansia", label: "Lansia (>= 60 Tahun)" },
];

const hitungUmurBulan = (tanggalLahir, tanggal) => {
  if (!tanggalLahir) return null;
  const lahir = new Date(tanggalLahir);
  const tgl = tanggal ? new Date(tanggal) : new Date();
  return Math.max(
    0,
    (tgl.getFullYear() - lahir.getFullYear()) * 12 +
      (tgl.getMonth() - lahir.getMonth())
  );
};

const cocokKategori = (umurBulan, kategori) => {
  if (!kategori) return true;
  if (umurBulan == null) return false;
  switch (kategori) {
    case "balita":
      return umurBulan >= 1 && umurBulan <= 59;
    case "prasekolah-remaja":
      return umurBulan >= 72 && umurBulan <= 216;
    case "produktif-dewasa":
      return umurBulan >= 228 && umurBulan <= 708;
    case "lansia":
      return umurBulan >= 720;
    default:
      return true;
  }
};

function Laporan() {
  const now = new Date();
  const [selectedBulan, setSelectedBulan] = useState(now.getMonth() + 1);
  const [selectedTahun, setSelectedTahun] = useState(now.getFullYear());
  const [selectedKategori, setSelectedKategori] = useState("");
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
        params: { selectedBulan, selectedTahun },
      });
      setRekap(data);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  }, [selectedBulan, selectedTahun]);

  useEffect(() => {
    fetchRekap();
  }, [fetchRekap]);

  const filteredRekap = useMemo(() => {
    if (!rekap) return null;
    const filterData = (arr) =>
      arr.filter((d) =>
        cocokKategori(
          hitungUmurBulan(d.peserta?.tanggalLahir, d.tanggal),
          selectedKategori
        )
      );

    const penimbangan = filterData(rekap.penimbangan.data);
    const imunisasi = filterData(rekap.imunisasi.data);
    const kehadiran = filterData(rekap.kehadiran.data);
    const hadir = kehadiran.filter((k) => k.statusKehadiran === "Hadir").length;
    const tidakHadir = kehadiran.filter(
      (k) => k.statusKehadiran === "Tidak Hadir"
    ).length;
    const sakit = kehadiran.filter((k) => k.statusKehadiran === "Sakit").length;
    const izin = kehadiran.filter((k) => k.statusKehadiran === "Izin").length;

    return {
      ...rekap,
      penimbangan: { total: penimbangan.length, data: penimbangan },
      imunisasi: { total: imunisasi.length, data: imunisasi },
      kehadiran: { total: kehadiran.length, hadir, tidakHadir, sakit, izin, data: kehadiran },
    };
  }, [rekap, selectedKategori]);

  const handleExportExcel = async () => {
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

  const handleExportPDF = () => {
    if (!filteredRekap) return;
    window.print();
  };

  const summaryCards = [
    {
      label: "Penimbangan",
      value: filteredRekap?.penimbangan?.total ?? 0,
      icon: "⚖️",
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Imunisasi",
      value: filteredRekap?.imunisasi?.total ?? 0,
      icon: "💉",
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "Kehadiran",
      value: filteredRekap?.kehadiran?.total ?? 0,
      icon: "📋",
      color: "bg-purple-100 text-purple-700",
    },
  ];

  const kategoriLabel =
    kategoriOptions.find((k) => k.value === selectedKategori)?.label || "";

  return (
    <div className="space-y-6">
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Laporan Pelayanan Posyandu
        </h1>
        <p className="text-center text-gray-600 mt-1">
          {rekap?.periode?.label ||
            `${bulanNames[selectedBulan - 1]} ${selectedTahun}`}
          {kategoriLabel && ` \u2014 Kategori: ${kategoriLabel}`}
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
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(Number(e.target.value))}
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
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(Number(e.target.value))}
              className={`${inputClass} w-32`}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Kategori / Usia (ILP)</label>
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className={`${inputClass} w-64 sm:w-72`}
            >
              {kategoriOptions.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              disabled={!rekap}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
            >
              ⬇ Export Excel
            </button>
            <button
              onClick={handleExportPDF}
              disabled={!filteredRekap}
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
        filteredRekap && (
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
                Hadir: {filteredRekap.kehadiran.hadir}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                Tidak Hadir: {filteredRekap.kehadiran.tidakHadir}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                Sakit: {filteredRekap.kehadiran.sakit}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                Izin: {filteredRekap.kehadiran.izin}
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
                    {(filteredRekap?.penimbangan?.data || []).length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-6 text-center text-gray-400">
                          Tidak ada data
                        </td>
                      </tr>
                    ) : (
                      (filteredRekap?.penimbangan?.data || []).map((d, i) => (
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
                    {(filteredRekap?.imunisasi?.data || []).length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-6 text-center text-gray-400">
                          Tidak ada data
                        </td>
                      </tr>
                    ) : (
                      (filteredRekap?.imunisasi?.data || []).map((d, i) => (
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
                    {(filteredRekap?.kehadiran?.data || []).length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-6 text-center text-gray-400">
                          Tidak ada data
                        </td>
                      </tr>
                    ) : (
                      (filteredRekap?.kehadiran?.data || []).map((d, i) => (
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