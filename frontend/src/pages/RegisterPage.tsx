import { useState, type FormEvent } from "react";
import { Store, Eye, EyeOff, Lock, User, BadgeCheck } from "lucide-react";

interface RegisterPageProps {
  onRegister: (role: "admin" | "kasir", name: string) => void;
  onLoginClick: () => void;
}

export function RegisterPage({ onRegister, onLoginClick }: RegisterPageProps) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"admin" | "kasir">("kasir");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !username.trim() || !password.trim()) {
      setError("Nama, username, dan password wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onRegister(role, name.trim());
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)" }}>
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
            Buat Akun<br />Manajemen<br />Warung Anda
          </h1>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            Daftarkan akun admin atau kasir untuk mulai mengelola transaksi, stok barang, dan laporan penjualan.
          </p>

          <div className="mt-10 space-y-3">
            {["Kelola akses pengguna", "Pantau transaksi harian", "Atur stok dan laporan"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <BadgeCheck size={15} color="white" />
                </div>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
          © 2026 Sistem Informasi Manajemen Warung Kelontong
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--primary)" }}>
              <Store size={20} color="white" />
            </div>
            <span style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>
              Warung Kelontong
            </span>
          </div>

          <h2 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.5rem" }}>
            Daftar Akun
          </h2>
          <p className="mt-1 mb-8 text-sm" style={{ color: "var(--muted-foreground)" }}>
            Buat akun baru untuk masuk ke sistem
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Nama Lengkap</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Masukkan nama..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ backgroundColor: "white", border: "1px solid var(--border)", color: "var(--foreground)" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Buat username..."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ backgroundColor: "white", border: "1px solid var(--border)", color: "var(--foreground)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as "admin" | "kasir")}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ backgroundColor: "white", border: "1px solid var(--border)", color: "var(--foreground)" }}
              >
                <option value="kasir">Kasir</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter..."
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ backgroundColor: "white", border: "1px solid var(--border)", color: "var(--foreground)" }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Konfirmasi Password</label>
              <input
                type={showPass ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password..."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ backgroundColor: "white", border: "1px solid var(--border)", color: "var(--foreground)" }}
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
              style={{ backgroundColor: "var(--primary)", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
            Sudah punya akun?{" "}
            <button type="button" onClick={onLoginClick} className="font-semibold" style={{ color: "var(--primary)" }}>
              Masuk
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
