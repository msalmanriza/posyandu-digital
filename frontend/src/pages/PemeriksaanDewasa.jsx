import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Modal from "../components/Modal";
import PesertaSelect from "../components/PesertaSelect";
import {
  inputClass,
  labelClass,
  btnPrimaryClass,
  btnSecondaryClass,
} from "../components/ui";
import {
  formatTanggal,
  todayString,
  hitungUmur,
  hitungIMT,
  kategoriIMT,
  kategoriTekananDarah,
  kategoriGulaDarah,
  skorPUMA,
  kategoriPUMA,
} from "../utils/helpers";
import {
  PENYAKIT_DEWASA_LIST,
  YA_TIDAK,
  JENIS_KUNJUNGAN_DEWASA,
  PANCA_INDRA_DEWASA,
  GEJALA_TBC_LIST,
  PUMA_ROKOK_OPTS,
  PUMA_YA_TIDAK_OPTS,
  PUMA_PERTANYAAN,
} from "../utils/constants";

const initialForm = {
  peserta: "",
  tanggal: todayString(),
  jenis: "Rutin Bulanan",
  riwayatPenyakitKeluarga: [],
  riwayatPenyakitDiri: [],
  merokok: "Tidak",
  konsumsiGula: "Tidak",
  konsumsiGaram: "Tidak",
  konsumsiLemak: "Tidak",
  beratBadan: "",
  tinggiBadan: "",
  lingkarPerut: "",
  lila: "",
  tdSistolik: "",
  tdDiastolik: "",
  gulaDarah: "",
  gejalaBatuk: "Tidak",
  gejalaDemam: "Tidak",
  penurunanBeratBadan: "Tidak",
  kontakTBC: "Tidak",
  alatKontrasepsi: "Tidak",
  penglihatanKanan: "Normal",
  penglihatanKiri: "Normal",
  pendengaranKanan: "Normal",
  pendengaranKiri: "Normal",
  puRokok: "0",
  puSesak: "0",
  puDahak: "0",
  puBatuk: "0",
  puSpirometri: "0",
  topikPenyuluhan: "",
  catatanRujukan: "",
  catatan: "",
};

const badgeJenis = {
  "Rutin Bulanan": "bg-primary-100 text-primary-700",
  "Berkala 6 Bulan": "bg-blue-100 text-blue-700",
  "Berkala Tahunan": "bg-purple-100 text-purple-700",
};

