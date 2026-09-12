import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const kaderMenu = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/orang-tua", label: "Orang Tua", icon: "👨‍👩‍👧" },
  { to: "/peserta", label: "Peserta Posyandu", icon: "👶" },
  { to: "/penimbangan", label: "Penimbangan", icon: "⚖️" },
  { to: "/imunisasi", label: "Imunisasi", icon: "💉" },
  { to: "/vitamin", label: "Vitamin", icon: "💊" },
  { to: "/skrining-lansia", label: "Skrining Lansia", icon: "🩺" },
  { to: "/pemeriksaan-dewasa", label: "Periksa Dewasa & Lansia", icon: "🩻" },
  { to: "/kehadiran", label: "Kehadiran", icon: "📋" },
  { to: "/jadwal", label: "Jadwal", icon: "📅" },
  { to: "/pengumuman", label: "Pengumuman", icon: "📢" },
  { to: "/laporan", label: "Laporan", icon: "📊" },
];

const adminMenu = [
  { to: "/dashboard/admin", label: "Dashboard", icon: "🏠" },
  { group: "Rekap Master Data" },
  { to: "/orang-tua", label: "Orang Tua", icon: "👨‍👩‍👧", indent: true },
  { to: "/peserta", label: "Peserta Posyandu", icon: "👶", indent: true },
  { group: "Rekap Pelayanan" },
  { to: "/penimbangan", label: "Penimbangan", icon: "⚖️", indent: true },
  { to: "/imunisasi", label: "Imunisasi", icon: "💉", indent: true },
  { to: "/vitamin", label: "Vitamin", icon: "💊", indent: true },
  { to: "/skrining-lansia", label: "Skrining Lansia", icon: "🩺", indent: true },
  { to: "/pemeriksaan-dewasa", label: "Periksa Dewasa & Lansia", icon: "🩻", indent: true },
  { to: "/laporan", label: "Laporan & Export", icon: "📊" },
];

const parentMenu = [
  { to: "/dashboard/parent", label: "Dashboard", icon: "🏠" },
  { to: "/parent/profil", label: "Profil Orang Tua", icon: "👨‍👩‍👧" },
  { to: "/parent/peserta", label: "Profil Peserta", icon: "👶" },
  { to: "/parent/jadwal", label: "Jadwal Posyandu", icon: "📅" },
];

function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";
  const isParent = user?.role === "parent";
  const items = isAdmin ? adminMenu : isParent ? parentMenu : kaderMenu;

  const handleNav = () => {
    if (onNavigate) onNavigate();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-100">
        <h1 className="text-lg font-bold text-primary-600">ILPKartini21</h1>
        <p className="text-xs text-gray-400">Integrasi Layanan Primer</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item, idx) =>
          item.group ? (
            <p
              key={`group-${idx}`}
              className="px-3 pt-4 pb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400"
            >
              {item.group}
            </p>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNav}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-primary-50 hover:text-primary-700"
                } ${item.indent ? "pl-8" : ""}`
              }
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          )
        )}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
            {(user?.nama || "Siti Kader").charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {user?.nama || "Siti Kader"}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role || "Kader"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 w-full text-sm px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;