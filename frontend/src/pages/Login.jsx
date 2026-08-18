import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";

const bannerUrl =
  "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80";

const layanan = [
  {
    icon: "⚖️",
    judul: "Penimbangan",
    desc: "Catat berat & tinggi badan balita secara berkala dan akurat.",
  },
  {
    icon: "💉",
    judul: "Imunisasi",
    desc: "Rekam riwayat vaksinasi sesuai jadwal imunisasi nasional.",
  },
  {
    icon: "💊",
    judul: "Vitamin",
    desc: "Kelola pemberian vitamin rutin untuk tumbuh kembang anak.",
  },
  {
    icon: "📈",
    judul: "Monitoring Tumbuh Kembang",
    desc: "Pantau grafik pertumbuhan tiap anak dalam satu aplikasi.",
  },
];

const pengurus = [
  {
    nama: "Ibu Herawati",
    jabatan: "Ketua Posyandu",
    foto: "https://i.pravatar.cc/150?img=45",
  },
  {
    nama: "Ibu Siti",
    jabatan: "Kader Penimbangan",
    foto: "https://i.pravatar.cc/150?img=47",
  },
  {
    nama: "Ibu Rahma",
    jabatan: "Kader Imunisasi / Pencatatan",
    foto: "https://i.pravatar.cc/150?img=44",
  },
];

function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return (
      <Navigate
        to={
          user.role === "admin"
            ? "/dashboard/admin"
            : user.role === "parent"
            ? "/dashboard/parent"
            : "/dashboard"
        }
        replace
      />
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      navigate(
        data.role === "admin"
          ? "/dashboard/admin"
          : data.role === "parent"
          ? "/dashboard/parent"
          : "/dashboard"
      );
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden lg:block lg:w-[55%] xl:w-[58%] h-screen overflow-y-auto bg-white">
        <div className="relative">
          <img
            src={bannerUrl}
            alt="Ibu dan balita"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            className="w-full h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-700/90 via-primary-600/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
            <h1 className="text-3xl xl:text-4xl font-bold text-white">
              Posyandu Digital
            </h1>
            <p className="text-white/90 mt-2 max-w-md">
              Pencatatan kesehatan balita modern, akurat, dan terintegrasi.
            </p>
          </div>
        </div>

        <div className="p-8 lg:p-12 space-y-10">
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Layanan Posyandu
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {layanan.map((l) => (
                <div
                  key={l.judul}
                  className="bg-primary-50 rounded-2xl p-5 border border-primary-100"
                >
                  <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl mb-3">
                    {l.icon}
                  </div>
                  <p className="font-semibold text-gray-800">{l.judul}</p>
                  <p className="text-sm text-gray-500 mt-1">{l.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Struktur Organisasi & Pengurus Posyandu
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {pengurus.map((p) => (
                <div
                  key={p.nama}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center"
                >
                  <img
                    src={p.foto}
                    alt={p.nama}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    className="w-20 h-20 rounded-full object-cover mx-auto bg-gray-100"
                  />
                  <p className="font-semibold text-gray-800 mt-3">{p.nama}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{p.jabatan}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Jadwal Posyandu & Kontak
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                  Jadwal Posyandu
                </p>
                <p className="font-medium text-gray-800 mt-2">
                  Setiap tanggal 10 tiap bulan
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  08.00 - 12.00 WIB di Balai Desa
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                  Alamat & Kontak
                </p>
                <p className="font-medium text-gray-800 mt-2">
                  Jl. Melati No. 5, Desa Posyandu
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  📞 0812-3456-7890 · posyandudigital@mail.com
                </p>
              </div>
            </div>
          </section>

          <footer className="text-xs text-gray-400">
            &copy; 2026 Posyandu Digital. Dibuat dengan ❤️ untuk kesehatan balita.
          </footer>
        </div>
      </div>

      <div className="flex-1 lg:w-[45%] xl:w-[42%] h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-4 bg-primary-600 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🏥</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Selamat Datang</h1>
            <p className="text-sm text-gray-500 mt-1">
              Masuk untuk melanjutkan ke portal Anda
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="nama@posyandu.id"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <PasswordInput
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;