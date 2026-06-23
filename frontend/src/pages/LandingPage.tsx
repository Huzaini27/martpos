import { Store, LayoutDashboard, ShoppingCart, Package, BarChart3, Shield, Zap, Users, ArrowRight, CheckCircle, Menu, X } from "lucide-react";
import { useState } from "react";

interface LandingPageProps {
  onLoginClick: () => void;
}

const features = [
  { icon: LayoutDashboard, title: "Dashboard Realtime", desc: "Pantau pendapatan, transaksi, dan stok secara langsung dengan visualisasi data yang mudah dipahami.", color: "#059669" },
  { icon: ShoppingCart, title: "Transaksi POS", desc: "Proses penjualan dengan cepat, dukung berbagai metode pembayaran, dan cetak struk otomatis.", color: "#0EA5E9" },
  { icon: Package, title: "Manajemen Barang", desc: "Kelola stok produk, atur harga jual, dan terima notifikasi ketika stok menipis.", color: "#8B5CF6" },
  { icon: BarChart3, title: "Laporan Penjualan", desc: "Analisis performa penjualan harian, mingguan, dan bulanan dengan grafik yang interaktif.", color: "#F59E0B" },
  { icon: Shield, title: "Kontrol Akses", desc: "Pisahkan hak akses antara Admin dan Kasir untuk keamanan data dan operasional yang terjaga.", color: "#EF4444" },
  { icon: Users, title: "Multi Pengguna", desc: "Dukung beberapa kasir dalam satu sistem dengan pencatatan aktivitas masing-masing pengguna.", color: "#EC4899" },
];

const menuItems = ["Home", "Tentang", "Fitur", "Login"];

