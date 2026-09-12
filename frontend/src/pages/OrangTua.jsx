import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Modal from "../components/Modal";
import { inputClass, labelClass } from "../components/ui";

const initialForm = {
  nama: "",
  nik: "",
  jenisKelamin: "L",
  umur: "",
  statusKb: "Tidak",
  jumlahAnak: "",
  statusHamil: "Tidak",
  statusBPJS: "Tidak",
  telepon: "",
  alamat: "",
};

const statusOptions = ["Ya", "Tidak"];

function OrangTua() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async (q) => {
    setLoading(true);
    try {
      const { data } = await api.get("/orang-tua", {
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
      nik: row.nik,
      jenisKelamin: row.jenisKelamin,
      umur: row.umur ?? "",
      statusKb: row.statusKb || "Tidak",
      jumlahAnak: row.jumlahAnak ?? "",
      statusHamil: row.statusHamil || "Tidak",
      statusBPJS: row.statusBPJS || "Tidak",
      telepon: row.telepon || "",
      alamat: row.alamat || "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
      ...(name === "jenisKelamin" && value === "L" ? { statusHamil: "Tidak" } : {}),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      umur: Number(form.umur),
      jumlahAnak: Number(form.jumlahAnak),
    };
    try {
      if (editing) {
        await api.put(`/orang-tua/${editing._id}`, payload);
      } else {
        await api.post("/orang-tua", payload);
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
      await api.delete(`/orang-tua/${row._id}`);
      fetchData(search);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus data");
    }
  };

  const Badge = ({ value }) => (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === "Ya"
          ? "bg-primary-100 text-primary-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {value}
    </span>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Orang Tua</h1>
          <p className="text-gray-500 mt-1">
            Kelola data orang tua/wali peserta posyandu.
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
            + Tambah Orang Tua
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau NIK..."
            className={`${inputClass} max-w-sm`}
          />
        </div>

        {error && <p className="px-4 py-3 text-sm text-red-600">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">No</th>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">NIK</th>
                <th className="px-4 py-3 font-medium">JK</th>
                <th className="px-4 py-3 font-medium">Umur</th>
                <th className="px-4 py-3 font-medium">Status KB</th>
                <th className="px-4 py-3 font-medium">Jml Anak</th>
                <th className="px-4 py-3 font-medium">Hamil</th>
                <th className="px-4 py-3 font-medium">BPJS</th>
                <th className="px-4 py-3 font-medium">Telepon</th>
                <th className="px-4 py-3 font-medium">Alamat</th>
                {!isAdmin && (
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 11 : 12} className="px-4 py-8 text-center text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 11 : 12} className="px-4 py-8 text-center text-gray-400">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr
                    key={row._id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {row.nama}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.nik}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.jenisKelamin}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.umur != null ? `${row.umur} thn` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge value={row.statusKb || "Tidak"} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.jumlahAnak ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge value={row.statusHamil || "Tidak"} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge value={row.statusBPJS || "Tidak"} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.telepon || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.alamat || "-"}
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

      <Modal
        open={modalOpen}
        title={editing ? "Edit Orang Tua" : "Tambah Orang Tua"}
        onClose={() => setModalOpen(false)}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </p>
          )}
          <div>
            <label className={labelClass}>Nama Lengkap</label>
            <input
              name="nama"
              value={form.nama}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Nama orang tua"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>NIK</label>
              <input
                name="nik"
                value={form.nik}
                onChange={handleChange}
                required
                minLength={16}
                maxLength={16}
                className={inputClass}
                placeholder="16 digit NIK"
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
              <label className={labelClass}>Umur (tahun)</label>
              <input
                type="number"
                name="umur"
                value={form.umur}
                onChange={handleChange}
                required
                min={15}
                max={100}
                className={inputClass}
                placeholder="Contoh: 30"
              />
            </div>
            <div>
              <label className={labelClass}>Jumlah Anak</label>
              <input
                type="number"
                name="jumlahAnak"
                value={form.jumlahAnak}
                onChange={handleChange}
                required
                min={0}
                className={inputClass}
                placeholder="Contoh: 2"
              />
            </div>
          </div>
          <div
            className={`grid grid-cols-1 gap-4 ${
              form.jenisKelamin === "L" ? "sm:grid-cols-2" : "sm:grid-cols-3"
            }`}
          >
            <div>
              <label className={labelClass}>Status KB</label>
              <select
                name="statusKb"
                value={form.statusKb}
                onChange={handleChange}
                className={inputClass}
              >
                {statusOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            {form.jenisKelamin === "P" && (
              <div>
                <label className={labelClass}>Status Hamil</label>
                <select
                  name="statusHamil"
                  value={form.statusHamil}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {statusOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className={labelClass}>Status BPJS</label>
              <select
                name="statusBPJS"
                value={form.statusBPJS}
                onChange={handleChange}
                className={inputClass}
              >
                {statusOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Telepon</label>
              <input
                name="telepon"
                value={form.telepon}
                onChange={handleChange}
                className={inputClass}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div>
              <label className={labelClass}>Alamat</label>
              <input
                name="alamat"
                value={form.alamat}
                onChange={handleChange}
                className={inputClass}
                placeholder="Alamat"
              />
            </div>
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

export default OrangTua;