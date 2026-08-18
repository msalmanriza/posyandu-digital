import { useEffect, useState } from "react";
import api from "../services/api";
import { formatTanggal, hitungUmur } from "../utils/helpers";

function KirimWhatsApp() {
  const [peserta, setPeserta] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/peserta")
      .then(({ data }) => setPeserta(data))
      .catch(() => setPeserta([]))
      .finally(() => setLoading(false));
  }, []);

  const selected = peserta.find((p) => p._id === selectedId);
  const telepon = selected?.orangTua?.telepon || "";
  const nomor = telepon.replace(/\D/g, "").replace(/^0/, "62");

  const handleSend = () => {
    if (!selected) return;
    const pesan = [
      `*Ringkasan Anak Posyandu Digital*`,
      ``,
      `Nama: ${selected.nama}`,
      `JK: ${selected.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}`,
      `Usia: ${hitungUmur(selected.tanggalLahir)}`,
      `Orang Tua: ${selected.namaOrangTua || "-"}`,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(
      `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`,
      "_blank"
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="font-semibold text-gray-800 mb-1">
        Kirim Ringkasan ke WhatsApp
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Pilih anak, lalu kirim ringkasan datanya ke nomor HP orang tua
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">
            {loading ? "Memuat peserta..." : "-- Pilih Anak / Peserta --"}
          </option>
          {peserta.map((p) => (
            <option key={p._id} value={p._id}>
              {p.nama} — {p.namaOrangTua || "Tanpa orang tua"}
            </option>
          ))}
        </select>
        <button
          onClick={handleSend}
          disabled={!selected || !nomor}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.04 2a9.9 9.9 0 0 0-8.57 14.86L2 22l5.28-1.4A9.96 9.96 0 1 0 12.04 2zm5.86 14.1c-.24.68-1.4 1.3-1.94 1.35-.52.05-1.02.24-3.43-.72-2.9-1.15-4.73-4.13-4.88-4.32-.14-.19-1.16-1.55-1.16-2.96s.74-2.1 1-2.39c.26-.28.57-.35.76-.35h.55c.18 0 .42-.07.66.5.24.58.83 2.01.9 2.16.07.14.12.31.02.5-.1.19-.15.31-.3.48-.15.17-.31.38-.45.51-.15.14-.3.3-.13.58.17.29.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.35 1.46.29.14.46.12.63-.07.17-.19.72-.84.92-1.13.19-.29.39-.24.65-.14.26.09 1.67.79 1.96.93.29.14.48.21.55.33.07.12.07.7-.17 1.38z" />
          </svg>
          Kirim Ringkasan ke WhatsApp
        </button>
      </div>
      {selected && !nomor && (
        <p className="text-xs text-amber-600 mt-2">
          Nomor HP orang tua untuk {selected.nama} belum terdaftar.
        </p>
      )}
      {selected && nomor && (
        <p className="text-xs text-gray-400 mt-2">
          Mengirim ke: {telepon} ({selected.namaOrangTua || "orang tua"})
        </p>
      )}
    </div>
  );
}

export default KirimWhatsApp;