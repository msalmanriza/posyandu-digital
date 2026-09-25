import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Modal from "../components/Modal";
import PesertaRemajaSelect from "../components/PesertaRemajaSelect";
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
  hitungUmurTahun,
  kategoriHb,
} from "../utils/helpers";
import {
  RIWAYAT_PENYAKIT_REMAJA,
  JENIS_PEMERIKSAAN_REMAJA,
  PANCA_INDRA_REMAJA,
} from "../utils/constants";

const initialForm = {
  peserta: "",
  tanggal: todayString(),
  jenis: "Anamnesis Awal",
  riwayatKeluarga: [],
  riwayatDiri: [],
  penglihatanKanan: "Normal",
  penglihatanKiri: "Normal",
  pendengaranKanan: "Normal",
  pendengaranKiri: "Normal",
  kadarHb: "",
  statusAnemia: "",
  topikPenyuluhan: "",
  catatanRujukan: "",
  catatan: "",
};

const badgeJenis = {
  "Anamnesis Awal": "bg-teal-100 text-teal-700",
  "Berkala 6 Bulan": "bg-blue-100 text-blue-700",
  "Tahunan Remaja Putri": "bg-pink-100 text-pink-700",
};

const badgeAnemia = {
  Normal: "bg-green-100 text-green-700",
  "Anemia Ringan": "bg-amber-100 text-amber-700",
  "Anemia Sedang": "bg-orange-100 text-orange-700",
  "Anemia Berat": "bg-red-100 text-red-700",
};