function PemeriksaanDewasa() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [tanggalFilter, setTanggalFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [pesertaInfo, setPesertaInfo] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (tanggalFilter) params.tanggal = tanggalFilter;
      if (search) params.search = search;
      const { data } = await api.get("/pemeriksaan-dewasa", { params });
      setData(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [search, tanggalFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const loadPesertaInfo = async (id) => {
    if (!id) {
      setPesertaInfo(null);
      return;
    }
    try {
      const { data } = await api.get(`/peserta/${id}`);
      setPesertaInfo(data);
    } catch {
      setPesertaInfo(null);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setPesertaInfo(null);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setPesertaInfo(row.peserta || null);
    setForm({
      peserta: row.peserta?._id || "",
      tanggal: row.tanggal ? row.tanggal.slice(0, 10) : todayString(),
      jenis: row.jenis || "Rutin Bulanan",
      riwayatPenyakitKeluarga: Array.isArray(row.riwayatPenyakitKeluarga)
        ? row.riwayatPenyakitKeluarga
        : [],
      riwayatPenyakitDiri: Array.isArray(row.riwayatPenyakitDiri)
        ? row.riwayatPenyakitDiri
        : [],
      merokok: row.merokok || "Tidak",
      konsumsiGula: row.konsumsiGula || "Tidak",
      konsumsiGaram: row.konsumsiGaram || "Tidak",
      konsumsiLemak: row.konsumsiLemak || "Tidak",
      beratBadan: row.beratBadan ?? "",
      tinggiBadan: row.tinggiBadan ?? "",
      lingkarPerut: row.lingkarPerut ?? "",
      lila: row.lila ?? "",
      tdSistolik: row.tdSistolik ?? "",
      tdDiastolik: row.tdDiastolik ?? "",
      gulaDarah: row.gulaDarah ?? "",
      gejalaBatuk: row.gejalaBatuk || "Tidak",
      gejalaDemam: row.gejalaDemam || "Tidak",
      penurunanBeratBadan: row.penurunanBeratBadan || "Tidak",
      kontakTBC: row.kontakTBC || "Tidak",
      alatKontrasepsi: row.alatKontrasepsi || "Tidak",
      penglihatanKanan: row.penglihatanKanan || "Normal",
      penglihatanKiri: row.penglihatanKiri || "Normal",
      pendengaranKanan: row.pendengaranKanan || "Normal",
      pendengaranKiri: row.pendengaranKiri || "Normal",
      puRokok: String(row.puRokok ?? 0),
      puSesak: String(row.puSesak ?? 0),
      puDahak: String(row.puDahak ?? 0),
      puBatuk: String(row.puBatuk ?? 0),
      puSpirometri: String(row.puSpirometri ?? 0),
      topikPenyuluhan: row.topikPenyuluhan || "",
      catatanRujukan: row.catatanRujukan || "",
      catatan: row.catatan || "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePesertaChange = (e) => {
    const id = e.target.value;
    setForm({ ...form, peserta: id });
    loadPesertaInfo(id);
  };

  const togglePenyakit = (key, nama) => {
    const cur = form[key] || [];
    const next = cur.includes(nama) ? cur.filter((x) => x !== nama) : [...cur, nama];
    setForm({ ...form, [key]: next });
  };

  const imt = hitungIMT(Number(form.beratBadan), Number(form.tinggiBadan));
  const kategoriTd = kategoriTekananDarah(
    Number(form.tdSistolik),
    Number(form.tdDiastolik)
  );
  const kategoriGula = kategoriGulaDarah(Number(form.gulaDarah));

  const usiaTahun = pesertaInfo?.tanggalLahir
    ? Math.floor(
        (Date.now() - new Date(pesertaInfo.tanggalLahir).getTime()) / (365.25 * 24 * 3600 * 1000)
      )
    : null;
  const layakPUMA = usiaTahun != null && usiaTahun >= 40;
  const puGender = pesertaInfo?.jenisKelamin === "L" ? 1 : 0;
  const puAge =
    usiaTahun != null
      ? usiaTahun >= 60
        ? 2
        : usiaTahun >= 50
        ? 1
        : usiaTahun >= 40
        ? 0
        : null
      : null;
  const totalPUMA =
    layakPUMA && puAge != null
      ? skorPUMA({
          puKelamin: puGender,
          puUsia: puAge,
          puRokok: Number(form.puRokok),
          puSesak: Number(form.puSesak),
          puDahak: Number(form.puDahak),
          puBatuk: Number(form.puBatuk),
          puSpirometri: Number(form.puSpirometri),
        })
      : null;

  const toNumber = (v) => (v === "" || v == null ? undefined : Number(v));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      beratBadan: toNumber(form.beratBadan),
      tinggiBadan: toNumber(form.tinggiBadan),
      lingkarPerut: toNumber(form.lingkarPerut),
      lila: toNumber(form.lila),
      tdSistolik: toNumber(form.tdSistolik),
      tdDiastolik: toNumber(form.tdDiastolik),
      gulaDarah: toNumber(form.gulaDarah),
      imt: imt,
      kategoriIMT: imt != null ? kategoriIMT(imt) : "",
      kategoriTD: kategoriTd,
      kategoriGula: kategoriGula,
      puKelamin: layakPUMA ? puGender : 0,
      puUsia: layakPUMA && puAge != null ? puAge : 0,
      puRokok: Number(form.puRokok),
      puSesak: Number(form.puSesak),
      puDahak: Number(form.puDahak),
      puBatuk: Number(form.puBatuk),
      puSpirometri: Number(form.puSpirometri),
      skorPUMA: totalPUMA,
      kategoriPUMA: totalPUMA != null ? kategoriPUMA(totalPUMA) : "",
    };
    if (!payload.peserta) payload.peserta = undefined;
    try {
      if (editing) {
        await api.put(`/pemeriksaan-dewasa/${editing._id}`, payload);
      } else {
        await api.post("/pemeriksaan-dewasa", payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm("Hapus data pemeriksaan ini?")) return;
    try {
      await api.delete(`/pemeriksaan-dewasa/${row._id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus data");
    }
  };

  const sectionTitle = "text-sm font-bold text-primary-700 mt-2 mb-3 uppercase tracking-wide";
  const kolomExtra = isAdmin ? 0 : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pemeriksaan Dewasa &amp; Lansia</h1>
          <p className="text-gray-500 mt-1">
            Pencatatan pemeriksaan kelompok usia dewasa (18+ tahun) sesuai instrumen Kemenkes.
          </p>
        </div>
        {isAdmin ? (
          <span className="inline-flex self-start px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full">
            Mode Baca (Read-Only)
          </span>
        ) : (
          <button onClick={openCreate} className={btnPrimaryClass}>
            + Input Pemeriksaan
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari peserta atau catatan..."
            className={`${inputClass} max-w-xs`}
          />
          <input
            type="date"
            value={tanggalFilter}
            onChange={(e) => setTanggalFilter(e.target.value)}
            className={`${inputClass} max-w-[160px]`}
          />
        </div>

        {error && <p className="px-4 py-3 text-sm text-red-600">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">No</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Peserta</th>
                <th className="px-4 py-3 font-medium">Usia</th>
                <th className="px-4 py-3 font-medium">Jenis</th>
                <th className="px-4 py-3 font-medium">IMT</th>
                <th className="px-4 py-3 font-medium">Tekanan Darah</th>
                <th className="px-4 py-3 font-medium">Gula Darah</th>
                <th className="px-4 py-3 font-medium">Skor PUMA</th>
                {!isAdmin && (
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9 + kolomExtra} className="px-4 py-8 text-center text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={9 + kolomExtra} className="px-4 py-8 text-center text-gray-400">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr key={row._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatTanggal(row.tanggal)}
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      {row.peserta?.nama || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {hitungUmur(row.peserta?.tanggalLahir)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          badgeJenis[row.jenis] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {row.jenis || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.imt != null
                        ? `${row.imt} (${row.kategoriIMT || "-"})`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {row.tdSistolik && row.tdDiastolik
                        ? `${row.tdSistolik}/${row.tdDiastolik} mmHg` +
                          (row.kategoriTD ? ` (${row.kategoriTD})` : "")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {row.gulaDarah != null
                        ? `${row.gulaDarah} mg/dl` +
                          (row.kategoriGula ? ` (${row.kategoriGula})` : "")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.skorPUMA != null
                        ? `${row.skorPUMA} (${row.kategoriPUMA || "-"})`
                        : "N/A"}
                    </td>
                    {!isAdmin && (
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => openEdit(row)}
                          className="text-primary-600 hover:text-primary-700 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(row)}
                          className="text-red-500 hover:text-red-600"
                        >
                          Hapus
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isAdmin && (
        <Modal
          open={modalOpen}
          title={editing ? "Edit Pemeriksaan Dewasa & Lansia" : "Input Pemeriksaan Dewasa & Lansia"}
          onClose={() => setModalOpen(false)}
          maxWidth="max-w-3xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Peserta (Dewasa &amp; Lansia ≥ 18 tahun)</label>
                <PesertaSelect value={form.peserta} onChange={handlePesertaChange} filterKategori={["Produktif", "Lansia"]} />
              </div>
              <div>
                <label className={labelClass}>Tanggal Pemeriksaan</label>
                <input
                  type="date"
                  name="tanggal"
                  value={form.tanggal}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Jenis Kunjungan</label>
              <select name="jenis" value={form.jenis} onChange={handleChange} className={inputClass}>
                {JENIS_KUNJUNGAN_DEWASA.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className={sectionTitle}>A. Anamnesis — Riwayat Penyakit</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Riwayat Penyakit Keluarga</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PENYAKIT_DEWASA_LIST.map((p) => {
                      const active = form.riwayatPenyakitKeluarga.includes(p);
                      return (
                        <label
                          key={p}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                            active
                              ? "border-primary-500 bg-primary-50 text-primary-700"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() => togglePenyakit("riwayatPenyakitKeluarga", p)}
                            className="accent-primary-600"
                          />
                          {p}
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Riwayat Penyakit Diri Sendiri</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PENYAKIT_DEWASA_LIST.map((p) => {
                      const active = form.riwayatPenyakitDiri.includes(p);
                      return (
                        <label
                          key={p}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                            active
                              ? "border-primary-500 bg-primary-50 text-primary-700"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() => togglePenyakit("riwayatPenyakitDiri", p)}
                            className="accent-primary-600"
                          />
                          {p}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className={sectionTitle}>B. Perilaku Berisiko (Gizi &amp; Gaya Hidup)</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { name: "merokok", label: "Merokok" },
                  { name: "konsumsiGula", label: "Konsumsi Gula Berlebih" },
                  { name: "konsumsiGaram", label: "Konsumsi Garam Berlebih" },
                  { name: "konsumsiLemak", label: "Konsumsi Lemak Berlebih" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className={labelClass}>{f.label}</label>
                    <select
                      name={f.name}
                      value={form[f.name]}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      {YA_TIDAK.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className={sectionTitle}>C. Pemeriksaan Rutin Bulanan</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Berat Badan (kg)</label>
                  <input
                    type="number"
                    name="beratBadan"
                    value={form.beratBadan}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={inputClass}
                    placeholder="Contoh: 60"
                  />
                </div>
                <div>
                  <label className={labelClass}>Tinggi Badan (cm)</label>
                  <input
                    type="number"
                    name="tinggiBadan"
                    value={form.tinggiBadan}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={inputClass}
                    placeholder="Contoh: 160"
                  />
                </div>
                <div>
                  <label className={labelClass}>Lingkar Perut (cm)</label>
                  <input
                    type="number"
                    name="lingkarPerut"
                    value={form.lingkarPerut}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className={inputClass}
                    placeholder="Contoh: 85"
                  />
                </div>
                <div>
                  <label className={labelClass}>LILA (cm)</label>
                  <input
                    type="number"
                    name="lila"
                    value={form.lila}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className={inputClass}
                    placeholder="Contoh: 28"
                  />
                </div>
                <div>
                  <label className={labelClass}>Tekanan Darah Sistolik</label>
                  <input
                    type="number"
                    name="tdSistolik"
                    value={form.tdSistolik}
                    onChange={handleChange}
                    min="0"
                    className={inputClass}
                    placeholder="Contoh: 120"
                  />
                </div>
                <div>
                  <label className={labelClass}>Tekanan Darah Diastolik</label>
                  <input
                    type="number"
                    name="tdDiastolik"
                    value={form.tdDiastolik}
                    onChange={handleChange}
                    min="0"
                    className={inputClass}
                    placeholder="Contoh: 80"
                  />
                </div>
                <div>
                  <label className={labelClass}>Gula Darah Sewaktu (mg/dl)</label>
                  <input
                    type="number"
                    name="gulaDarah"
                    value={form.gulaDarah}
                    onChange={handleChange}
                    min="0"
                    className={inputClass}
                    placeholder="Contoh: 120"
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-sm font-semibold">
                  IMT: {imt != null ? `${imt} — ${kategoriIMT(imt)}` : "masukkan BB & TB"}
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-sm font-semibold">
                  TD: {kategoriTd || "masukkan sistolik & diastolik"}
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-semibold">
                  Gula: {kategoriGula || "masukkan gula darah"}
                </span>
              </div>
            </div>

            <div>
              <p className={sectionTitle}>D. Skrining Gejala TBC &amp; KB</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {GEJALA_TBC_LIST.map((g) => (
                  <div key={g.name}>
                    <label className={labelClass}>{g.label}</label>
                    <select
                      name={g.name}
                      value={form[g.name]}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      {YA_TIDAK.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <div>
                  <label className={labelClass}>Memakai Alat Kontrasepsi</label>
                  <select
                    name="alatKontrasepsi"
                    value={form.alatKontrasepsi}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {YA_TIDAK.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <p className={sectionTitle}>E. Pemeriksaan Berkala (6 Bulan / Tahunan)</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { name: "penglihatanKanan", label: "Tes Penglihatan — Kanan" },
                  { name: "penglihatanKiri", label: "Tes Penglihatan — Kiri" },
                  { name: "pendengaranKanan", label: "Tes Pendengaran — Kanan" },
                  { name: "pendengaranKiri", label: "Tes Pendengaran — Kiri" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className={labelClass}>{f.label}</label>
                    <select
                      name={f.name}
                      value={form[f.name]}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      {PANCA_INDRA_DEWASA.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {layakPUMA ? (
                <div className="mt-4 border border-gray-100 rounded-xl p-4">
                  <p className="text-sm font-bold text-primary-700 uppercase tracking-wide mb-2">
                    Skrining PPOK (Kuesioner PUMA) — Usia ≥ 40 tahun
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <label className={labelClass}>Jenis Kelamin (otomatis)</label>
                      <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-700 font-medium">
                        {pesertaInfo?.jenisKelamin === "L"
                          ? "Laki-laki (1 poin)"
                          : pesertaInfo?.jenisKelamin === "P"
                          ? "Perempuan (0)"
                          : "Pilih peserta dulu"}
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Usia (otomatis)</label>
                      <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-700 font-medium">
                        {usiaTahun != null
                          ? `${usiaTahun} tahun — ${
                              puAge === 2 ? "≥ 60 (2)" : puAge === 1 ? "50-59 (1)" : "40-49 (0)"
                            } poin`
                          : "Pilih peserta dulu"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{PUMA_PERTANYAAN[0].label}</label>
                      <select
                        name="puRokok"
                        value={form.puRokok}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        {PUMA_ROKOK_OPTS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {PUMA_PERTANYAAN.slice(1).map((q) => (
                      <div key={q.name}>
                        <label className={labelClass}>{q.label}</label>
                        <select
                          name={q.name}
                          value={form[q.name]}
                          onChange={handleChange}
                          className={inputClass}
                        >
                          {PUMA_YA_TIDAK_OPTS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                        totalPUMA != null && totalPUMA >= 5
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      Skor PUMA: {totalPUMA != null ? `${totalPUMA} / 7 — ${kategoriPUMA(totalPUMA)}` : "-"}
                    </span>
                    {totalPUMA != null && totalPUMA >= 5 && (
                      <p className="text-xs text-red-600 mt-1">
                        Skor ≥ 5 → risiko tinggi PPOK, rujuk untuk pemeriksaan spirometri.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-400">
                  Skrining PPOK (PUMA) hanya untuk usia ≥ 40 tahun.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Topik Penyuluhan</label>
                <input
                  type="text"
                  name="topikPenyuluhan"
                  value={form.topikPenyuluhan}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Contoh: diet hipertensi, aktivitas fisik"
                />
              </div>
              <div>
                <label className={labelClass}>Catatan Rujukan ke Puskesmas</label>
                <input
                  type="text"
                  name="catatanRujukan"
                  value={form.catatanRujukan}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Catatan rujukan (opsional)"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Catatan Umum</label>
              <textarea
                name="catatan"
                value={form.catatan}
                onChange={handleChange}
                rows={2}
                className={`${inputClass} resize-none`}
                placeholder="Catatan tambahan (opsional)"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className={btnSecondaryClass}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default PemeriksaanDewasa;