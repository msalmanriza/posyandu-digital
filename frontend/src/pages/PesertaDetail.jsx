import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { formatTanggal, hitungUmur, hitungUmurPada, getKategoriUmur, statusSkorBarthel } from "../utils/helpers";
import { KMS_ZONES } from "../utils/kmsReference";
import KmsChart from "../components/KmsChart";

const kategoriColors = {
  Balita: "bg-primary-100 text-primary-700",
  Apras: "bg-purple-100 text-purple-700",
  Produktif: "bg-green-100 text-green-700",
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
  const [skrining, setSkrining] = useState([]);
  const [pemeriksaan, setPemeriksaan] = useState([]);
  const [pemeriksaanRemaja, setPemeriksaanRemaja] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [p, m, i, v, a, s, pds, pjr] = await Promise.all([
          api.get(`/peserta/${id}`),
          api.get(`/measurements`, { params: { peserta: id } }),
          api.get(`/immunizations`, { params: { peserta: id } }),
          api.get(`/vitamins`, { params: { peserta: id } }),
          api.get(`/attendance`, { params: { peserta: id } }),
          api.get(`/skrining-lansia`, { params: { peserta: id } }),
          api.get(`/pemeriksaan-dewasa`, { params: { peserta: id } }),
          api.get(`/pemeriksaan-remaja`, { params: { peserta: id } }),
        ]);
        setPeserta(p.data);
        setMeasurements(m.data);
        setImmunizations(i.data);
        setVitamins(v.data);
        setAttendance(a.data);
        setSkrining(s.data);
        setPemeriksaan(pds.data);
        setPemeriksaanRemaja(pjr.data);
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
  const lastSkrining = skrining[0] || null;

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

  const lansia = kategoriRow === "Lansia";
  const dewasa = kategoriRow === "Produktif" || kategoriRow === "Lansia";
  const remaja = kategoriRow === "Apras";
  if (lansia) {
    statCards.push({
      label: "Skrining Lansia Terakhir",
      value: lastSkrining?.kesimpulan || "Belum ada",
    });
  }

  const gabunganDewasa = dewasa
    ? [
        ...pemeriksaan.map((pr) => ({
          id: pr._id,
          asal: "pemeriksaan",
          tanggal: pr.tanggal,
          td:
            pr.tdSistolik && pr.tdDiastolik
              ? `${pr.tdSistolik}/${pr.tdDiastolik}${pr.kategoriTD ? ` (${pr.kategoriTD})` : ""}`
              : "-",
          gula:
            pr.gulaDarah != null
              ? `${pr.gulaDarah} mg/dl${pr.kategoriGula ? ` (${pr.kategoriGula})` : ""}`
              : "-",
          imt:
            pr.imt != null
              ? `IMT ${pr.imt}${pr.kategoriIMT ? ` (${pr.kategoriIMT})` : ""}`
              : pr.lingkarPerut != null
              ? `LP ${pr.lingkarPerut} cm`
              : "-",
          puma:
            pr.skorPUMA != null
              ? `${pr.skorPUMA} / 7${pr.kategoriPUMA ? ` (${pr.kategoriPUMA})` : ""}`
              : "-",
          kemandirian: "-",
          keterangan: [
            pr.topikPenyuluhan ? `Penyuluhan: ${pr.topikPenyuluhan}` : "",
            pr.catatanRujukan ? `Rujukan: ${pr.catatanRujukan}` : "",
            pr.catatan || "",
          ]
            .filter(Boolean)
            .join(" · "),
        })),
        ...skrining.map((s) => ({
          id: s._id,
          asal: "skrining",
          tanggal: s.tanggal,
          td: "-",
          gula: "-",
          imt: "-",
          puma: "-",
          kemandirian:
            s.skorBarthel != null
              ? `${s.skorBarthel}/20 — ${statusSkorBarthel(s.skorBarthel)}`
              : "-",
          keterangan: [s.kesimpulan ? `Kesimpulan: ${s.kesimpulan}` : "", s.catatan || ""]
            .filter(Boolean)
            .join(" · "),
        })),
      ].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    : [];

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

      <KmsChart
        data={measurements}
        birthDate={peserta.tanggalLahir}
        sex={peserta.jenisKelamin}
        title="Grafik Pertumbuhan (Berat Badan / Umur)"
      />

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-1">Riwayat Penimbangan</h2>
        <p className="text-sm text-gray-500 mb-4">
          Data ini tampil sebagai titik koordinat &amp; garis tren (biru) pada
          Grafik KMS di atas.
        </p>
        {measurements.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada data penimbangan</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-4 py-3 font-medium">No</th>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Umur</th>
                  <th className="px-4 py-3 font-medium">Berat (kg)</th>
                  <th className="px-4 py-3 font-medium">Tinggi (cm)</th>
                  <th className="px-4 py-3 font-medium">Status Gizi</th>
                  <th className="px-4 py-3 font-medium">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {[...measurements]
                  .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
                  .map((m, index) => {
                    const zona = m.statusGizi
                      ? KMS_ZONES[m.statusGizi]
                      : null;
                    return (
                      <tr
                        key={m._id}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {formatTanggal(m.tanggal)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {hitungUmurPada(peserta.tanggalLahir, m.tanggal)}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {m.beratBadan}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {m.tinggiBadan ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          {zona ? (
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                zona.badge || "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {zona.label}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {m.catatan || "-"}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
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

      {remaja && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-1">
            Riwayat Pemeriksaan Anak Sekolah &amp; Remaja
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Data pemeriksaan khusus peserta usia 6 - 18 tahun.
          </p>
          {pemeriksaanRemaja.length === 0 ? (
            <p className="text-sm text-gray-400">
              Belum ada data pemeriksaan anak sekolah &amp; remaja
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="px-4 py-3 font-medium">No</th>
                    <th className="px-4 py-3 font-medium">Tanggal</th>
                    <th className="px-4 py-3 font-medium">Jenis Pemeriksaan</th>
                    <th className="px-4 py-3 font-medium">
                      Riwayat Kesehatan / Keluarga
                    </th>
                    <th className="px-4 py-3 font-medium">Hasil Penglihatan</th>
                    <th className="px-4 py-3 font-medium">Hasil Pendengaran</th>
                    <th className="px-4 py-3 font-medium">Kadar HB</th>
                    <th className="px-4 py-3 font-medium">Catatan / Rujukan</th>
                  </tr>
                </thead>
                <tbody>
                  {[...pemeriksaanRemaja]
                    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
                    .map((row, index) => (
                      <tr
                        key={row._id}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {formatTanggal(row.tanggal)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                            {row.jenis || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[220px]">
                          {(Array.isArray(row.riwayatKeluarga) &&
                            row.riwayatKeluarga.length > 0) ||
                          (Array.isArray(row.riwayatDiri) &&
                            row.riwayatDiri.length > 0) ? (
                            <div className="space-y-1.5">
                              {Array.isArray(row.riwayatKeluarga) &&
                                row.riwayatKeluarga.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    <span className="text-xs text-gray-400 mr-1">
                                      Keluarga:
                                    </span>
                                    {row.riwayatKeluarga.map((p) => (
                                      <span
                                        key={p}
                                        className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
                                      >
                                        {p}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              {Array.isArray(row.riwayatDiri) &&
                                row.riwayatDiri.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    <span className="text-xs text-gray-400 mr-1">
                                      Pribadi:
                                    </span>
                                    {row.riwayatDiri.map((p) => (
                                      <span
                                        key={p}
                                        className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700"
                                      >
                                        {p}
                                      </span>
                                    ))}
                                  </div>
                                )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {row.penglihatanKanan || "-"} / {row.penglihatanKiri || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {row.pendengaranKanan || "-"} / {row.pendengaranKiri || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.kadarHb != null ? (
                            <>
                              <span className="text-gray-700">
                                {row.kadarHb} g/dL
                              </span>{" "}
                              {row.statusAnemia && (
                                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                  {row.statusAnemia}
                                </span>
                              )}
                            </>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {[
                            row.topikPenyuluhan
                              ? `Penyuluhan: ${row.topikPenyuluhan}`
                              : "",
                            row.catatanRujukan
                              ? `Rujukan: ${row.catatanRujukan}`
                              : "",
                            row.catatan || "",
                          ]
                            .filter(Boolean)
                            .join(" · ") || "-"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {dewasa && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-1">
            Riwayat Pemeriksaan Dewasa &amp; Lansia / Skrining Lansia
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Data pemeriksaan rutin dewasa dan skrining lansia untuk peserta usia
            18 tahun ke atas.
          </p>
          {gabunganDewasa.length === 0 ? (
            <p className="text-sm text-gray-400">
              Belum ada data pemeriksaan dewasa &amp; lansia
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="px-4 py-3 font-medium">No</th>
                    <th className="px-4 py-3 font-medium">Tanggal</th>
                    <th className="px-4 py-3 font-medium">Tekanan Darah</th>
                    <th className="px-4 py-3 font-medium">Gula Darah</th>
                    <th className="px-4 py-3 font-medium">IMT / Lingkar Perut</th>
                    <th className="px-4 py-3 font-medium">Skor PUMA</th>
                    <th className="px-4 py-3 font-medium">Kemandirian AKS</th>
                    <th className="px-4 py-3 font-medium">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {gabunganDewasa.map((row, index) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatTanggal(row.tanggal)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {row.td}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {row.gula}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {row.imt}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {row.puma}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {row.kemandirian}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[280px] break-words">
                        {row.keterangan || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PesertaDetail;