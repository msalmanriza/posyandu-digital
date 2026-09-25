import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Modal from "../components/Modal";
import { inputClass, labelClass } from "../components/ui";
import {
  formatTanggal,
  formatTanggalInput,
  hitungUmur,
  getKategoriUmur,
} from "../utils/helpers";

const initialForm = {
  nama: "",
  nik: "",
  jenisKelamin: "L",
  tanggalLahir: "",
  kategori: "Balita",
  beratLahir: "",
  tinggiLahir: "",
  orangTua: "",
  namaOrangTua: "",
  alamat: "",
  statusBPJSAnak: "Tidak",
};

const kategoriOptions = [
  { value: "Semua", label: "Semua Kategori" },
  { value: "Balita", label: "Balita (1-59 bln)" },
  { value: "Apras", label: "Apras (6-18 thn)" },
  { value: "Produktif", label: "Produktif & Dewasa (19-59 thn)" },
  { value: "Lansia", label: "Lansia (60+ thn)" },
];

const formKategoriOptions = [
  { value: "Balita", label: "Balita (1-59 bln)" },
  { value: "Apras", label: "Apras (6-18 thn)" },
  { value: "Produktif", label: "Produktif & Dewasa (19-59 thn)" },
  { value: "Lansia", label: "Lansia (60+ thn)" },
];

const deteksiKategori = (tanggalLahir) => {
  if (!tanggalLahir) return "";
  const k = getKategoriUmur(tanggalLahir);
  return ["Balita", "Apras", "Produktif", "Lansia"].includes(k) ? k : "";
};

const kategoriColors = {
  Balita: "bg-primary-100 text-primary-700",
  Apras: "bg-purple-100 text-purple-700",
  Produktif: "bg-green-100 text-green-700",
  Lansia: "bg-red-100 text-red-700",
  Lainnya: "bg-gray-100 text-gray-600",
};

