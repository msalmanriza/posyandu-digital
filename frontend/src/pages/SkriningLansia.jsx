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
  hitungSkorBarthel,
  statusSkorBarthel,
} from "../utils/helpers";
import {
  RIWAYAT_PENYAKIT_LANSIA,
  BARTH_ITEM_LIST,
  STATUS_BARTHEL,
  SKRINING_LANSIA_OPTS,
} from "../utils/constants";

const initialForm = {
  peserta: "",
  tanggal: todayString(),
  riwayatPenyakit: [],
  merokok: "Tidak",
  makanSehari: "",
  makan: "Mandiri",
  mandi: "Mandiri",
  perawatanDiri: "Mandiri",
  berpakaian: "Mandiri",
  kontrolBAB: "Mandiri",
  kontrolBAK: "Mandiri",
  toileting: "Mandiri",
  berpindah: "Mandiri",
  berjalan: "Mandiri",
  naikTangga: "Mandiri",
  kognitif: "Normal",
  mobilitas: "Mandiri",
  malnutrisi: "Normal",
  penglihatan: "Baik",
  pendengaran: "Baik",
  kesimpulan: "Sehat / Mandiri",
  catatan: "",
};

const badgeKesimpulan = {
  "Sehat / Mandiri": "bg-green-100 text-green-700",
  "Perlu Pemantauan": "bg-amber-100 text-amber-700",
  "Rujuk ke Puskesmas": "bg-red-100 text-red-700",
};

