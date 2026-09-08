import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import OrangTua from "./pages/OrangTua";
import Peserta from "./pages/Peserta";
import Penimbangan from "./pages/Penimbangan";
import Imunisasi from "./pages/Imunisasi";
import Vitamin from "./pages/Vitamin";
import Kehadiran from "./pages/Kehadiran";
import Jadwal from "./pages/Jadwal";
import Pengumuman from "./pages/Pengumuman";
import Laporan from "./pages/Laporan";
import ParentDashboard from "./pages/ParentDashboard";
import ParentProfil from "./pages/ParentProfil";
import ParentPeserta from "./pages/ParentPeserta";
import ParentPesertaDetail from "./pages/ParentPesertaDetail";
import ParentJadwal from "./pages/ParentJadwal";

const PesertaDetail = lazy(() => import("./pages/PesertaDetail"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

const PageLoader = () => (
  <div className="flex items-center justify-center py-16">
    <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/admin" element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminDashboard />
                  </Suspense>
                } />
              <Route path="/dashboard/parent" element={<ParentDashboard />} />
              <Route path="/parent/profil" element={<ParentProfil />} />
              <Route path="/parent/peserta" element={<ParentPeserta />} />
              <Route path="/parent/peserta/:id" element={<ParentPesertaDetail />} />
              <Route path="/parent/jadwal" element={<ParentJadwal />} />
              <Route path="/orang-tua" element={<OrangTua />} />
              <Route path="/peserta" element={<Peserta />} />
              <Route path="/peserta/:id" element={
                  <Suspense fallback={<PageLoader />}>
                    <PesertaDetail />
                  </Suspense>
                } />
              <Route path="/penimbangan" element={<Penimbangan />} />
              <Route path="/imunisasi" element={<Imunisasi />} />
              <Route path="/vitamin" element={<Vitamin />} />
              <Route path="/kehadiran" element={<Kehadiran />} />
              <Route path="/jadwal" element={<Jadwal />} />
              <Route path="/pengumuman" element={<Pengumuman />} />
              <Route path="/laporan" element={<Laporan />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;