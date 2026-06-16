import { useState } from "react";
import { Store, Eye, EyeOff, Lock, User } from "lucide-react";

interface LoginPageProps {
  onLogin: (role: "admin" | "kasir", name: string) => void;
}

const credentials = [
  { username: "admin", password: "admin123", role: "admin" as const, name: "Admin Warung" },
  { username: "kasir", password: "kasir123", role: "kasir" as const, name: "Sari Dewi" },
];

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const user = credentials.find(c => c.username === username && c.password === password);
      if (user) {
        onLogin(user.role, user.name);
      } else {
        setError("Username atau password salah. Coba lagi.");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)" }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ backgroundColor: "var(--primary)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Store size={20} color="white" />
          </div>
          <span style={{ color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1rem" }}>
            Warung Kelontong
          </span>
        </div>

        <div>
          <h1 style={{ color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "2.25rem", lineHeight: 1.2 }}>
            Sistem Informasi<br />Manajemen<br />Warung Kelontong
          </h1>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            Platform POS & Inventory Management yang dirancang khusus untuk warung kelontong modern. Kelola transaksi, stok, dan laporan dengan mudah.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: "Transaksi/Hari", value: "50+" },
              { label: "Produk Terkelola", value: "200+" },
              { label: "Laporan Real-time", value: "✓" },
              { label: "Multi Pengguna", value: "✓" },
            ].map(stat => (
              <div key={stat.label} className="p-4 rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                <p style={{ color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.5rem" }}>{stat.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
          © 2026 Sistem Informasi Manajemen Warung Kelontong
        </p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--primary)" }}>
              <Store size={20} color="white" />
            </div>
            <span style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>
              Warung Kelontong
            </span>
          </div>

          <h2 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.5rem" }}>
            Selamat Datang
          </h2>
          <p className="mt-1 mb-8 text-sm" style={{ color: "var(--muted-foreground)" }}>
            Masuk ke sistem manajemen warung Anda
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input
                  type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="Masukkan username..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ backgroundColor: "white", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  onFocus={e => (e.target as HTMLElement).style.borderColor = "var(--primary)"}
                  onBlur={e => (e.target as HTMLElement).style.borderColor = "var(--border)"}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input
                  type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan password..."
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ backgroundColor: "white", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  onFocus={e => (e.target as HTMLElement).style.borderColor = "var(--primary)"}
                  onBlur={e => (e.target as HTMLElement).style.borderColor = "var(--border)"}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
              style={{ backgroundColor: "var(--primary)", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Memproses..." : "Masuk ke Sistem"}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: "var(--accent)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--accent-foreground)" }}>Akun Demo:</p>
            <div className="space-y-1">
              <p className="text-xs" style={{ color: "var(--accent-foreground)" }}>👤 Admin: <span className="font-mono">admin</span> / <span className="font-mono">admin123</span></p>
              <p className="text-xs" style={{ color: "var(--accent-foreground)" }}>👤 Kasir: <span className="font-mono">kasir</span> / <span className="font-mono">kasir123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;