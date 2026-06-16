import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Menu } from "lucide-react";
import  LandingPage  from "./pages/LandingPage";
import  LoginPage  from "./pages/LoginPage";
import  Dashboard  from "./pages/Dashboard";
import  POSPage  from "./pages/POSPage";
import  ProductsPage  from "./pages/ProductsPage";
import  ReportsPage  from "./pages/ReportsPage";
import  Sidebar  from "./components/Sidebar";
import "./App.css";


type AppView = "landing" | "login" | "app";
type AppPage = "dashboard" | "pos" | "products" | "reports";

const pageTitles: Record<AppPage, string> = {
  dashboard: "Dashboard",
  pos: "Transaksi (POS)",
  products: "Manajemen Barang",
  reports: "Laporan Penjualan",
};

export default function App() {
  const [view, setView] = useState<AppView>("landing");
  const [page, setPage] = useState<AppPage>("dashboard");
  const [userRole, setUserRole] = useState<"admin" | "kasir">("kasir");
  const [userName, setUserName] = useState("Guest");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogin = (role: "admin" | "kasir", name: string) => {
    setUserRole(role);
    setUserName(name);
    setView("app");
    setPage("dashboard");
  };

  const handleLogout = () => {
    setView("landing");
    setPage("dashboard");
    setSidebarOpen(false);
  };

  if (view === "landing") {
    return <LandingPage onLoginClick={() => setView("login")} />;
  }

  if (view === "login") {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--background)" }}>
      <Sidebar
        currentPage={page}
        onNavigate={(p) => { setPage(p); setSidebarOpen(false); }}
        userRole={userRole}
        userName={userName}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Top bar */}
        <header className="bg-white h-14 flex items-center px-5 gap-3 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <button
            className="lg:hidden p-1.5 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
            style={{ color: "var(--muted-foreground)" }}
          >
            <Menu size={20} />
          </button>
          <div className="flex-1">
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {pageTitles[page]}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: "var(--primary)" }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{userName}</p>
              <p className="text-xs capitalize" style={{ color: "var(--muted-foreground)" }}>{userRole === "admin" ? "Administrator" : "Kasir"}</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {page === "dashboard" && <Dashboard userRole={userRole} />}
          {page === "pos" && <POSPage />}
          {page === "products" && <ProductsPage userRole={userRole} />}
          {page === "reports" && <ReportsPage />}
        </main>
      </div>
    </div>
  );
}
