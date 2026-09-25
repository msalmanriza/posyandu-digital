import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { inputClass } from "./ui";
import { hitungUmurTahun } from "../utils/helpers";

function PesertaRemajaSelect({
  value,
  onChange,
  name = "peserta",
  umurMin = 6,
  umurMax = 18,
  required = true,
}) {
  const [pesertas, setPesertas] = useState([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [invalidMsg, setInvalidMsg] = useState("");
  const rootRef = useRef(null);

  useEffect(() => {
    api
      .get("/peserta")
      .then(({ data }) => setPesertas(data))
      .catch(() => setPesertas([]));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const list = pesertas.filter((p) => {
    const usia = hitungUmurTahun(p.tanggalLahir);
    return usia != null && usia >= umurMin && usia <= umurMax;
  });

  const selected =
    list.find((p) => p._id === value) ||
    pesertas.find((p) => p._id === value) ||
    null;

  const q = query.trim().toLowerCase();
  const filtered = q
    ? list.filter(
        (p) =>
          (p.nama || "").toLowerCase().includes(q) ||
          (p.nik || "").toLowerCase().includes(q)
      )
    : list;

  const activeItem = filtered[Math.min(highlight, filtered.length - 1)];

  const selectPeserta = (p) => {
    onChange({ target: { name, value: p._id } });
    setQuery("");
    setHighlight(0);
    setOpen(false);
    setInvalidMsg("");
  };

  const clearSelection = () => {
    onChange({ target: { name, value: "" } });
    setQuery("");
    setOpen(true);
    setHighlight(0);
    setInvalidMsg("");
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    setHighlight(0);
    setInvalidMsg("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      setHighlight(0);
    } else if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && open) {
      if (activeItem) {
        e.preventDefault();
        selectPeserta(activeItem);
      } else {
        setOpen(false);
      }
    }
  };

  const displayValue = open ? query : selected ? selected.nama : "";

  return (
    <div className="relative" ref={rootRef}>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
          🔍
        </span>
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          value={displayValue}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ketik nama / NIK peserta (6 - 18 tahun) untuk mencari..."
          className={`${inputClass} pl-9`}
        />
        {selected && (
          <button
            type="button"
            onClick={clearSelection}
            title="Hapus pilihan"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {open && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 w-full max-h-56 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-400">
              Tidak ada peserta sesuai pencarian
            </li>
          ) : (
            filtered.map((p, i) => (
              <li key={p._id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={p._id === value}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectPeserta(p)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-primary-50 ${
                    i === highlight ? "bg-primary-50" : ""
                  }`}
                >
                  <span className="font-medium text-gray-800">{p.nama}</span>
                  {p.nik ? (
                    <span className="ml-2 text-xs text-gray-400">
                      NIK: {p.nik}
                    </span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      {invalidMsg && (
        <p className="mt-1 text-xs text-red-600">{invalidMsg}</p>
      )}

      <select
        name={name}
        value={value}
        required={required}
        onChange={() => {}}
        onInvalid={(e) => {
          e.preventDefault();
          setInvalidMsg("Silakan pilih peserta terlebih dahulu.");
        }}
        tabIndex={-1}
        className="sr-only"
      >
        <option value="">--</option>
        {list.map((p) => (
          <option key={p._id} value={p._id} />
        ))}
      </select>
    </div>
  );
}

export default PesertaRemajaSelect;