import { useState } from "react";
import { Search, Plus, Edit2, Trash2, Package, X, Save } from "lucide-react";

interface Product {
  id: number; name: string; sku: string; category: string;
  price: number; stock: number; minStock: number; unit: string;
}

const initialProducts: Product[] = [
  { id: 1, name: "Beras Premium 5kg", sku: "BRS-001", category: "Sembako", price: 78000, stock: 42, minStock: 10, unit: "Karung" },
  { id: 2, name: "Minyak Goreng 1L", sku: "MNY-001", category: "Sembako", price: 18000, stock: 38, minStock: 15, unit: "Botol" },
  { id: 3, name: "Gula Pasir 1kg", sku: "GLP-001", category: "Sembako", price: 14000, stock: 35, minStock: 10, unit: "Kg" },
  { id: 4, name: "Indomie Goreng", sku: "MDM-001", category: "Mie Instan", price: 3500, stock: 120, minStock: 30, unit: "Pcs" },
  { id: 5, name: "Telur Ayam 1kg", sku: "TLR-001", category: "Protein", price: 27000, stock: 28, minStock: 10, unit: "Kg" },
  { id: 6, name: "Kecap Manis 620ml", sku: "KCP-001", category: "Bumbu", price: 19000, stock: 3, minStock: 8, unit: "Botol" },
  { id: 7, name: "Sabun Mandi Lifebuoy", sku: "SBN-001", category: "Kebersihan", price: 4500, stock: 60, minStock: 20, unit: "Pcs" },
  { id: 8, name: "Deterjen Rinso 800g", sku: "DTJ-001", category: "Kebersihan", price: 22000, stock: 5, minStock: 15, unit: "Bungkus" },
  { id: 9, name: "Aqua 600ml", sku: "AQA-001", category: "Minuman", price: 4000, stock: 96, minStock: 30, unit: "Botol" },
  { id: 10, name: "Susu Ultra 1L", sku: "SUS-001", category: "Minuman", price: 16500, stock: 30, minStock: 12, unit: "Kotak" },
  { id: 11, name: "Sarden ABC 155g", sku: "SRD-001", category: "Kaleng", price: 12500, stock: 45, minStock: 15, unit: "Kaleng" },
  { id: 12, name: "Kopi Kapal Api 165g", sku: "KPI-001", category: "Minuman", price: 17000, stock: 20, minStock: 10, unit: "Bungkus" },
];

const categories = ["Semua", "Sembako", "Mie Instan", "Protein", "Bumbu", "Kebersihan", "Minuman", "Kaleng"];

function fmt(n: number) { return "Rp " + n.toLocaleString("id-ID"); }

const emptyForm: Omit<Product, "id"> = { name: "", sku: "", category: "Sembako", price: 0, stock: 0, minStock: 5, unit: "Pcs" };

export function ProductsPage({ userRole }: { userRole: "admin" | "kasir" }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const filtered = products.filter(p => {
    const matchCat = category === "Semua" || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const openAdd = () => { setEditingProduct(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p: Product) => { setEditingProduct(p); setForm({ name: p.name, sku: p.sku, category: p.category, price: p.price, stock: p.stock, minStock: p.minStock, unit: p.unit }); setShowModal(true); };

  const handleSave = () => {
    if (!form.name || !form.sku) return;
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...editingProduct, ...form } : p));
    } else {
      setProducts(prev => [...prev, { ...form, id: Date.now() }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.375rem" }}>Manajemen Barang</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>{products.length} produk terdaftar</p>
        </div>
        {userRole === "admin" && (
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
            style={{ backgroundColor: "var(--primary)" }}>
            <Plus size={16} /> Tambah Produk
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk..." className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ backgroundColor: "white", border: "1px solid var(--border)" }} />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ backgroundColor: "white", border: "1px solid var(--border)", color: "var(--foreground)" }}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Produk", value: products.length, color: "var(--primary)" },
          { label: "Stok Menipis", value: products.filter(p => p.stock <= p.minStock).length, color: "#F59E0B" },
          { label: "Kategori", value: [...new Set(products.map(p => p.category))].length, color: "#8B5CF6" },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-3 flex items-center gap-3" style={{ border: "1px solid var(--border)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color + "15" }}>
              <Package size={15} style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{stat.value}</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--muted)" }}>
                {["SKU", "Nama Produk", "Kategori", "Harga", "Stok", "Min. Stok", "Satuan", "Status", userRole === "admin" ? "Aksi" : ""].filter(Boolean).map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const isLow = p.stock <= p.minStock;
                return (
                  <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                    className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>{p.sku}</td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: "var(--foreground)" }}>{p.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-xs" style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}>{p.category}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--primary)" }}>{fmt(p.price)}</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: isLow ? "#DC2626" : "var(--foreground)" }}>{p.stock}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>{p.minStock}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>{p.unit}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium`}
                        style={{ backgroundColor: isLow ? "#FEF2F2" : "#D1FAE5", color: isLow ? "#DC2626" : "#059669" }}>
                        {isLow ? "Menipis" : "Normal"}
                      </span>
                    </td>
                    {userRole === "admin" && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg transition-colors hover:bg-blue-50"
                            style={{ color: "#0EA5E9" }}>
                            <Edit2 size={14} />
                          </button>
                          {deleteConfirm === p.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(p.id)} className="px-2 py-0.5 rounded text-xs font-medium text-white" style={{ backgroundColor: "#DC2626" }}>Hapus</button>
                              <button onClick={() => setDeleteConfirm(null)} className="px-2 py-0.5 rounded text-xs" style={{ color: "var(--muted-foreground)" }}>Batal</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 rounded-lg transition-colors hover:bg-red-50" style={{ color: "#DC2626" }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl w-full max-w-md" style={{ border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ color: "var(--muted-foreground)" }}><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {([
                { key: "name", label: "Nama Produk", type: "text", placeholder: "Nama produk..." },
                { key: "sku", label: "Kode SKU", type: "text", placeholder: "SKU-000" },
                { key: "unit", label: "Satuan", type: "text", placeholder: "Pcs, Kg, Botol..." },
                { key: "price", label: "Harga Jual", type: "number", placeholder: "0" },
                { key: "stock", label: "Stok Saat Ini", type: "number", placeholder: "0" },
                { key: "minStock", label: "Stok Minimum", type: "number", placeholder: "5" },
              ] as const).map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={(form as any)[field.key]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)" }}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>Kategori</label>
                <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
                  {categories.filter(c => c !== "Semua").map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t" style={{ borderTop: "1px solid var(--border)" }}>
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>Batal</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: "var(--primary)" }}>
                <Save size={15} /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;