import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { inputClass, labelClass } from "../components/ui";
import PasswordInput from "../components/PasswordInput";

const initialForm = {
  nama: "",
  email: "",
  password: "",
  konfirmasiPassword: "",
  telepon: "",
  alamat: "",
  umur: "",
  statusKb: "Tidak",
  jumlahAnak: "",
  statusHamil: "Tidak",
  statusBPJS: "Tidak",
};

const initialAnak = {
  nama: "",
  tanggalLahir: "",
  nik: "",
  jenisKelamin: "L",
  statusBPJSAnak: "Tidak",
};

const statusOptions = ["Ya", "Tidak"];

function Register() {
  const { user, setSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [anak, setAnak] = useState(initialAnak);
  const [anakAktif, setAnakAktif] = useState(false);
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

  const handleAnakChange = (e) => {
    setAnak({ ...anak, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.konfirmasiPassword) {
      setError("Password dan konfirmasi password tidak sama");
      return;
    }
    setLoading(true);
    try {
      const { konfirmasiPassword, ...formData } = form;
      const payload = {
        ...formData,
        umur: Number(form.umur),
        jumlahAnak: Number(form.jumlahAnak),
      };
      if (anakAktif && anak.nama && anak.tanggalLahir && anak.jenisKelamin) {
        payload.anak = {
          nama: anak.nama,
          tanggalLahir: anak.tanggalLahir,
          nik: anak.nik || "",
          jenisKelamin: anak.jenisKelamin,
          statusBPJSAnak: anak.statusBPJSAnak,
        };
      }
      const { data } = await api.post("/auth/register-parent", payload);
      setSession(
        { _id: data._id, nama: data.nama, email: data.email, role: data.role },
        data.token
      );
      navigate("/dashboard/parent");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registrasi gagal, coba lagi"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 bg-primary-600 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">👨‍👩‍👧</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Registrasi Orang Tua
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Daftar akun untuk memantau tumbuh kembang anak Anda
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h2 className="font-semibold text-gray-800 mb-3">
                Data Orang Tua
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Nama Lengkap Orang Tua</label>
                  <input
                    name="nama"
                    value={form.nama}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="Nama lengkap Anda"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Email / Username</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="nama@email.com"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Password</label>
                    <PasswordInput
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className={inputClass}
                      placeholder="Minimal 6 karakter"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Konfirmasi Password</label>
                  <PasswordInput
                    name="konfirmasiPassword"
                    value={form.konfirmasiPassword}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="Ulangi password Anda"
                  />
                </div>
                <div>
                  <label className={labelClass}>Nomor HP / WhatsApp</label>
                  <input
                    name="telepon"
                    value={form.telepon}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className={labelClass}>Alamat Lengkap</label>
                  <textarea
                    name="alamat"
                    value={form.alamat}
                    onChange={handleChange}
                    rows="2"
                    className={inputClass}
                    placeholder="Alamat rumah Anda"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Umur Orang Tua</label>
                    <input
                      type="number"
                      name="umur"
                      value={form.umur}
                      onChange={handleChange}
                      required
                      min={15}
                      max={100}
                      className={inputClass}
                      placeholder="Contoh: 30"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Jumlah Anak</label>
                    <input
                      type="number"
                      name="jumlahAnak"
                      value={form.jumlahAnak}
                      onChange={handleChange}
                      required
                      min={0}
                      className={inputClass}
                      placeholder="Contoh: 2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Status KB</label>
                    <select
                      name="statusKb"
                      value={form.statusKb}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      {statusOptions.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Status Hamil</label>
                    <select
                      name="statusHamil"
                      value={form.statusHamil}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      {statusOptions.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Status BPJS</label>
                    <select
                      name="statusBPJS"
                      value={form.statusBPJS}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      {statusOptions.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-800">Data Anak / Balita</h2>
                <label className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={anakAktif}
                    onChange={(e) => setAnakAktif(e.target.checked)}
                    className="w-4 h-4 text-primary-600"
                  />
                  Isi sekarang (opsional)
                </label>
              </div>

              {anakAktif ? (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Nama Anak</label>
                    <input
                      name="nama"
                      value={anak.nama}
                      onChange={handleAnakChange}
                      className={inputClass}
                      placeholder="Nama lengkap anak"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Tanggal Lahir</label>
                      <input
                        type="date"
                        name="tanggalLahir"
                        value={anak.tanggalLahir}
                        onChange={handleAnakChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>NIK Anak (opsional)</label>
                      <input
                        name="nik"
                        value={anak.nik}
                        onChange={handleAnakChange}
                        maxLength={16}
                        className={inputClass}
                        placeholder="16 digit NIK"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Jenis Kelamin</label>
                      <select
                        name="jenisKelamin"
                        value={anak.jenisKelamin}
                        onChange={handleAnakChange}
                        className={inputClass}
                      >
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Status BPJS Anak</label>
                      <select
                        name="statusBPJSAnak"
                        value={anak.statusBPJSAnak}
                        onChange={handleAnakChange}
                        className={inputClass}
                      >
                        <option value="Tidak">Tidak</option>
                        <option value="Ya">Ya</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  Anda dapat menambahkan data anak setelah mendaftar melalui
                  Portal Orang Tua.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? "Mendaftarkan..." : "Daftar"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; 2026 Posyandu Digital
        </p>
      </div>
    </div>
  );
}

export default Register;