export function LandingPage({ onLoginClick }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const previewChartData = [
    { day: "Sen", total: 312000 },
    { day: "Sel", total: 485000 },
    { day: "Rab", total: 398000 },
    { day: "Kam", total: 621000 },
    { day: "Jum", total: 754000 },
    { day: "Sab", total: 890000 },
    { day: "Min", total: 567000 },
  ];

  const [selectedPoint, setSelectedPoint] = useState(previewChartData[4]);
  const maxChartValue = 1000000;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--primary)" }}>
              <Store size={16} color="white" />
            </div>
            <span style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>
              Warung Kelontong
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {menuItems.slice(0, -1).map(item => (
              <button key={item} onClick={() => scrollTo(item.toLowerCase())}
                className="text-sm transition-colors hover:text-primary"
                style={{ color: "var(--muted-foreground)" }}>
                {item}
              </button>
            ))}
            <button onClick={onLoginClick}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
              style={{ backgroundColor: "var(--primary)" }}>
              Login 
            </button>~
          </div>

          {/* Mobile */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ color: "var(--foreground)" }}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden px-6 pb-4 space-y-2 bg-white" style={{ borderTop: "1px solid var(--border)" }}>
            {menuItems.slice(0, -1).map(item => (
              <button key={item} onClick={() => scrollTo(item.toLowerCase())} className="block w-full text-left py-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                {item}
              </button>
            ))}
            <button onClick={onLoginClick} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white mt-2" style={{ backgroundColor: "var(--primary)" }}>
              Login Sistem
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section id="home" className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)", border: "1px solid #A7F3D0" }}>
            <Zap size={12} />
            Sistem POS & Inventory Management
          </div>
          <h1 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "clamp(1.75rem, 5vw, 3rem)", lineHeight: 1.15 }}>
            Sistem Informasi Manajemen<br />
            <span style={{ color: "var(--primary)" }}>Warung Kelontong</span> Berbasis Web
          </h1>
          <p className="mt-5 text-base leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Platform terintegrasi untuk mengelola transaksi penjualan, inventaris barang, dan laporan keuangan warung Anda secara efisien dan akurat.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
            <button onClick={onLoginClick}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
              style={{ backgroundColor: "var(--primary)" }}>
              Mulai Sekarang <ArrowRight size={16} />
            </button>
            <button onClick={() => scrollTo("fitur")}
              className="px-6 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ backgroundColor: "white", border: "1px solid var(--border)", color: "var(--foreground)" }}>
              Lihat Fitur
            </button>
          </div>
        </div>

        {/* Mock Dashboard Preview */}
        <div className="mt-14 rounded-2xl overflow-hidden shadow-xl" style={{ border: "1px solid var(--border)" }}>
          <div className="h-8 flex items-center gap-1.5 px-4" style={{ backgroundColor: "#F1F5F9", borderBottom: "1px solid var(--border)" }}>
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs" style={{ color: "var(--muted-foreground)" }}>warung-pos.app/dashboard</span>
          </div>
          <div className="bg-white p-6">
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: "Pendapatan Hari Ini", value: "Rp 1.027.500", color: "#059669" },
                { label: "Transaksi", value: "24", color: "#0EA5E9" },
                { label: "Total Produk", value: "187", color: "#8B5CF6" },
                { label: "Stok Menipis", value: "3", color: "#F59E0B" },
              ].map(card => (
                <div key={card.label} className="p-3 rounded-xl" style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)" }}>
                  <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{card.label}</p>
                  <p style={{ color: card.color, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>{card.value}</p>
                </div>
              ))}
            </div>
            <div
              className="h-40 rounded-xl px-4 py-3 relative overflow-hidden"
              style={{ backgroundColor: "var(--muted)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>Penjualan Minggu Ini</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Total: Rp 4.027.000</p>
                </div>
                <div className="rounded-xl bg-white px-3 py-2 shadow-sm" style={{ border: "1px solid var(--border)" }}>
                  <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{selectedPoint.day}</p>
                  <p className="text-[11px] mt-0.5 whitespace-nowrap" style={{ color: "var(--primary)" }}>
                    Rp {selectedPoint.total.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="absolute inset-x-4 bottom-3 h-20 flex items-end gap-2">
                {previewChartData.map((item) => {
                  const height = Math.max(18, (item.total / maxChartValue) * 100);
                  const active = selectedPoint.day === item.day;

                  return (
                    <button
                      key={item.day}
                      type="button"
                      onClick={() => setSelectedPoint(item)}
                      className="flex-1 h-full flex flex-col items-center justify-end gap-1 group focus:outline-none"
                      aria-label={`Penjualan ${item.day} Rp ${item.total.toLocaleString("id-ID")}`}
                    >
                      <span
                        className="w-full rounded-t-lg transition-all duration-200 group-hover:opacity-100"
                        style={{
                          height: `${height}%`,
                          background: active
                            ? "linear-gradient(180deg, #10B981 0%, #059669 100%)"
                            : "linear-gradient(180deg, rgba(16, 185, 129, 0.65) 0%, rgba(5, 150, 105, 0.35) 100%)",
                          boxShadow: active ? "0 8px 18px rgba(5, 150, 105, 0.22)" : "none",
                          opacity: active ? 1 : 0.85,
                        }}
                      />
                      <span
                        className="text-[10px] leading-none"
                        style={{ color: active ? "var(--primary)" : "var(--muted-foreground)", fontWeight: active ? 700 : 500 }}
                      >
                        {item.day}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="tentang" className="py-16" style={{ backgroundColor: "white", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
                style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}>
                Tentang Sistem
              </div>
              <h2 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.75rem", lineHeight: 1.3 }}>
                Solusi Digital untuk Warung Kelontong Modern
              </h2>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                Sistem ini dirancang untuk membantu pemilik warung kelontong dalam mendigitalisasi operasional bisnis mereka. Dengan antarmuka yang sederhana dan intuitif, siapapun bisa menggunakannya tanpa pelatihan khusus.
              </p>
              <div className="mt-6 space-y-3">
                {["Dibangun dengan React JS & Tailwind CSS", "Antarmuka yang ramah pengguna (user-friendly)", "Data real-time dan laporan otomatis", "Sistem keamanan berbasis peran pengguna"].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle size={16} color="#059669" />
                    <span className="text-sm" style={{ color: "var(--foreground)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: ShoppingCart, label: "POS Transaksi", desc: "Proses penjualan cepat" },
                { icon: Package, label: "Manajemen Stok", desc: "Kelola inventaris" },
                { icon: BarChart3, label: "Laporan Analitik", desc: "Insight bisnis" },
                { icon: Shield, label: "Keamanan Data", desc: "Multi-role akses" },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="p-4 rounded-2xl" style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: "var(--primary)" }}>
                      <Icon size={18} color="white" />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{item.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="py-16 max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}>
            Fitur Unggulan
          </div>
          <h2 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.75rem" }}>
            Semua yang Anda Butuhkan
          </h2>
          <p className="mt-3 text-sm" style={{ color: "var(--muted-foreground)" }}>
            Fitur lengkap dalam satu platform yang mudah digunakan
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(feature => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="bg-white p-5 rounded-2xl transition-all hover:shadow-md" style={{ border: "1px solid var(--border)" }}>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: feature.color + "15" }}>
                  <Icon size={20} style={{ color: feature.color }} />
                </div>
                <h3 className="mb-2" style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 mx-6 mb-16 rounded-3xl text-center" style={{ backgroundColor: "var(--primary)" }}>
        <h2 style={{ color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.75rem" }}>
          Siap Memulai?
        </h2>
        <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
          Masuk ke sistem dan mulai kelola warung Anda secara digital
        </p>
        <button onClick={onLoginClick}
          className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 mx-auto"
          style={{ backgroundColor: "white", color: "var(--primary)" }}>
          Login ke Sistem <ArrowRight size={16} />
        </button>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--primary)" }}>
            <Store size={13} color="white" />
          </div>
          <span className="text-sm font-semibold" style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Warung Kelontong</span>
        </div>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          © 2026 Sistem Informasi Manajemen Warung Kelontong Berbasis Web · React JS + Tailwind CSS + Vite
        </p>
      </footer>
    </div>
  );
}
