import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import Modal from "../components/Modal";
import { inputClass, labelClass, btnPrimaryClass, btnSecondaryClass } from "../components/ui";
import { formatTanggal } from "../utils/helpers";

const initialForm = { judul: "", isi: "", tanggal: "" };

function Pengumuman() {
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
      const { data } = await api.get("/announcements", {
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
      judul: row.judul,
      isi: row.isi,
      tanggal: row.tanggal ? row.tanggal.slice(0, 10) : "",
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
        await api.put(`/announcements/${editing._id}`, form);
      } else {
        await api.post("/announcements", form);
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
    if (!window.confirm(`Hapus pengumuman "${row.judul}"?`)) return;
    try {
      await api.delete(`/announcements/${row._id}`);
      fetchData(search);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus data");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pengumuman</h1>
          <p className="text-gray-500 mt-1">
            Kelola informasi untuk orang tua peserta posyandu.
          </p>
        </div>
        <button onClick={openCreate} className={btnPrimaryClass}>
          + Tambah Pengumuman
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari judul pengumuman..."
          className={`${inputClass} max-w-sm`}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="text-center py-10 text-gray-400">Memuat data...</div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm py-10 text-center text-gray-400">
          Tidak ada pengumuman
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((row) => (
            <div key={row._id} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{row.judul}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    📢 {formatTanggal(row.tanggal)}
                  </p>
                  <p className="text-sm text-gray-600 mt-3 whitespace-pre-line">
                    {row.isi}
                  </p>
                </div>
                <div className="flex gap-3 shrink-0">
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
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? "Edit Pengumuman" : "Tambah Pengumuman"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</p>
          )}
          <div>
            <label className={labelClass}>Judul</label>
            <input
              name="judul"
              value={form.judul}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Judul pengumuman"
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
            <label className={labelClass}>Isi</label>
            <textarea
              name="isi"
              value={form.isi}
              onChange={handleChange}
              required
              rows="4"
              className={inputClass}
              placeholder="Isi pengumuman"
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

export default Pengumuman;