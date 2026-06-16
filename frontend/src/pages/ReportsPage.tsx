import { useState } from "react";
import { Download, TrendingUp, ShoppingCart, Package, DollarSign } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const monthlyData = [
  { month: "Jan", pendapatan: 18500000, transaksi: 312 },
  { month: "Feb", pendapatan: 21200000, transaksi: 356 },
  { month: "Mar", pendapatan: 19800000, transaksi: 334 },
  { month: "Apr", pendapatan: 24100000, transaksi: 405 },
  { month: "Mei", pendapatan: 27300000, transaksi: 458 },
  { month: "Jun", pendapatan: 23500000, transaksi: 390 },
];

const dailyData = [
  { day: "Sen", total: 312000 },
  { day: "Sel", total: 485000 },
  { day: "Rab", total: 398000 },
  { day: "Kam", total: 621000 },
  { day: "Jum", total: 754000 },
  { day: "Sab", total: 890000 },
  { day: "Min", total: 567000 },
];

const categoryData = [
  { name: "Sembako", value: 42, color: "#059669" },
  { name: "Minuman", value: 21, color: "#0EA5E9" },
  { name: "Kebersihan", value: 15, color: "#8B5CF6" },
  { name: "Mie Instan", value: 12, color: "#F59E0B" },
  { name: "Lainnya", value: 10, color: "#EF4444" },
];

const topTransactions = [
  { id: "TRX-2401", date: "10 Jun 2026", time: "09:24", kasir: "Budi Santoso", items: 5, total: 187500, method: "Tunai" },
  { id: "TRX-2402", date: "10 Jun 2026", time: "10:11", kasir: "Sari Dewi", items: 3, total: 45000, method: "Transfer" },
  { id: "TRX-2403", date: "10 Jun 2026", time: "11:02", kasir: "Budi Santoso", items: 8, total: 213000, method: "Tunai" },
  { id: "TRX-2404", date: "10 Jun 2026", time: "12:35", kasir: "Sari Dewi", items: 2, total: 32000, method: "Tunai" },
  { id: "TRX-2405", date: "10 Jun 2026", time: "13:50", kasir: "Budi Santoso", items: 6, total: 156000, method: "Transfer" },
  { id: "TRX-2406", date: "10 Jun 2026", time: "14:20", kasir: "Sari Dewi", items: 4, total: 98000, method: "Tunai" },
  { id: "TRX-2407", date: "10 Jun 2026", time: "15:05", kasir: "Budi Santoso", items: 7, total: 297000, method: "Tunai" },
];

function fmt(n: number) { return "Rp " + n.toLocaleString("id-ID"); }

export function ReportsPage() {
  const [period, setPeriod] = useState<"harian" | "mingguan" | "bulanan">("mingguan");

  const stats = [
    { label: "Total Pendapatan", value: "Rp 23.500.000", sub: "Bulan Juni 2026", icon: DollarSign, color: "#059669" },
    { label: "Total Transaksi", value: "390", sub: "Bulan Juni 2026", icon: ShoppingCart, color: "#0EA5E9" },
    { label: "Rata-rata per Transaksi", value: "Rp 60.256", sub: "Bulan Juni 2026", icon: TrendingUp, color: "#8B5CF6" },
    { label: "Produk Terjual", value: "1.847", sub: "unit produk", icon: Package, color: "#F59E0B" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.375rem" }}>Laporan Penjualan</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>Periode: Juni 2026</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ backgroundColor: "white", border: "1px solid var(--border)", color: "var(--foreground)" }}>
          <Download size={15} /> Ekspor Laporan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl p-4" style={{ border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.label}</span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + "15" }}>
                  <Icon size={15} style={{ color: s.color }} />
                </div>
              </div>
              <p style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Period Selector + Charts */}
      <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Grafik Penjualan</h3>
          <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
            {(["harian", "mingguan", "bulanan"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className="px-3 py-1.5 rounded-lg text-xs capitalize transition-all"
                style={{
                  backgroundColor: period === p ? "white" : "transparent",
                  color: period === p ? "var(--foreground)" : "var(--muted-foreground)",
                  fontWeight: period === p ? 600 : 400,
                  boxShadow: period === p ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={period === "bulanan" ? monthlyData : dailyData}>
            <defs>
              <linearGradient id="gradReport" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey={period === "bulanan" ? "month" : "day"} tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v / 1000000).toFixed(0)}jt`} />
            <Tooltip formatter={(v: number) => [fmt(v), "Pendapatan"]}
              contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
            <Area type="monotone" dataKey={period === "bulanan" ? "pendapatan" : "total"}
              stroke="#059669" strokeWidth={2} fill="url(#gradReport)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pie Chart */}
        <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
          <h3 className="mb-4" style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Penjualan per Kategori</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, "Porsi"]} contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Monthly */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
          <h3 className="mb-4" style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Perbandingan Bulanan</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000000}jt`} />
              <Tooltip formatter={(v: number) => [fmt(v), "Pendapatan"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Bar dataKey="pendapatan" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <div className="px-5 py-4 border-b" style={{ borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Riwayat Transaksi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                {["ID Transaksi", "Tanggal", "Waktu", "Kasir", "Item", "Total", "Metode"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topTransactions.map((tx, i) => (
                <tr key={tx.id} style={{ borderBottom: i < topTransactions.length - 1 ? "1px solid var(--border)" : "none" }}
                  className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono font-medium" style={{ color: "var(--primary)" }}>{tx.id}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--foreground)" }}>{tx.date}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>{tx.time}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--foreground)" }}>{tx.kasir}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>{tx.items} item</td>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--primary)" }}>{fmt(tx.total)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs"
                      style={{
                        backgroundColor: tx.method === "Tunai" ? "#D1FAE5" : "#DBEAFE",
                        color: tx.method === "Tunai" ? "#059669" : "#2563EB",
                      }}>
                      {tx.method}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;