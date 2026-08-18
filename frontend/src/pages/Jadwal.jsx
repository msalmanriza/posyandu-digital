import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import Modal from "../components/Modal";
import { inputClass, labelClass, btnPrimaryClass, btnSecondaryClass } from "../components/ui";
import { formatTanggal } from "../utils/helpers";

const initialForm = { kegiatan: "", tanggal: "", lokasi: "", keterangan: "" };

function Jadwal() {
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
      const { data } = await api.get("/schedules", {
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
      kegiatan: row.kegiatan,
      tanggal: row.tanggal ? row.tanggal.slice(0, 10) : "",
      lokasi: row.lokasi || "",
      keterangan: row.keterangan || "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await api.put(`/schedules/${editing._id}`, form);
      } else {
        await api.post("/schedules", form);
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
    if (!window.confirm(`Hapus jadwal "${row.kegiatan}"?`)) return;
    try {
      await api.delete(`/schedules/${row._id}`);
      fetchData(search);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus data");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Jadwal Kegiatan</h1>
          <p className="text-gray-500 mt-1">
            Kelola jadwal kegiatan posyandu.
          </p>
        </div>
        <button onClick={openCreate} className={btnPrimaryClass}>
          + Tambah Jadwal
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kegiatan atau lokasi..."
          className={`${inputClass} max-w-sm`}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="text-center py-10 text-gray-400">Memuat data...</div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm py-10 text-center text-gray-400">
          Tidak ada jadwal
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((row) => (
            <div key={row._id} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center text-xl">
                  📅
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => openEdit(row)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(row)}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Hapus
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mt-3">{row.kegiatan}</h3>
              <p className="text-sm text-gray-500 mt-1">
                🗓 {formatTanggal(row.tanggal)}
              </p>
              {row.lokasi && (
                <p className="text-sm text-gray-500">📍 {row.lokasi}</p>
              )}
              {row.keterangan && (
                <p className="text-sm text-gray-500 mt-2">{row.keterangan}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? "Edit Jadwal" : "Tambah Jadwal"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</p>
          )}
          <div>
            <label className={labelClass}>Kegiatan</label>
            <input
              name="kegiatan"
              value={form.kegiatan}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Nama kegiatan"
            />
          </div>
          <div>
            <label className={labelClass}>Tanggal</label>
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
            <label className={labelClass}>Lokasi</label>
            <input
              name="lokasi"
              value={form.lokasi}
              onChange={handleChange}
              className={inputClass}
              placeholder="Tempat kegiatan"
            />
          </div>
          <div>
            <label className={labelClass}>Keterangan</label>
            <textarea
              name="keterangan"
              value={form.keterangan}
              onChange={handleChange}
              rows="3"
              className={inputClass}
              placeholder="Keterangan (opsional)"
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
    </div>
  );
}

export default Jadwal;