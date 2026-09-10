import { useEffect, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";
import pengurus1 from "../assets/pengurus/pengurus1.jpeg";
import pengurus2 from "../assets/pengurus/pengurus2.png";
import pengurus3 from "../assets/pengurus/pengurus3.png";
import pengurus4 from "../assets/pengurus/pengurus4.png";
import pengurus5 from "../assets/pengurus/pengurus5.png";
import pengurus6 from "../assets/pengurus/pengurus6.png";
import pengurus7 from "../assets/pengurus/pengurus7.png";
import pengurus8 from "../assets/pengurus/pengurus8.png";
import pengurus9 from "../assets/pengurus/pengurus9.png";
import pengurus10 from "../assets/pengurus/pengurus10.png";
import landing1 from "../assets/landing-page/landing-page 1.jpg";
import landing2 from "../assets/landing-page/landing-page 2.jpg";
import landing3 from "../assets/landing-page/landing-page 3.jpg";
import landing4 from "../assets/landing-page/landing-page 4.jpg";

const heroSlides = [
  { src: landing1, alt: "Kegiatan Posyandu - Pemeriksaan Balita" },
  { src: landing2, alt: "Kegiatan Posyandu - Pelayanan Kesehatan" },
  { src: landing3, alt: "Kegiatan Posyandu - Pemeriksaan Anak & Lansia" },
  { src: landing4, alt: "Kegiatan Posyandu - Kader Posyandu" },
];

const layanan = [
  {
    icon: "👶",
    judul: "Pemeriksaan Bayi, Balita & Apras",
    desc: "Pemantauan rutin tumbuh kembang, penimbangan berat badan, pengukuran tinggi badan, stimulasi edukasi, serta pemberian imunisasi dan vitamin.",
  },
  {
    icon: "🧒",
    judul: "Pemeriksaan Anak Usia Sekolah & Remaja",
    desc: "Skrining kesehatan berkala, pemantauan status gizi, edukasi gaya hidup sehat, serta pencegahan anemia pada usia remaja.",
  },
  {
    icon: "🧑",
    judul: "Pemeriksaan Dewasa & Usia Produktif",
    desc: "Deteksi dini faktor risiko penyakit tidak menular (PTM) seperti cek tekanan darah, gula darah, serta edukasi kesehatan keluarga.",
  },
  {
    icon: "🧓",
    judul: "Pemeriksaan Lansia",
    desc: "Skrining kesehatan usia lanjut, pemantauan kondisi fisik dan kognitif, serta pendampingan pola hidup sehat untuk lansia mandiri.",
  },
];

const pengurus = [
  { nama: "Eny Cahyawati", jabatan: "Ketua Posyandu", foto: pengurus4 },
  { nama: "Hafnidah", jabatan: "Wakil Ketua", foto: pengurus6 },
  { nama: "Shasty Pramahesty", jabatan: "Sekretaris", foto: pengurus9 },
  { nama: "Noor Umi Rochmah", jabatan: "Bendahara", foto: pengurus10 },
  { nama: "Upi Hermawati", jabatan: "Kader Kesehatan Ibu & Anak", foto: pengurus1 },
  { nama: "Ningrum Trisanti", jabatan: "Kader Imunisasi", foto: pengurus7 },
  { nama: "Sarjiati", jabatan: "Kader Keluarga Berencana", foto: pengurus8 },
  null,
  { nama: "Noor Farida", jabatan: "Kader Gizi", foto: pengurus5 },
  { nama: "Pengurus 2", jabatan: "Jabatan/Role Baru 1", foto: pengurus2 },
  null,
  { nama: "Pengurus 3", jabatan: "Jabatan/Role Baru 2", foto: pengurus3 },
];

function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setSlide((s) => (s + 1) % heroSlides.length),
      4000
    );
    return () => clearInterval(timer);
  }, []);

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
          <div className="relative h-[300px] xl:h-[340px] overflow-hidden">
            {heroSlides.map((s, i) => (
              <img
                key={s.src}
                src={s.src}
                alt={s.alt}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                  i === slide ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-end pb-16 px-8 lg:px-12">
              <div className="max-w-md">
                <h1 className="text-3xl xl:text-4xl font-bold text-white">
                  ILPKartini21
                </h1>
                <p className="text-white/95 mt-2">
                  Sistem informasi kesehatan terpadu Posyandu Kartini 21 untuk
                  pemantauan tumbuh kembang dan pelayanan kesehatan seluruh
                  siklus hidup keluarga secara akurat, modern, dan terintegrasi.
                </p>
              </div>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {heroSlides.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  onClick={() => setSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === slide
                      ? "w-6 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pengurus.map((p, i) =>
                p ? (
                  <div
                    key={i}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center"
                  >
                    <img
                      src={p.foto}
                      alt={p.nama}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      className="w-24 h-28 rounded-2xl object-cover object-top mx-auto bg-gray-100"
                    />
                    <p className="font-semibold text-gray-800 mt-3">{p.nama}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{p.jabatan}</p>
                  </div>
                ) : (
                  <div key={i} className="hidden md:block"></div>
                )
              )}
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
                  Setiap Hari Rabu Minggu ke 3
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  09.00 - 12.00 WIB di Kartini 21
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                  Alamat & Kontak
                </p>
                <p className="font-medium text-gray-800 mt-2">
                  Jl.Manyar Utama 1 
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  📞 0812-3456-7890 · kartini21@gmail.com
                </p>
              </div>
            </div>
          </section>

          <footer className="text-xs text-gray-400">
            &copy; 2026 ILPKartini21.
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