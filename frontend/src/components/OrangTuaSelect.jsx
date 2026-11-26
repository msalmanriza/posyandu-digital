import { SearchIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { inputClass } from "./ui";

function OrangTuaSelect({
  value,
  onChange,
  orangTuas,
  name = "orangTua",
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [invalidMsg, setInvalidMsg] = useState("");
  const rootRef = useRef(null);

  const filtered = query.trim()
    ? orangTuas.filter((ot) =>
        (ot.nama || "").toLowerCase().includes(query.trim().toLowerCase()) ||
        (ot.nik || "").toLowerCase().includes(query.trim().toLowerCase()) ||
        (ot.alamat || "").toLowerCase().includes(query.trim().toLowerCase())
      )
    : orangTuas;

  const selected = filtered.find((ot) => ot._id === value) || orangTuas.find((ot) => ot._id === value);

  const q = query.trim().toLowerCase();

  const activeItem = filtered[Math.min(highlight, filtered.length - 1)];

  const selectOrangTua = (ot) => {
    onChange(ot._id);
    setQuery("");
    setOpen(false);
    setHighlight(0);
    setInvalidMsg("");
  };

  const clearSelection = () => {
    onChange("");
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
        selectOrangTua(activeItem);
      } else {
        setOpen(false);
      }
    }
  };

  const displayValue = open ? query : selected ? selected.nama : "";

  const noResults = open && filtered.length === 0;

  return (
    <div className="relative" ref={rootRef}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
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
          placeholder="Cari nama / NIK orang tua..."
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
          className="absolute z-30 mt-1 w-full max-h-64 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg"
          style={{ maxWidth: "250px" }}
        >
          {noResults ? (
            <li className="px-3 py-2 text-sm text-gray-400">
              Data tidak ditemukan
            </li>
          ) : (
            filtered.map((ot, i) => (
              <li key={ot._id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={ot._id === value}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectOrangTua(ot)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-primary-50 ${
                    i === highlight ? "bg-primary-50" : ""
                  }`}
                >
                  <span className="font-medium text-gray-800">{ot.nama}</span>
                  {ot.nik && (
                    <span className="ml-2 text-xs text-gray-400">
                      NIK: {ot.nik}
                    </span>
                  )}
                  {ot.alamat && (
                    <span className="ml-2 text-xs text-gray-500">
                      {ot.alamat}
                    </span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      {invalidMsg && (
        <p className="mt-1 text-xs text-red-600">{invalidMsg}</p>
      )}
    </div>
  );
}

export default OrangTuaSelect;