import { useEffect, useState, type ElementType } from "react";
import { TrendingUp, ShoppingCart, Package, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const API_BASE_URL = "http://localhost:5000/api";

interface DashboardSummary {
  today_revenue: number;
  today_transactions: number;
  total_products: number;
  low_stock_count: number;
  weekly_sales: { day: string; total: number }[];
  recent_transactions: { id: string; time: string; items: number; total: number; kasir: string }[];
  low_stock_items: { name: string; stock: number; min: number }[];
  top_products: { name: string; qty: number; revenue: number }[];
}

function StatCard({ label, value, sub, icon: Icon, trend, color }: {
  label: string; value: string; sub: string; icon: ElementType;
  trend?: "up" | "down"; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-3" style={{ border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "15" }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-2xl" style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>{value}</p>
        <div className="flex items-center gap-1 mt-1">
          {trend === "up" && <ArrowUpRight size={14} color="#059669" />}
          {trend === "down" && <ArrowDownRight size={14} color="#DC2626" />}
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{sub}</span>
        </div>
      </div>
    </div>
  );
}

function fmt(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export function Dashboard({ userRole }: { userRole: "admin" | "kasir" }) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const roleLabel = userRole === "admin" ? "Administrator" : "Kasir";
  const salesData = summary?.weekly_sales ?? [];
  const topProducts = summary?.top_products ?? [];
  const recentTransactions = summary?.recent_transactions ?? [];
  const lowStockItems = summary?.low_stock_items ?? [];
  const weeklyTotal = salesData.reduce((sum, item) => sum + item.total, 0);

  useEffect(() => {
    let ignore = false;

    fetch(`${API_BASE_URL}/transactions/summary`)
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal mengambil ringkasan dashboard");
        }

        if (!ignore) {
          setSummary(data);
          setError("");
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Gagal mengambil ringkasan dashboard");
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>{today} · {roleLabel}</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pendapatan Hari Ini" value={fmt(summary?.today_revenue ?? 0)} sub="Data hari ini" icon={TrendingUp} trend="up" color="#059669" />
        <StatCard label="Transaksi Hari Ini" value={String(summary?.today_transactions ?? 0)} sub="Transaksi selesai" icon={ShoppingCart} trend="up" color="#0EA5E9" />
        <StatCard label="Total Produk Aktif" value={String(summary?.total_products ?? 0)} sub="Produk aktif" icon={Package} color="#8B5CF6" />
        <StatCard label="Stok Menipis" value={String(summary?.low_stock_count ?? 0)} sub="Perlu segera diisi" icon={AlertTriangle} trend="down" color="#F59E0B" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Penjualan Minggu Ini</h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Total: {fmt(weeklyTotal)}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
              <Tooltip formatter={(v) => [fmt(Number(v ?? 0)), "Penjualan"]} contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Area type="monotone" dataKey="total" stroke="#059669" strokeWidth={2} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Bar */}
        <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
          <h3 className="mb-4" style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Produk Terlaris</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} width={90} />
              <Tooltip formatter={(v) => [`${Number(v ?? 0).toLocaleString("id-ID")} pcs`, "Terjual"]} contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Bar dataKey="qty" fill="#059669" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
              Riwayat Transaksi
            </h3>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Terbaru
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th className="py-3 text-left text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>ID</th>
                  <th className="py-3 text-left text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>Waktu</th>
                  <th className="py-3 text-left text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>Kasir</th>
                  <th className="py-3 text-left text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>Item</th>
                  <th className="py-3 text-right text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>Total</th>
                </tr>
              </thead>

              <tbody>
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                      Belum ada transaksi
                    </td>
                  </tr>
                ) : recentTransactions.map((tx, index) => (
                  <tr
                    key={tx.id}
                    style={{ borderBottom: index < recentTransactions.length - 1 ? "1px solid var(--border)" : "none" }}
                  >
                    <td className="py-3 text-sm font-medium" style={{ color: "var(--foreground)" }}>{tx.id}</td>
                    <td className="py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>{tx.time}</td>
                    <td className="py-3 text-sm" style={{ color: "var(--foreground)" }}>{tx.kasir}</td>
                    <td className="py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>{tx.items} item</td>
                    <td className="py-3 text-sm font-semibold text-right" style={{ color: "var(--primary)" }}>{fmt(tx.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} color="#F59E0B" />
            <h3 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Stok Menipis</h3>
          </div>
          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Tidak ada stok menipis</p>
            ) : lowStockItems.map((item) => (
              <div key={item.name} className="p-3 rounded-xl" style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A" }}>
                <p className="text-sm font-medium" style={{ color: "#92400E" }}>{item.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs" style={{ color: "#B45309" }}>Stok: {item.stock} unit</p>
                  <p className="text-xs" style={{ color: "#B45309" }}>Min: {item.min}</p>
                </div>
                <div className="mt-2 h-1.5 rounded-full" style={{ backgroundColor: "#FDE68A" }}>
                  <div className="h-1.5 rounded-full" style={{ backgroundColor: "#F59E0B", width: `${Math.min(100, item.min > 0 ? (item.stock / item.min) * 100 : 0)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
