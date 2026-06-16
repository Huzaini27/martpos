import { useState } from "react";
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, CheckCircle } from "lucide-react";

const catalog = [
  { id: 1, name: "Beras Premium 5kg", price: 78000, category: "Sembako", stock: 42, sku: "BRS-001" },
  { id: 2, name: "Minyak Goreng 1L", price: 18000, category: "Sembako", stock: 38, sku: "MNY-001" },
  { id: 3, name: "Gula Pasir 1kg", price: 14000, category: "Sembako", stock: 35, sku: "GLP-001" },
  { id: 4, name: "Indomie Goreng", price: 3500, category: "Mie Instan", stock: 120, sku: "MDM-001" },
  { id: 5, name: "Telur Ayam 1kg", price: 27000, category: "Protein", stock: 28, sku: "TLR-001" },
  { id: 6, name: "Kecap Manis 620ml", price: 19000, category: "Bumbu", stock: 15, sku: "KCP-001" },
  { id: 7, name: "Sabun Mandi Lifebuoy", price: 4500, category: "Kebersihan", stock: 60, sku: "SBN-001" },
  { id: 8, name: "Deterjen Rinso 800g", price: 22000, category: "Kebersihan", stock: 24, sku: "DTJ-001" },
  { id: 9, name: "Aqua 600ml", price: 4000, category: "Minuman", stock: 96, sku: "AQA-001" },
  { id: 10, name: "Susu Ultra 1L", price: 16500, category: "Minuman", stock: 30, sku: "SUS-001" },
  { id: 11, name: "Sarden ABC 155g", price: 12500, category: "Kaleng", stock: 45, sku: "SRD-001" },
  { id: 12, name: "Kopi Kapal Api 165g", price: 17000, category: "Minuman", stock: 20, sku: "KPI-001" },
];

const categories = ["Semua", "Sembako", "Mie Instan", "Protein", "Bumbu", "Kebersihan", "Minuman", "Kaleng"];

interface CartItem {
  id: number; name: string; price: number; qty: number;
}

function fmt(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export function POSPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"tunai" | "transfer">("tunai");
  const [cashInput, setCashInput] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const filtered = catalog.filter(p => {
    const matchCat = category === "Semua" || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (product: typeof catalog[0]) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === product.id);
      if (existing) return prev.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0));
  };

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cash = parseInt(cashInput.replace(/\D/g, "")) || 0;
  const change = cash - total;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (paymentMethod === "tunai" && cash < total) return;
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCart([]);
      setCashInput("");
    }, 2500);
  };

  if (showSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: "#D1FAE5" }}>
            <CheckCircle size={40} color="#059669" />
          </div>
          <h2 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.25rem" }}>
            Transaksi Berhasil!
          </h2>
          <p style={{ color: "var(--muted-foreground)" }}>Total: {fmt(total)}</p>
          {paymentMethod === "tunai" && <p style={{ color: "var(--muted-foreground)" }}>Kembalian: {fmt(change)}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-0">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-5 space-y-3">
          <h1 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.375rem" }}>Transaksi (POS)</h1>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama atau kode produk..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ backgroundColor: "white", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
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
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-2xl p-4 text-left transition-all hover:shadow-md active:scale-95"
                style={{ border: "1px solid var(--border)" }}
              >
                <div className="w-full h-14 rounded-xl mb-3 flex items-center justify-center" style={{ backgroundColor: "var(--accent)" }}>
                  <span className="text-2xl">🛒</span>
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
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-80 flex flex-col bg-white" style={{ borderLeft: "1px solid var(--border)" }}>
        {/* Cart header */}
        <div className="p-4 border-b" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} style={{ color: "var(--primary)" }} />
            <h2 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Keranjang</h2>
            {cart.length > 0 && (
              <span className="ml-auto w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "var(--primary)" }}>
                {cart.reduce((s, c) => s + c.qty, 0)}
              </span>
            )}
          </div>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 py-10">
              <ShoppingCart size={40} style={{ color: "var(--border)" }} />
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Keranjang masih kosong</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Pilih produk dari daftar</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="p-3 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium leading-tight flex-1" style={{ color: "var(--foreground)" }}>{item.name}</p>
                  <button onClick={() => updateQty(item.id, -item.qty)} style={{ color: "var(--muted-foreground)" }}>
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
                    <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: "var(--primary)" }}>
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment */}
        {cart.length > 0 && (
          <div className="p-4 space-y-3 border-t" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Subtotal</span>
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{fmt(total)}</span>
            </div>

            {/* Payment method */}
            <div className="grid grid-cols-2 gap-2">
              {(["tunai", "transfer"] as const).map(method => (
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
              <div>
                <input
                  value={cashInput}
                  onChange={e => setCashInput(e.target.value)}
                  placeholder="Jumlah uang tunai..."
                  type="number"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                />
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
              disabled={paymentMethod === "tunai" && cash < total}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
              style={{
                backgroundColor: (paymentMethod === "tunai" && cash < total) ? "#D1FAE5" : "var(--primary)",
                cursor: (paymentMethod === "tunai" && cash < total) ? "not-allowed" : "pointer",
              }}
            >
              Proses Pembayaran · {fmt(total)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default POSPage;