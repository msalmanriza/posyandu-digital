import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import InstallBanner from "../InstallBanner";

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed lg:hidden z-50 h-screen w-64 transition-transform duration-200 print:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>
      <div className="hidden lg:block w-64 shrink-0 print:hidden">
        <div className="h-screen sticky top-0 overflow-y-auto">
          <Sidebar />
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <InstallBanner />
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-30 print:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-primary-600"
          >
            ☰
          </button>
          <h1 className="font-bold text-primary-600">Posyandu ILP</h1>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;