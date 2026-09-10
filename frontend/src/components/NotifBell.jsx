import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const typeStyles = {
  jadwal: "bg-blue-100 text-blue-700",
  kesehatan: "bg-red-100 text-red-700",
  laporan: "bg-amber-100 text-amber-700",
};

const typeLabel = {
  jadwal: "Pengingat Jadwal",
  kesehatan: "Peringatan Dini Gizi",
  laporan: "Pengingat Laporan",
};

function NotifBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (user?.role !== "kader" && user?.role !== "admin") return;
    api
      .get("/dashboard/alerts")
      .then(({ data }) => setAlerts(data.alerts || []))
      .catch(() => setAlerts([]));
  }, [user?.role]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 rounded-full bg-primary-100 hover:bg-primary-200 text-primary-700 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 hover:rotate-6"
        aria-label="Notifikasi operasional"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {alerts.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center leading-none">
            {alerts.length > 9 ? "9+" : alerts.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] z-20">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">
                  Notifikasi Operasional & Peringatan Dini
                </p>
                {alerts.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                    {alerts.length} menunggu tindakan
                  </span>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <div className="text-3xl mb-2">✅</div>
                    <p className="text-sm text-gray-400">
                      Tidak ada peringatan. Semua aman.
                    </p>
                  </div>
                ) : (
                  alerts.map((a) => (
                    <div
                      key={a.key}
                      className="px-4 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50"
                    >
                      <div className="flex gap-3">
                        <span className="text-lg shrink-0">{a.icon}</span>
                        <div className="min-w-0 flex-1">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold mb-1 ${
                              typeStyles[a.type] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {typeLabel[a.type] || a.type}
                          </span>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {a.text}
                          </p>
                          <Link
                            to={a.link}
                            className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
                          >
                            {a.linkLabel} →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Komunikasi utama ke orang tua tetap melalui fitur{" "}
                  <span className="font-semibold text-primary-600">
                    Kirim WhatsApp
                  </span>{" "}
                  di halaman dashboard.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotifBell;