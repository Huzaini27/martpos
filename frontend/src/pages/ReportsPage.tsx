import { useEffect, useMemo, useState, type ElementType } from "react";
import { Download, TrendingUp, ShoppingCart, Package, DollarSign } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const API_BASE_URL = "http://localhost:5000/api";

interface ReportSummary {
  report_stats: {
    total_revenue: number;
    total_transactions: number;
    average_transaction: number;
    products_sold: number;
  };
  weekly_sales: { day: string; total: number }[];
  monthly_sales: { month: string; pendapatan: number; transaksi: number }[];
  category_sales: { name: string; value: number; color: string }[];
}

interface TransactionRow {
  id: number;
  invoice_number: string;
  sale_date: string;
  sale_time: string;
  cashier_name: string | null;
  payment_name: string | null;
  total_items: number;
  total_amount: number | string;
}

function fmt(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatDate(value: string) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatTime(value: string) {
  return value ? value.slice(0, 5) : "-";
}

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string;
  value: string;
  sub: string;
  icon: ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "15" }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <p style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{sub}</p>
    </div>
  );
}

export function ReportsPage() {
  const [period, setPeriod] = useState<"harian" | "mingguan" | "bulanan">("mingguan");
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    Promise.all([
      fetch(`${API_BASE_URL}/transactions/summary`).then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal mengambil ringkasan laporan");
        }

        return data as ReportSummary;
      }),
      fetch(`${API_BASE_URL}/transactions`).then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal mengambil riwayat transaksi");
        }

        return data as TransactionRow[];
      })
    ])
      .then(([summaryData, transactionData]) => {
        if (!ignore) {
          setSummary(summaryData);
          setTransactions(transactionData);
          setError("");
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Gagal mengambil laporan");
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const chartData = useMemo(() => {
    if (period === "bulanan") {
      return (summary?.monthly_sales ?? []).map((item) => ({
        label: item.month,
        total: item.pendapatan
      }));
    }

    return (summary?.weekly_sales ?? []).map((item) => ({
      label: item.day,
      total: item.total
    }));
  }, [period, summary]);

  const monthlyData = summary?.monthly_sales ?? [];
  const categoryData = summary?.category_sales ?? [];
  const reportStats = summary?.report_stats;
  const stats = [
    { label: "Total Pendapatan", value: fmt(reportStats?.total_revenue ?? 0), sub: "Bulan ini", icon: DollarSign, color: "#059669" },
    { label: "Total Transaksi", value: String(reportStats?.total_transactions ?? 0), sub: "Bulan ini", icon: ShoppingCart, color: "#0EA5E9" },
    { label: "Rata-rata per Transaksi", value: fmt(reportStats?.average_transaction ?? 0), sub: "Bulan ini", icon: TrendingUp, color: "#8B5CF6" },
    { label: "Produk Terjual", value: String(reportStats?.products_sold ?? 0), sub: "unit produk", icon: Package, color: "#F59E0B" },
  ];

  return (
    <div className="p-6 py-5 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>Periode: Bulan ini</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ backgroundColor: "white", border: "1px solid var(--border)", color: "var(--foreground)" }}>
          <Download size={15} /> Ekspor Laporan
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Grafik Penjualan</h3>
          <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
            {(["harian", "mingguan", "bulanan"] as const).map((item) => (
              <button key={item} onClick={() => setPeriod(item)}
                className="px-3 py-1.5 rounded-lg text-xs capitalize transition-all"
                style={{
                  backgroundColor: period === item ? "white" : "transparent",
                  color: period === item ? "var(--foreground)" : "var(--muted-foreground)",
                  fontWeight: period === item ? 600 : 400,
                  boxShadow: period === item ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradReport" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false}
              tickFormatter={(value) => `${Number(value ?? 0) / 1000000}jt`} />
            <Tooltip formatter={(value) => [fmt(Number(value ?? 0)), "Pendapatan"]}
              contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
            <Area type="monotone" dataKey="total"
              stroke="#059669" strokeWidth={2} fill="url(#gradReport)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
          <h3 className="mb-4" style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Penjualan per Kategori</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {categoryData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(value) => [`${Number(value ?? 0).toFixed(2)}%`, "Porsi"]} contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
          <h3 className="mb-4" style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Perbandingan Bulanan</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} tickFormatter={(value) => `${Number(value ?? 0) / 1000000}jt`} />
              <Tooltip formatter={(value) => [fmt(Number(value ?? 0)), "Pendapatan"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Bar dataKey="pendapatan" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <div className="px-5 py-4 border-b" style={{ borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Riwayat Transaksi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                {["ID Transaksi", "Tanggal", "Waktu", "Kasir", "Item", "Total", "Metode"].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                    Belum ada transaksi
                  </td>
                </tr>
              ) : transactions.map((tx, index) => {
                const method = tx.payment_name ?? "-";
                const isCash = method.toLowerCase().includes("tunai");

                return (
                  <tr key={tx.id} style={{ borderBottom: index < transactions.length - 1 ? "1px solid var(--border)" : "none" }}
                    className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-medium" style={{ color: "var(--primary)" }}>{tx.invoice_number}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--foreground)" }}>{formatDate(tx.sale_date)}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>{formatTime(tx.sale_time)}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--foreground)" }}>{tx.cashier_name ?? "-"}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>{Number(tx.total_items)} item</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--primary)" }}>{fmt(Number(tx.total_amount))}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs"
                        style={{
                          backgroundColor: isCash ? "#D1FAE5" : "#DBEAFE",
                          color: isCash ? "#059669" : "#2563EB",
                        }}>
                        {method}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
