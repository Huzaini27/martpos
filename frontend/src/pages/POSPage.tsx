import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, CheckCircle, RefreshCw } from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

interface ApiProduct {
  id: number;
  product_code: string;
  product_name: string;
  category_name: string | null;
  selling_price: string | number;
  stock_quantity: number | null;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  sku: string;
}

interface CartItem extends Product {
  qty: number;
}

interface TransactionSummary {
  invoice_number: string;
  total_amount: number;
  amount_paid: number;
  change_amount: number;
}

function fmt(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatNumberInput(value: string | number) {
  const digits = String(value).replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("id-ID") : "";
}

function toProduct(item: ApiProduct): Product {
  return {
    id: item.id,
    name: item.product_name,
    price: Number(item.selling_price),
    category: item.category_name ?? "-",
    stock: Number(item.stock_quantity ?? 0),
    sku: item.product_code,
  };
}

export function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"tunai" | "transfer">("tunai");
  const [cashInput, setCashInput] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successSummary, setSuccessSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengambil produk");
      }

      setProducts((data as ApiProduct[]).map(toProduct));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil produk");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = useMemo(() => {
    return ["Semua", ...Array.from(new Set(products.map((product) => product.category)))];
  }, [products]);

  const filtered = products.filter((product) => {
    const matchCat = category === "Semua" || product.category === category;
    const keyword = search.toLowerCase();
    const matchSearch = product.name.toLowerCase().includes(keyword) || product.sku.toLowerCase().includes(keyword);
    return matchCat && matchSearch;
  });

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: Math.min(item.stock, item.qty + 1) } : item
        );
      }

      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: Math.max(0, Math.min(item.stock, item.qty + delta)) } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cash = parseInt(cashInput.replace(/\D/g, "")) || 0;
  const change = cash - total;
  const isPaymentInvalid = paymentMethod === "tunai" && cash < total;
  const quickCashOptions = [
    { label: "Uang pas", value: total },
    { label: "+ Rp 5.000", value: total + 5000 },
    { label: "+ Rp 10.000", value: total + 10000 },
  ];

  const updateCashInput = (value: string | number) => {
    setCashInput(formatNumberInput(value));
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || isPaymentInvalid || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_method: paymentMethod,
          amount_paid: paymentMethod === "tunai" ? cash : total,
          items: cart.map((item) => ({
            product_id: item.id,
            quantity: item.qty,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memproses transaksi");
      }

      setSuccessSummary(data.transaction as TransactionSummary);
      setShowSuccess(true);
      setCart([]);
      setCashInput("");
      await loadProducts();

      window.setTimeout(() => {
        setShowSuccess(false);
        setSuccessSummary(null);
      }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses transaksi");
    } finally {
      setSubmitting(false);
    }
  };

  if (showSuccess && successSummary) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: "#D1FAE5" }}>
            <CheckCircle size={40} color="#059669" />
          </div>
          <h2 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.25rem" }}>
            Transaksi Berhasil!
          </h2>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{successSummary.invoice_number}</p>
          <p style={{ color: "var(--muted-foreground)" }}>Total: {fmt(Number(successSummary.total_amount))}</p>
          {paymentMethod === "tunai" && <p style={{ color: "var(--muted-foreground)" }}>Kembalian: {fmt(Number(successSummary.change_amount))}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-0">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-5 space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama atau kode produk..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ backgroundColor: "white", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  backgroundColor: category === cat ? "var(--primary)" : "white",
                  color: category === cat ? "white" : "var(--muted-foreground)",
                  border: "1px solid",
                  borderColor: category === cat ? "var(--primary)" : "var(--border)",
                  fontWeight: category === cat ? 600 : 400,
                }}
              >
                {cat}
              </button>
            ))}

            <button
              onClick={loadProducts}
              className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ backgroundColor: "white", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
              title="Muat ulang produk"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {error && (
            <div className="px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
              {error}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {loading ? (
            <div className="h-full flex items-center justify-center text-sm" style={{ color: "var(--muted-foreground)" }}>
              Memuat produk...
            </div>
          ) : filtered.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm" style={{ color: "var(--muted-foreground)" }}>
              Produk tidak ditemukan
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className="bg-white rounded-2xl p-4 text-left transition-all hover:shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                  style={{ border: "1px solid var(--border)", cursor: product.stock <= 0 ? "not-allowed" : "pointer" }}
                >
                  <div className="w-full h-14 rounded-xl mb-3 flex items-center justify-center" style={{ backgroundColor: "var(--accent)" }}>
                    <ShoppingCart size={24} style={{ color: "var(--primary)" }} />
                  </div>
                  <p className="text-xs font-semibold leading-tight mb-1" style={{ color: "var(--foreground)" }}>{product.name}</p>
                  <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{product.sku}</p>
                  <p className="text-sm font-bold" style={{ color: "var(--primary)" }}>{fmt(product.price)}</p>
                  <p className="text-xs mt-1" style={{ color: product.stock < 10 ? "#DC2626" : "var(--muted-foreground)" }}>
                    Stok: {product.stock}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-80 flex flex-col bg-white" style={{ borderLeft: "1px solid var(--border)" }}>
        <div className="p-4 border-b" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} style={{ color: "var(--primary)" }} />
            <h2 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Keranjang</h2>
            {cart.length > 0 && (
              <span className="ml-auto w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "var(--primary)" }}>
                {cart.reduce((sum, item) => sum + item.qty, 0)}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 py-10">
              <ShoppingCart size={40} style={{ color: "var(--border)" }} />
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Keranjang masih kosong</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Pilih produk dari daftar</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="p-3 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium leading-tight flex-1" style={{ color: "var(--foreground)" }}>{item.name}</p>
                  <button onClick={() => updateQty(item.id, -item.qty)} style={{ color: "var(--muted-foreground)" }} title="Hapus item">
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>{fmt(item.price * item.qty)}</span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: "var(--border)" }}>
                      <Minus size={11} />
                    </button>
                    <span className="text-xs font-semibold w-5 text-center" style={{ color: "var(--foreground)" }}>{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      disabled={item.qty >= item.stock}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white disabled:opacity-50"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 space-y-3 border-t" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Subtotal</span>
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{fmt(total)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(["tunai", "transfer"] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className="flex items-center gap-1.5 justify-center py-2 rounded-xl text-xs transition-all"
                  style={{
                    backgroundColor: paymentMethod === method ? "var(--primary)" : "var(--muted)",
                    color: paymentMethod === method ? "white" : "var(--muted-foreground)",
                    fontWeight: paymentMethod === method ? 600 : 400,
                  }}
                >
                  {method === "tunai" ? <Banknote size={14} /> : <CreditCard size={14} />}
                  {method === "tunai" ? "Tunai" : "Transfer"}
                </button>
              ))}
            </div>

            {paymentMethod === "tunai" && (
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: "var(--muted-foreground)" }}>
                    Rp
                  </span>
                  <input
                    value={cashInput}
                    onChange={(event) => updateCashInput(event.target.value)}
                    placeholder="Jumlah uang tunai..."
                    type="text"
                    inputMode="numeric"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: "var(--muted)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {quickCashOptions.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => updateCashInput(option.value)}
                      className="px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all active:scale-95"
                      style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {cash >= total && (
                  <div className="flex justify-between mt-2 px-1">
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Kembalian</span>
                    <span className="text-xs font-semibold" style={{ color: "#059669" }}>{fmt(change)}</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isPaymentInvalid || submitting}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:active:scale-100"
              style={{
                backgroundColor: isPaymentInvalid || submitting ? "#D1FAE5" : "var(--primary)",
                cursor: isPaymentInvalid || submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Memproses..." : `Proses Pembayaran · ${fmt(total)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
