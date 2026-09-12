import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { formatTanggal, hitungUmur, getKategoriUmur, statusSkorBarthel } from "../utils/helpers";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [p, m, i, v, a, s, pds] = await Promise.all([
          api.get(`/peserta/${id}`),
          api.get(`/measurements`, { params: { peserta: id } }),
          api.get(`/immunizations`, { params: { peserta: id } }),
          api.get(`/vitamins`, { params: { peserta: id } }),
          api.get(`/attendance`, { params: { peserta: id } }),
          api.get(`/skrining-lansia`, { params: { peserta: id } }),
          api.get(`/pemeriksaan-dewasa`, { params: { peserta: id } }),
        ]);
        setPeserta(p.data);
        setMeasurements(m.data);
        setImmunizations(i.data);
        setVitamins(v.data);
        setAttendance(a.data);
        setSkrining(s.data);
        setPemeriksaan(pds.data);
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
  if (lansia) {
    statCards.push({
      label: "Skrining Lansia Terakhir",
      value: lastSkrining?.kesimpulan || "Belum ada",
    });
  }

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

      {lansia && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            Riwayat Skrining Lansia
          </h2>
          {skrining.length === 0 ? (
            <p className="text-sm text-gray-400">
              Belum ada data skrining lansia
            </p>
          ) : (
            <div className="space-y-4">
              {skrining.map((s) => (
                <div key={s._id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <p className="text-sm font-semibold text-gray-800">
                      {formatTanggal(s.tanggal)}
                    </p>
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        s.kesimpulan === "Rujuk ke Puskesmas"
                          ? "bg-red-100 text-red-700"
                          : s.kesimpulan === "Perlu Pemantauan"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {s.kesimpulan || "-"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Kemandirian (Barthel)</p>
                      <p className="font-medium text-gray-800 mt-0.5">
                        {s.skorBarthel != null
                          ? `${s.skorBarthel}/20 — ${statusSkorBarthel(s.skorBarthel)}`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kognitif</p>
                      <p className="font-medium text-gray-800 mt-0.5">
                        {s.kognitif || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Mobilitas</p>
                      <p className="font-medium text-gray-800 mt-0.5">
                        {s.mobilitas || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Malnutrisi</p>
                      <p className="font-medium text-gray-800 mt-0.5">
                        {s.malnutrisi || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Penglihatan</p>
                      <p className="font-medium text-gray-800 mt-0.5">
                        {s.penglihatan || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pendengaran</p>
                      <p className="font-medium text-gray-800 mt-0.5">
                        {s.pendengaran || "-"}
                      </p>
                    </div>
                  </div>

                  {Array.isArray(s.riwayatPenyakit) && s.riwayatPenyakit.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1.5">
                        Riwayat Penyakit
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {s.riwayatPenyakit.map((p) => (
                          <span
                            key={p}
                            className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {s.catatan && (
                    <p className="mt-3 text-sm text-gray-600">
                      {s.catatan}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {dewasa && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            Riwayat Pemeriksaan Dewasa &amp; Lansia
          </h2>
          {pemeriksaan.length === 0 ? (
            <p className="text-sm text-gray-400">
              Belum ada data pemeriksaan dewasa &amp; lansia
            </p>
          ) : (
            <div className="space-y-4">
              {pemeriksaan.map((pr) => (
                <div key={pr._id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <p className="text-sm font-semibold text-gray-800">
                      {formatTanggal(pr.tanggal)}
                    </p>
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        pr.jenis === "Berkala 6 Bulan"
                          ? "bg-blue-100 text-blue-700"
                          : pr.jenis === "Berkala Tahunan"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-primary-100 text-primary-700"
                      }`}
                    >
                      {pr.jenis || "-"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">IMT</p>
                      <p className="font-medium text-gray-800 mt-0.5">
                        {pr.imt != null
                          ? `${pr.imt} (${pr.kategoriIMT || "-"})`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tekanan Darah</p>
                      <p className="font-medium text-gray-800 mt-0.5">
                        {pr.tdSistolik && pr.tdDiastolik
                          ? `${pr.tdSistolik}/${pr.tdDiastolik} (${pr.kategoriTD || "-"})`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Gula Darah</p>
                      <p className="font-medium text-gray-800 mt-0.5">
                        {pr.gulaDarah != null
                          ? `${pr.gulaDarah} mg/dl (${pr.kategoriGula || "-"})`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Skor PUMA</p>
                      <p
                        className={`mt-0.5 font-semibold ${
                          pr.skorPUMA != null && pr.skorPUMA >= 5
                            ? "text-red-600"
                            : "text-gray-800"
                        }`}
                      >
                        {pr.skorPUMA != null
                          ? `${pr.skorPUMA} / 7 (${pr.kategoriPUMA || "-"})`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Penglihatan</p>
                      <p className="font-medium text-gray-800 mt-0.5">
                        {(pr.penglihatanKanan || "-") + " / " + (pr.penglihatanKiri || "-")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pendengaran</p>
                      <p className="font-medium text-gray-800 mt-0.5">
                        {(pr.pendengaranKanan || "-") + " / " + (pr.pendengaranKiri || "-")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Gejala TBC</p>
                      <p className="font-medium text-gray-800 mt-0.5">
                        {["gejalaBatuk", "gejalaDemam", "penurunanBeratBadan", "kontakTBC"].some(
                          (k) => pr[k] === "Ya"
                        )
                          ? "Ada gejala"
                          : "Tidak ada"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">KB</p>
                      <p className="font-medium text-gray-800 mt-0.5">
                        {pr.alatKontrasepsi || "-"}
                      </p>
                    </div>
                  </div>

                  {Array.isArray(pr.riwayatPenyakitDiri) && pr.riwayatPenyakitDiri.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1.5">Riwayat Penyakit Diri</p>
                      <div className="flex flex-wrap gap-1.5">
                        {pr.riwayatPenyakitDiri.map((p) => (
                          <span
                            key={p}
                            className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(pr.topikPenyuluhan || pr.catatanRujukan || pr.catatan) && (
                    <div className="mt-3 text-sm text-gray-600 space-y-1">
                      {pr.topikPenyuluhan && (
                        <p>Penyuluhan: {pr.topikPenyuluhan}</p>
                      )}
                      {pr.catatanRujukan && (
                        <p>Rujukan: {pr.catatanRujukan}</p>
                      )}
                      {pr.catatan && <p>{pr.catatan}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PesertaDetail;