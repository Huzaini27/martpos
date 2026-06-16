import { TrendingUp, ShoppingCart, Package, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const salesData = [
  { day: "Sen", total: 312000 },
  { day: "Sel", total: 485000 },
  { day: "Rab", total: 398000 },
  { day: "Kam", total: 621000 },
  { day: "Jum", total: 754000 },
  { day: "Sab", total: 890000 },
  { day: "Min", total: 567000 },
];

const topProducts = [
  { name: "Beras Premium 5kg", qty: 42, revenue: 1260000 },
  { name: "Minyak Goreng 1L", qty: 38, revenue: 532000 },
  { name: "Gula Pasir 1kg", qty: 35, revenue: 490000 },
  { name: "Indomie Goreng", qty: 120, revenue: 360000 },
  { name: "Telur Ayam (Kg)", qty: 28, revenue: 756000 },
];

const lowStockItems = [
  { name: "Minyak Goreng 2L", stock: 3, min: 10 },
  { name: "Deterjen Bubuk", stock: 5, min: 15 },
  { name: "Kecap Manis 620ml", stock: 2, min: 8 },
];

const recentTransactions = [
  { id: "TRX-001", time: "09:24", items: 5, total: 87500, kasir: "Budi" },
  { id: "TRX-002", time: "10:11", items: 3, total: 45000, kasir: "Sari" },
  { id: "TRX-003", time: "11:02", items: 8, total: 213000, kasir: "Budi" },
  { id: "TRX-004", time: "12:35", items: 2, total: 32000, kasir: "Sari" },
  { id: "TRX-005", time: "13:50", items: 6, total: 156000, kasir: "Budi" },
];

function StatCard({ label, value, sub, icon: Icon, trend, color }: {
  label: string; value: string; sub: string; icon: React.ElementType;
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
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.375rem" }}>Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>{today}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pendapatan Hari Ini" value="Rp 1.027.500" sub="+12% dari kemarin" icon={TrendingUp} trend="up" color="#059669" />
        <StatCard label="Transaksi Hari Ini" value="24" sub="+3 dari kemarin" icon={ShoppingCart} trend="up" color="#0EA5E9" />
        <StatCard label="Total Produk Aktif" value="187" sub="12 produk baru bulan ini" icon={Package} color="#8B5CF6" />
        <StatCard label="Stok Menipis" value="3" sub="Perlu segera diisi" icon={AlertTriangle} trend="down" color="#F59E0B" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Penjualan Minggu Ini</h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Total: Rp 4.027.000</p>
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
              <Tooltip formatter={(v: number) => [fmt(v), "Penjualan"]} contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
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
              <Tooltip formatter={(v: number) => [v + " pcs", "Terjual"]} contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Bar dataKey="qty" fill="#059669" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
          <h3 className="mb-4" style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Transaksi Terbaru</h3>
          <div className="space-y-2">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--primary)", opacity: 0.1 }} />
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center absolute" style={{ backgroundColor: "transparent" }}>
                    <ShoppingCart size={14} style={{ color: "var(--primary)" }} />
                  </div>
                  <div style={{ marginLeft: 32 }}>
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{tx.id}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{tx.time} · {tx.items} item · {tx.kasir}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold" style={{ color: "var(--primary)" }}>{fmt(tx.total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} color="#F59E0B" />
            <h3 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Stok Menipis</h3>
          </div>
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div key={item.name} className="p-3 rounded-xl" style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A" }}>
                <p className="text-sm font-medium" style={{ color: "#92400E" }}>{item.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs" style={{ color: "#B45309" }}>Stok: {item.stock} unit</p>
                  <p className="text-xs" style={{ color: "#B45309" }}>Min: {item.min}</p>
                </div>
                <div className="mt-2 h-1.5 rounded-full" style={{ backgroundColor: "#FDE68A" }}>
                  <div className="h-1.5 rounded-full" style={{ backgroundColor: "#F59E0B", width: `${(item.stock / item.min) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;