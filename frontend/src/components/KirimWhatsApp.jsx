import { SearchIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { getKategoriUmur, hitungUmur } from "../utils/helpers";

function KirimWhatsApp() {
  const [peserta, setPeserta] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [animateIn, setAnimateIn] = useState(false);
  const [invalidMsg, setInvalidMsg] = useState("");
  const rafRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    api
      .get("/peserta")
      .then(({ data }) => setPeserta(Array.isArray(data) ? data : []))
      .catch(() => setPeserta([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && !rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        setAnimateIn(true);
      });
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [loading]);

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = normalizedQuery
    ? peserta.filter((p) => {
        const nama = (p.nama || "").toLowerCase();
        const namaOrtu = (p.namaOrangTua || p.orangTua?.nama || "").toLowerCase();
        const telpPeserta = (p.telepon || "").toLowerCase();
        const telpOrtu = (p.orangTua?.telepon || "").toLowerCase();
        return (
          nama.includes(normalizedQuery) ||
          namaOrtu.includes(normalizedQuery) ||
          telpPeserta.includes(normalizedQuery) ||
          telpOrtu.includes(normalizedQuery)
        );
      })
    : peserta;

  const selected =
    filtered.find((p) => p._id === selectedId) ||
    peserta.find((p) => p._id === selectedId);

  const normalizeWa = (raw) => {
    if (!raw) return "";
    const digits = String(raw).replace(/\D/g, "");
    if (!digits) return "";
    return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  };

  const waNumber =
    normalizeWa(selected?.telepon) || normalizeWa(selected?.orangTua?.telepon);

  const activeItem =
    filtered.length > 0
      ? filtered[Math.min(highlight, filtered.length - 1)]
      : undefined;

  const selectPeserta = (p) => {
    setSelectedId(p._id);
    setQuery("");
    setOpen(false);
    setHighlight(0);
    setInvalidMsg("");
  };

  const clearSelection = () => {
    setSelectedId("");
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
      setHighlight((h) =>
        filtered.length > 0 ? Math.min(h + 1, filtered.length - 1) : 0
      );
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

  const noResults = open && !loading && filtered.length === 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
        setHighlight(0);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = () => {
    if (!selected || !waNumber) return;

    const kategoriRow =
      selected.kategori ||
      (typeof getKategoriUmur === "function"
        ? getKategoriUmur(selected.tanggalLahir)
        : "Peserta Posyandu");

    const isBalita = /balita|bayi|anak/i.test(String(kategoriRow));
    const usiaText = hitungUmur(selected.tanggalLahir);
    const jkText = selected.jenisKelamin === "L" ? "Laki-laki" : "Perempuan";
    const kontakText = selected.telepon || selected.orangTua?.telepon || "-";

    const bagianInformasi = isBalita
      ? [
          `*Informasi Pertumbuhan & Layanan:*`,
          `Kami dari *ILP Kartini 21* izin menyampaikan informasi perkembangan serta layanan Posyandu terkait pemantauan pertumbuhan anak, penimbangan rutin, dan kelengkapan imunisasi sesuai usia.`,
          `Mohon dapat membawa *${selected.nama}* ke Posyandu secara rutin untuk pemantauan tumbuh kembang serta imunisasi berikutnya.`,
        ]
      : [
          `*Informasi Layanan Kesehatan:*`,
          `Kami dari *ILP Kartini 21* izin menyampaikan informasi layanan Posyandu terkait penimbangan, imunisasi/layanan kesehatan, serta pemantauan kesehatan secara berkala.`,
          `Mohon dapat hadir kembali ke Posyandu sesuai jadwal layanan maupun imunisasi berikutnya.`,
        ];

    const pesan = [
      `Selamat pagi, Bapak/Ibu.`,
      ``,
      `Kami dari *ILP Kartini 21* izin menyampaikan informasi dari layanan *Posyandu Digital* terkait data dan pemantauan kesehatan peserta berikut:`,
      ``,
      `– Nama: ${selected.nama}`,
      `– Usia: ${usiaText}`,
      `– Jenis Kelamin: ${jkText}`,
      `– Kategori: ${kategoriRow}`,
      `– No. HP/WA: ${kontakText}`,
      ``,
      ...bagianInformasi,
      ``,
      `Jangan lupa untuk datang kembali ke Posyandu untuk penimbangan dan imunisasi berikutnya, serta konsultasikan kondisi peserta bersama kader Posyandu.`,
      ``,
      `Hormat kami,`,
      `*ILP Kartini 21*`,
    ]
      .filter((line) => line !== undefined && line !== null)
      .join("\n");

    window.open(
      `https://wa.me/${waNumber}?text=${encodeURIComponent(pesan)}`,
      "_blank"
    );
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-sm p-6"
      style={{
        opacity: animateIn ? 1 : 0,
        transition: "opacity 500ms ease-in-out",
      }}
      ref={rootRef}
    >
      <h2 className="font-semibold text-gray-800 mb-1">
        Kirim Ringkasan ke WhatsApp
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Pilih peserta, lalu kirim ringkasan datanya ke nomor HP peserta atau orang tua
      </p>

      <div className="relative">
        <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          disabled={loading}
          value={open ? query : selected ? selected.nama : ""}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            loading
              ? "Memuat peserta..."
              : "Cari nama peserta, nama orang tua, atau nomor HP..."
          }
          className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        {selected && !loading && (
          <button
            type="button"
            onClick={clearSelection}
            title="Hapus pilihan"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
          >
            ✕
          </button>
        )}

        {open && !loading && (
          <ul
            role="listbox"
            className="absolute z-30 mt-1 w-full max-h-64 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg left-0 right-0"
          >
            {noResults ? (
              <li className="px-3 py-2 text-sm text-gray-400">
                Tidak ditemukan
              </li>
            ) : (
              filtered.map((p, i) => {
                const displayOrtu = p.namaOrangTua || p.orangTua?.nama;
                const displayHp = p.telepon || p.orangTua?.telepon;
                return (
                  <li key={p._id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={p._id === selectedId}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectPeserta(p)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-primary-50 ${
                        i === highlight ? "bg-primary-50" : ""
                      }`}
                    >
                      <span className="font-medium text-gray-800">
                        {p.nama}
                      </span>
                      {displayOrtu && (
                        <span className="ml-2 text-xs text-gray-400">
                          ({displayOrtu})
                        </span>
                      )}
                      {displayHp && (
                        <span className="ml-2 text-xs text-gray-500">
                          HP: {displayHp}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>

      {invalidMsg && (
        <p className="mt-1 text-xs text-red-600">{invalidMsg}</p>
      )}

      {selected && !waNumber && (
        <p className="text-xs text-amber-600 mt-2">
          Tidak ditemukan nomor HP/WA untuk {selected.nama}.
        </p>
      )}

      {selected && waNumber && (
        <p className="text-xs text-gray-400 mt-2">
          Mengirim ke:{" "}
          {selected.telepon || selected.orangTua?.telepon || "orang tua"}
        </p>
      )}

      <div className="mt-4">
        <button
          type="button"
          onClick={handleSend}
          disabled={!selected || !waNumber}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.04 2a9.9 9.9 0 0 0-8.57 14.86L2 22l5.28-1.4A9.96 9.96 0 1 0 12.04 2zm5.86 14.1c-.24.68-1.4 1.3-1.94 1.35-.52.05-1.02.24-3.43-.72-2.9-1.15-4.73-4.13-4.88-4.32-.14-.19-1.16-1.55-1.16-2.96s.74-2.1 1-2.39c.26-.28.57-.35.76-.35h.55c.18 0 .42-.07.66.5.24.58.83 2.01.9 2.16.07.14.12.31.02.5-.1.19-.15.31-.3.48-.15.17-.31.38-.45.51-.15.14-.3.3-.13.58.17.29.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.35 1.46.29.14.46.12.63-.07.17-.19.72-.84.92-1.13.19-.29.39-.24.65-.14.26.09 1.67.79 1.96.93.29.14.48.21.55.33.07.12.07.7-.17 1.38z" />
          </svg>
          Kirim Ringkasan ke WhatsApp
        </button>
      </div>
    </div>
  );
}

export default KirimWhatsApp;