function SkriningLansia() {
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (tanggalFilter) params.tanggal = tanggalFilter;
      if (search) params.search = search;
      const { data } = await api.get("/skrining-lansia", { params });
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

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      peserta: row.peserta?._id || "",
      tanggal: row.tanggal ? row.tanggal.slice(0, 10) : todayString(),
      riwayatPenyakit: Array.isArray(row.riwayatPenyakit) ? row.riwayatPenyakit : [],
      merokok: row.merokok || "Tidak",
      makanSehari: row.makanSehari ?? "",
      makan: row.makan || "Mandiri",
      mandi: row.mandi || "Mandiri",
      perawatanDiri: row.perawatanDiri || "Mandiri",
      berpakaian: row.berpakaian || "Mandiri",
      kontrolBAB: row.kontrolBAB || "Mandiri",
      kontrolBAK: row.kontrolBAK || "Mandiri",
      toileting: row.toileting || "Mandiri",
      berpindah: row.berpindah || "Mandiri",
      berjalan: row.berjalan || "Mandiri",
      naikTangga: row.naikTangga || "Mandiri",
      kognitif: row.kognitif || "Normal",
      mobilitas: row.mobilitas || "Mandiri",
      malnutrisi: row.malnutrisi || "Normal",
      penglihatan: row.penglihatan || "Baik",
      pendengaran: row.pendengaran || "Baik",
      kesimpulan: row.kesimpulan || "Sehat / Mandiri",
      catatan: row.catatan || "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePenyakit = (nama) => {
    const cur = form.riwayatPenyakit || [];
    const next = cur.includes(nama)
      ? cur.filter((x) => x !== nama)
      : [...cur, nama];
    setForm({ ...form, riwayatPenyakit: next });
  };

  const skorBarthel = hitungSkorBarthel(form);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      makanSehari: form.makanSehari !== "" ? Number(form.makanSehari) : undefined,
      skorBarthel,
    };
    if (!payload.peserta) payload.peserta = undefined;
    try {
      if (editing) {
        await api.put(`/skrining-lansia/${editing._id}`, payload);
      } else {
        await api.post("/skrining-lansia", payload);
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
    if (!window.confirm("Hapus data skrining ini?")) return;
    try {
      await api.delete(`/skrining-lansia/${row._id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus data");
    }
  };

  const sectionTitle = "text-sm font-bold text-primary-700 mt-2 mb-3 uppercase tracking-wide";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Skrining Lansia</h1>
          <p className="text-gray-500 mt-1">
            Kartu Bantu Lansia (≥ 60 tahun) — riwayat penyakit, perilaku, kemandirian AKS/Barthel, dan skrining geriatri SKILAS.
          </p>
        </div>
        {isAdmin ? (
          <span className="inline-flex self-start px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full">
            Mode Baca (Read-Only)
          </span>
        ) : (
          <button onClick={openCreate} className={btnPrimaryClass}>
            + Input Skrining Lansia
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
                <th className="px-4 py-3 font-medium">Skor Barthel</th>
                <th className="px-4 py-3 font-medium">Kemandirian</th>
                <th className="px-4 py-3 font-medium">Kesimpulan</th>
                {!isAdmin && (
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 8} className="px-4 py-8 text-center text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 8} className="px-4 py-8 text-center text-gray-400">
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
                    <td className="px-4 py-3 text-gray-600">
                      {row.skorBarthel ?? "-"} / 20
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.skorBarthel != null ? statusSkorBarthel(row.skorBarthel) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                          badgeKesimpulan[row.kesimpulan] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {row.kesimpulan || "-"}
                      </span>
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
          title={editing ? "Edit Skrining Lansia" : "Input Skrining Lansia"}
          onClose={() => setModalOpen(false)}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</p>
            )}

            <div>
              <label className={labelClass}>Peserta (Lansia ≥ 60 tahun)</label>
              <PesertaSelect value={form.peserta} onChange={handleChange} filterKategori="Lansia" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tanggal Skrining</label>
                <input
                  type="date"
                  name="tanggal"
                  value={form.tanggal}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Frekuensi Makan (kali/hari)</label>
                <input
                  type="number"
                  name="makanSehari"
                  value={form.makanSehari}
                  onChange={handleChange}
                  min="0"
                  className={inputClass}
                  placeholder="Contoh: 3"
                />
              </div>
            </div>

            <div>
              <p className={sectionTitle}>A. Riwayat Penyakit</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {RIWAYAT_PENYAKIT_LANSIA.map((p) => {
                  const active = (form.riwayatPenyakit || []).includes(p);
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
                        onChange={() => togglePenyakit(p)}
                        className="accent-primary-600"
                      />
                      {p}
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <p className={sectionTitle}>B. Perilaku &amp; Pola Makan</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Kebiasaan Merokok</label>
                  <select
                    name="merokok"
                    value={form.merokok}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {SKRINING_LANSIA_OPTS.merokok.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <p className={sectionTitle}>C. Kemandirian AKS / Barthel Index</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BARTH_ITEM_LIST.map((item) => (
                  <div key={item.name}>
                    <label className={labelClass}>{item.label}</label>
                    <select
                      name={item.name}
                      value={form[item.name]}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      {STATUS_BARTHEL.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold text-primary-700">
                  Skor Barthel: {skorBarthel} / 20
                </span>
                <span className="text-sm text-gray-600">({statusSkorBarthel(skorBarthel)})</span>
              </div>
            </div>

            <div>
              <p className={sectionTitle}>D. Skrining Geriatri SKILAS</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Kognitif (K)</label>
                  <select
                    name="kognitif"
                    value={form.kognitif}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {SKRINING_LANSIA_OPTS.kognitif.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Mobilitas (I)</label>
                  <select
                    name="mobilitas"
                    value={form.mobilitas}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {SKRINING_LANSIA_OPTS.mobilitas.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Malnutrisi (LA)</label>
                  <select
                    name="malnutrisi"
                    value={form.malnutrisi}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {SKRINING_LANSIA_OPTS.malnutrisi.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Penglihatan (S)</label>
                  <select
                    name="penglihatan"
                    value={form.penglihatan}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {SKRINING_LANSIA_OPTS.pancaIndra.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Pendengaran (S)</label>
                  <select
                    name="pendengaran"
                    value={form.pendengaran}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {SKRINING_LANSIA_OPTS.pancaIndra.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Kesimpulan</label>
                <select
                  name="kesimpulan"
                  value={form.kesimpulan}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {SKRINING_LANSIA_OPTS.kesimpulan.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Catatan</label>
                <input
                  type="text"
                  name="catatan"
                  value={form.catatan}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Catatan (opsional)"
                />
              </div>
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

export default SkriningLansia;