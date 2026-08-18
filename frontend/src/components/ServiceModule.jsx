import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Modal from "./Modal";
import PesertaSelect from "./PesertaSelect";
import { inputClass, labelClass, btnPrimaryClass, btnSecondaryClass } from "./ui";
import { formatTanggal } from "../utils/helpers";

function ServiceModule({ apiPath, title, description, fields, columns, initialForm }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [searchParams, setSearchParams] = useSearchParams();
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
      const { data } = await api.get(apiPath, { params });
      setData(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [apiPath, search, tanggalFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  useEffect(() => {
    if (searchParams.get("input") === "1" && !isAdmin) {
      setEditing(null);
      setForm(initialForm);
      setError("");
      setModalOpen(true);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    const next = {};
    for (const f of fields) {
      if (f.name === "peserta") {
        next.peserta = row.peserta?._id || "";
      } else if (f.name === "tanggal") {
        next.tanggal = row.tanggal ? row.tanggal.slice(0, 10) : "";
      } else {
        next[f.name] = row[f.name] ?? "";
      }
    }
    setForm(next);
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
    const payload = { ...form };
    for (const f of fields) {
      if (f.type === "number" && payload[f.name] !== "") {
        payload[f.name] = Number(payload[f.name]);
      }
    }
    if (!payload.peserta) payload.peserta = undefined;
    try {
      if (editing) {
        await api.put(`${apiPath}/${editing._id}`, payload);
      } else {
        await api.post(apiPath, payload);
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
    if (!window.confirm("Hapus data ini?")) return;
    try {
      await api.delete(`${apiPath}/${row._id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus data");
    }
  };

  const colSpan = columns.length + (isAdmin ? 2 : 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-500 mt-1">{description}</p>
        </div>
        {isAdmin ? (
          <span className="inline-flex self-start px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full">
            Mode Baca (Read-Only)
          </span>
        ) : (
          <button onClick={openCreate} className={btnPrimaryClass}>
            + Input {title}
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
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 font-medium">
                    {col.label}
                  </th>
                ))}
                {!isAdmin && (
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-8 text-center text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-8 text-center text-gray-400">
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
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-gray-600">
                        {col.render ? col.render(row) : row[col.key] ?? "-"}
                      </td>
                    ))}
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
        title={editing ? `Edit ${title}` : `Input ${title}`}
        onClose={() => setModalOpen(false)}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</p>
          )}
          <div>
            <label className={labelClass}>Peserta (Balita)</label>
            <PesertaSelect value={form.peserta} onChange={handleChange} />
          </div>
          {fields.map((f) =>
            f.name !== "peserta" ? (
              <div key={f.name}>
                <label className={labelClass}>{f.label}</label>
                {f.type === "select" ? (
                  <select
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    required={f.required}
                    className={inputClass}
                  >
                    {!f.required && <option value="">-- Pilih --</option>}
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type || "text"}
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    required={f.required}
                    step={f.step}
                    min={f.min}
                    className={inputClass}
                    placeholder={f.placeholder}
                  />
                )}
              </div>
            ) : null
          )}
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

export default ServiceModule;