function PemeriksaanRemaja() {
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
      const { data } = await api.get("/pemeriksaan-remaja", { params });
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
      jenis: row.jenis || "Anamnesis Awal",
      riwayatKeluarga: Array.isArray(row.riwayatKeluarga) ? row.riwayatKeluarga : [],
      riwayatDiri: Array.isArray(row.riwayatDiri) ? row.riwayatDiri : [],
      penglihatanKanan: row.penglihatanKanan || "Normal",
      penglihatanKiri: row.penglihatanKiri || "Normal",
      pendengaranKanan: row.pendengaranKanan || "Normal",
      pendengaranKiri: row.pendengaranKiri || "Normal",
      kadarHb: row.kadarHb ?? "",
      statusAnemia: row.statusAnemia || "",
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

  const toggleRiwayat = (key, nama) => {
    const cur = form[key] || [];
    const next = cur.includes(nama) ? cur.filter((x) => x !== nama) : [...cur, nama];
    setForm({ ...form, [key]: next });
  };

  const usiaTahun = pesertaInfo?.tanggalLahir
    ? hitungUmurTahun(pesertaInfo.tanggalLahir)
    : null;
  const statusHb = kategoriHb(
    form.kadarHb === "" || form.kadarHb == null ? null : Number(form.kadarHb),
    pesertaInfo?.jenisKelamin,
    pesertaInfo?.tanggalLahir
  );
  const jenisPutriSalah =
    form.jenis === "Tahunan Remaja Putri" &&
    pesertaInfo &&
    pesertaInfo.jenisKelamin !== "P";

  const toNumber = (v) => (v === "" || v == null ? undefined : Number(v));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      kadarHb: toNumber(form.kadarHb),
      statusAnemia: statusHb,
    };
    if (!payload.peserta) payload.peserta = undefined;
    try {
      if (editing) {
        await api.put(`/pemeriksaan-remaja/${editing._id}`, payload);
      } else {
        await api.post("/pemeriksaan-remaja", payload);
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
      await api.delete(`/pemeriksaan-remaja/${row._id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus data");
    }
  };

  const sectionTitle = "text-sm font-bold text-primary-700 mt-2 mb-3 uppercase tracking-wide";
  const kolomExtra = isAdmin ? 0 : 1;

  const lihatRiwayat = (arr) =>
    Array.isArray(arr) && arr.length ? arr.join(", ") : "Tidak Ada";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pemeriksaan Anak Sekolah &amp; Remaja</h1>
          <p className="text-gray-500 mt-1">
            Pencatatan pemeriksaan siswa usia 6 - 18 tahun — anamnesis awal, berkala 6 bulan
            (penglihatan &amp; pendengaran), dan pemeriksaan tahunan khusus remaja putri.
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
                <th className="px-4 py-3 font-medium">Riwayat Keluarga</th>
                <th className="px-4 py-3 font-medium">Riwayat Diri</th>
                <th className="px-4 py-3 font-medium">Penglihatan</th>
                <th className="px-4 py-3 font-medium">Pendengaran</th>
                <th className="px-4 py-3 font-medium">Hb</th>
                {!isAdmin && (
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10 + kolomExtra} className="px-4 py-8 text-center text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={10 + kolomExtra} className="px-4 py-8 text-center text-gray-400">
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
                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">
                      {lihatRiwayat(row.riwayatKeluarga)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">
                      {lihatRiwayat(row.riwayatDiri)}
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
                          <span className="text-gray-700">{row.kadarHb} g/dL</span>{" "}
                          {row.statusAnemia && (
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                badgeAnemia[row.statusAnemia] || "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {row.statusAnemia}
                            </span>
                          )}
                        </>
                      ) : (
                        "-"
                      )}
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
          title={
            editing
              ? "Edit Pemeriksaan Anak Sekolah & Remaja"
              : "Input Pemeriksaan Anak Sekolah & Remaja"
          }
          onClose={() => setModalOpen(false)}
          maxWidth="max-w-3xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Peserta (Anak Sekolah &amp; Remaja 6 - 18 tahun)</label>
                <PesertaRemajaSelect value={form.peserta} onChange={handlePesertaChange} />
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Jenis Pemeriksaan</label>
                <select name="jenis" value={form.jenis} onChange={handleChange} className={inputClass}>
                  {JENIS_PEMERIKSAAN_REMAJA.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Peserta Terpilih</label>
                <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-700 text-sm font-medium">
                  {pesertaInfo
                    ? `${pesertaInfo.nama} — ${
                        pesertaInfo.jenisKelamin === "P"
                          ? "Perempuan"
                          : pesertaInfo.jenisKelamin === "L"
                          ? "Laki-laki"
                          : "-"
                      }, ${usiaTahun != null ? `${usiaTahun} tahun` : "-"}`
                    : "Pilih peserta terlebih dahulu"}
                </div>
              </div>
            </div>

            {form.jenis === "Anamnesis Awal" && (
              <div>
                <p className={sectionTitle}>A. Anamnesis Awal — Riwayat Keluarga &amp; Diri Sendiri</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Riwayat Keluarga</label>
                    <div className="grid grid-cols-2 gap-2">
                      {RIWAYAT_PENYAKIT_REMAJA.map((p) => {
                        const active = form.riwayatKeluarga.includes(p);
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
                              onChange={() => toggleRiwayat("riwayatKeluarga", p)}
                              className="accent-primary-600"
                            />
                            {p}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Perilaku / Riwayat Diri Sendiri</label>
                    <div className="grid grid-cols-2 gap-2">
                      {RIWAYAT_PENYAKIT_REMAJA.map((p) => {
                        const active = form.riwayatDiri.includes(p);
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
                              onChange={() => toggleRiwayat("riwayatDiri", p)}
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
            )}

            {form.jenis === "Berkala 6 Bulan" && (
              <div>
                <p className={sectionTitle}>B. Pemeriksaan Berkala (6 Bulan) — Panca Indra</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: "penglihatanKanan", label: "Tes Penglihatan (Hitung Jari) — Mata Kanan" },
                    { name: "penglihatanKiri", label: "Tes Penglihatan (Hitung Jari) — Mata Kiri" },
                    { name: "pendengaranKanan", label: "Tes Pendengaran (Bisikan) — Telinga Kanan" },
                    { name: "pendengaranKiri", label: "Tes Pendengaran (Bisikan) — Telinga Kiri" },
                  ].map((f) => (
                    <div key={f.name}>
                      <label className={labelClass}>{f.label}</label>
                      <select
                        name={f.name}
                        value={form[f.name]}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        {PANCA_INDRA_REMAJA.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {form.jenis === "Tahunan Remaja Putri" && (
              <div>
                <p className={sectionTitle}>C. Pemeriksaan Tahunan Khusus Remaja Putri</p>
                {jenisPutriSalah ? (
                  <p className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                    Pemeriksaan tahunan khusus remaja putri hanya untuk peserta perempuan
                    (jenis kelamin P). Silakan pilih peserta perempuan.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Kadar Hb (Hemoglobin) — g/dL</label>
                      <input
                        type="number"
                        name="kadarHb"
                        value={form.kadarHb}
                        onChange={handleChange}
                        min="0"
                        max="25"
                        step="0.1"
                        className={inputClass}
                        placeholder="Contoh: 11.8"
                      />
                      <div className="mt-2">
                        {statusHb ? (
                          <span
                            className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${
                              badgeAnemia[statusHb] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            Status: {statusHb}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Hasil akan muncul setelah kadar Hb &amp; peserta diisi.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Topik Penyuluhan</label>
                <input
                  type="text"
                  name="topikPenyuluhan"
                  value={form.topikPenyuluhan}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Topik penyuluhan (opsional)"
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

export default PemeriksaanRemaja;