function Peserta() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [data, setData] = useState([]);
  const [orangTuas, setOrangTuas] = useState([]);
  const [search, setSearch] = useState("");
  const [quickSearch, setQuickSearch] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async (q) => {
    setLoading(true);
    try {
      const { data } = await api.get("/peserta", {
        params: q ? { search: q } : {},
      });
      setData(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchData(search), 300);
    return () => clearTimeout(timer);
  }, [search, fetchData]);

  useEffect(() => {
    if (modalOpen) {
      api
        .get("/orang-tua")
        .then(({ data }) => setOrangTuas(data))
        .catch(() => setOrangTuas([]));
    }
  }, [modalOpen]);

  const filteredData =
    kategori === "Semua"
      ? data
      : data.filter((row) => getKategoriUmur(row.tanggalLahir) === kategori);

  const cari = quickSearch.trim().toLowerCase();
  const listData = cari
    ? filteredData.filter(
        (row) =>
          (row.nama || "").toLowerCase().includes(cari) ||
          (row.nik || "").toLowerCase().includes(cari)
      )
    : filteredData;

  const mandiri = form.kategori !== "Balita";

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      nama: row.nama,
      nik: row.nik || "",
      jenisKelamin: row.jenisKelamin,
      tanggalLahir: formatTanggalInput(row.tanggalLahir),
      kategori: deteksiKategori(row.tanggalLahir),
      beratLahir: row.beratLahir || "",
      tinggiLahir: row.tinggiLahir || "",
      orangTua: row.orangTua?._id || row.orangTua || "",
      namaOrangTua: row.namaOrangTua || "",
      alamat: row.alamat || "",
      statusBPJSAnak: row.statusBPJSAnak || "Tidak",
    });
    setError("");
    setModalOpen(true);
  };

  const handleChange = (e) => {
    if (e.target.name === "tanggalLahir") {
      const detected = deteksiKategori(e.target.value);
      setForm({
        ...form,
        tanggalLahir: e.target.value,
        kategori: detected || form.kategori,
      });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handlePilihKategori = (e) => {
    setForm({ ...form, kategori: e.target.value });
  };

  const handleSelectOrangTua = (e) => {
    const id = e.target.value;
    const selected = orangTuas.find((ot) => ot._id === id);
    setForm({
      ...form,
      orangTua: id,
      namaOrangTua: selected ? selected.nama : "",
      alamat: selected && !form.alamat ? selected.alamat || "" : form.alamat,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
const mandiri = form.kategori !== "Balita";
    const payload = {
      nama: form.nama,
      nik: form.nik || undefined,
      jenisKelamin: form.jenisKelamin,
      tanggalLahir: form.tanggalLahir,
      alamat: form.alamat || undefined,
      statusBPJSAnak: form.statusBPJSAnak,
    };
    if (mandiri) {
      payload.orangTua = null;
      payload.namaOrangTua = "";
    } else {
      payload.beratLahir = form.beratLahir ? Number(form.beratLahir) : undefined;
      payload.tinggiLahir = form.tinggiLahir ? Number(form.tinggiLahir) : undefined;
      payload.orangTua = form.orangTua || undefined;
      payload.namaOrangTua = form.namaOrangTua || undefined;
    }
    try {
      if (editing) {
        await api.put(`/peserta/${editing._id}`, payload);
      } else {
        await api.post("/peserta", payload);
      }
      setModalOpen(false);
      fetchData(search);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Hapus data ${row.nama}?`)) return;
    try {
      await api.delete(`/peserta/${row._id}`);
      fetchData(search);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus data");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Peserta Posyandu
          </h1>
          <p className="text-gray-500 mt-1">
            Kelola data peserta posyandu.
          </p>
        </div>
        {isAdmin ? (
          <span className="inline-flex self-start px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full">
            Mode Baca (Read-Only)
          </span>
        ) : (
          <button
            onClick={openCreate}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Tambah Peserta
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            placeholder="Cari nama / NIK peserta (cepat)..."
            className={`${inputClass} pl-9`}
          />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama peserta atau nama orang tua..."
          className={`${inputClass} max-w-sm`}
        />
        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className={`${inputClass} max-w-[220px]`}
        >
          {kategoriOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="text-center py-10 text-gray-400">Memuat data...</div>
      ) : listData.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm py-12 text-center text-gray-400">
          {cari ? "Tidak ada hasil pencarian" : "Tidak ada data peserta"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listData.map((row) => {
            const kategoriRow = getKategoriUmur(row.tanggalLahir);
            return (
              <div
                key={row._id}
                className="bg-white rounded-2xl shadow-sm p-5 flex flex-col"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 text-lg truncate">
                      {row.nama}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          kategoriColors[kategoriRow] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {kategoriRow}
                      </span>
                      <span className="text-sm text-gray-500">
                        {hitungUmur(row.tanggalLahir)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {!isAdmin && (
                      <>
                        <button
                          onClick={() => openEdit(row)}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(row)}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          Hapus
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-sm text-gray-600">
                  <p>
                    Jenis Kelamin:{" "}
                    <span className="font-medium text-gray-800">
                      {row.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    Status BPJS:
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
                  {kategoriRow === "Produktif" || kategoriRow === "Lansia" ? (
                    <p>
                      Pendaftaran:{" "}
                      <span className="font-medium text-gray-800">Mandiri</span>
                    </p>
                  ) : (
                    <p>
                      Orang Tua:{" "}
                      <span className="font-medium text-gray-800">
                        {row.namaOrangTua || "-"}
                      </span>
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to={`/peserta/${row._id}`}
                    className="block w-full text-center px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Lihat Detail & Grafik →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? "Edit Peserta" : "Tambah Peserta"}
        onClose={() => setModalOpen(false)}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {mandiri ? "Nama Lengkap" : "Nama Balita"}
              </label>
              <input
                name="nama"
                value={form.nama}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder={mandiri ? "Nama lengkap" : "Nama lengkap balita"}
              />
            </div>
            <div>
              <label className={labelClass}>Kategori Pendaftaran</label>
              <select
                name="kategori"
                value={form.kategori}
                onChange={handlePilihKategori}
                className={inputClass}
              >
                {formKategoriOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Terisi otomatis dari tanggal lahir, bisa diubah manual.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{mandiri ? "NIK" : "NIK Anak"}</label>
              <input
                name="nik"
                value={form.nik}
                onChange={handleChange}
                maxLength={16}
                className={inputClass}
                placeholder="NIK (opsional)"
              />
            </div>
            <div>
              <label className={labelClass}>Jenis Kelamin</label>
              <select
                name="jenisKelamin"
                value={form.jenisKelamin}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tanggal Lahir</label>
              <input
                type="date"
                name="tanggalLahir"
                value={form.tanggalLahir}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                {mandiri ? "Status BPJS" : "Status BPJS Anak"}
              </label>
              <select
                name="statusBPJSAnak"
                value={form.statusBPJSAnak}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Tidak">Tidak</option>
                <option value="Ya">Ya</option>
              </select>
            </div>
          </div>
          {!mandiri && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Berat Lahir (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="beratLahir"
                    value={form.beratLahir}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Contoh: 3.2"
                  />
                </div>
                <div>
                  <label className={labelClass}>Tinggi Lahir (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    name="tinggiLahir"
                    value={form.tinggiLahir}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Contoh: 48"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Orang Tua / Wali</label>
                <select
                  name="orangTua"
                  value={form.orangTua}
                  onChange={handleSelectOrangTua}
                  className={inputClass}
                >
                  <option value="">-- Pilih orang tua --</option>
                  {orangTuas.map((ot) => (
                    <option key={ot._id} value={ot._id}>
                      {ot.nama}
                    </option>
                  ))}
                </select>
              </div>
              {!form.orangTua && (
                <div>
                  <label className={labelClass}>Nama Orang Tua</label>
                  <input
                    name="namaOrangTua"
                    value={form.namaOrangTua}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Nama orang tua langsung"
                  />
                </div>
              )}
            </>
          )}
          <div>
            <label className={labelClass}>Alamat</label>
            <textarea
              name="alamat"
              value={form.alamat}
              onChange={handleChange}
              rows="2"
              className={inputClass}
              placeholder="Alamat lengkap"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
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
    </div>
  );
}

export default Peserta;