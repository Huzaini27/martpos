import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Plus, Edit2, Trash2, Package, X, Save } from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  categoryId: number;
  price: number;
  purchasePrice: number;
  stock: number;
  minStock: number;
  unit: string;
  unitId: number;
  status: string;
}

interface ApiProduct {
  id: number;
  product_code: string;
  product_name: string;
  category_id: number;
  category_name: string | null;
  unit_id: number;
  unit_name: string | null;
  purchase_price: string | number;
  selling_price: string | number;
  stock_quantity: number | null;
  reorder_level: number | null;
  reorder_quantity: number | null;
  status: string | null;
}

interface Category {
  id: number;
  category_name: string;
}

interface Unit {
  id: number;
  unit_name: string;
}

type ProductForm = Omit<Product, "id" | "category" | "unit" | "status">;

function fmt(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatNumberInput(value: number) {
  return value > 0 ? value.toLocaleString("id-ID") : "";
}

function parseNumberInput(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function makeEmptyForm(categories: Category[], units: Unit[]): ProductForm {
  return {
    name: "",
    sku: "",
    categoryId: categories[0]?.id ?? 0,
    price: 0,
    purchasePrice: 0,
    stock: 0,
    minStock: 5,
    unitId: units[0]?.id ?? 0,
  };
}

function toProduct(item: ApiProduct): Product {
  return {
    id: item.id,
    name: item.product_name,
    sku: item.product_code,
    category: item.category_name ?? "-",
    categoryId: Number(item.category_id),
    price: Number(item.selling_price),
    purchasePrice: Number(item.purchase_price),
    stock: Number(item.stock_quantity ?? item.reorder_quantity ?? 0),
    minStock: Number(item.reorder_level ?? 0),
    unit: item.unit_name ?? "-",
    unitId: Number(item.unit_id),
    status: item.status ?? "aktif",
  };
}

export function ProductsPage({ userRole }: { userRole: "admin" | "kasir" }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(() => makeEmptyForm([], []));
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/products`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Gagal mengambil produk");
    }

    setProducts((data as ApiProduct[]).map(toProduct));
  }, []);

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      setError("");

      try {
        const [productsRes, categoriesRes, unitsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products`),
          fetch(`${API_BASE_URL}/categories`),
          fetch(`${API_BASE_URL}/units`),
        ]);

        const [productsData, categoriesData, unitsData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
          unitsRes.json(),
        ]);

        if (!productsRes.ok) throw new Error(productsData.message || "Gagal mengambil produk");
        if (!categoriesRes.ok) throw new Error(categoriesData.message || "Gagal mengambil kategori");
        if (!unitsRes.ok) throw new Error(unitsData.message || "Gagal mengambil satuan");

        const nextCategories = categoriesData as Category[];
        const nextUnits = unitsData as Unit[];

        setCategories(nextCategories);
        setUnits(nextUnits);
        setProducts((productsData as ApiProduct[]).map(toProduct));
        setForm(makeEmptyForm(nextCategories, nextUnits));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data produk");
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  const categoryOptions = useMemo(() => {
    const fromProducts = products.map((p) => p.category).filter(Boolean);
    const fromMaster = categories.map((c) => c.category_name);
    return ["Semua", ...Array.from(new Set([...fromMaster, ...fromProducts]))];
  }, [categories, products]);

  const filtered = products.filter((p) => {
    const keyword = search.toLowerCase();
    const matchCat = category === "Semua" || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(keyword) || p.sku.toLowerCase().includes(keyword);
    return matchCat && matchSearch;
  });

  const openAdd = () => {
    setEditingProduct(null);
    setForm(makeEmptyForm(categories, units));
    setError("");
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      sku: p.sku,
      categoryId: p.categoryId,
      price: p.price,
      purchasePrice: p.purchasePrice,
      stock: p.stock,
      minStock: p.minStock,
      unitId: p.unitId,
    });
    setError("");
    setShowModal(true);
  };

  const setNumberField = (key: keyof ProductForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: parseNumberInput(value) }));
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Nama produk wajib diisi";
    if (!form.sku.trim()) return "Kode SKU wajib diisi";
    if (!form.categoryId) return "Kategori wajib dipilih";
    if (!form.unitId) return "Satuan wajib dipilih";
    if (form.price <= 0) return "Harga jual harus lebih dari 0";
    if ((form.purchasePrice || form.price) <= 0) return "Harga beli harus lebih dari 0";
    if (form.stock < 0) return "Stok tidak boleh minus";
    if (form.minStock < 0) return "Stok minimum tidak boleh minus";
    return "";
  };

  const handleSave = async () => {
    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      product_code: form.sku.trim(),
      product_name: form.name.trim(),
      description: "",
      category_id: form.categoryId,
      unit_id: form.unitId,
      purchase_price: form.purchasePrice || form.price,
      selling_price: form.price,
      stock_quantity: form.stock,
      reorder_level: form.minStock,
      reorder_quantity: Math.max(form.minStock, 1),
      status: editingProduct?.status ?? "aktif",
    };

    try {
      const res = await fetch(
        editingProduct ? `${API_BASE_URL}/products/${editingProduct.id}` : `${API_BASE_URL}/products`,
        {
          method: editingProduct ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Gagal menyimpan produk");
      }

      await loadProducts();
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan produk");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Gagal menghapus produk");
      }

      await loadProducts();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus produk");
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {loading ? "Memuat produk..." : `${products.length} produk terdaftar`}
          </p>
          {error && !showModal && <p className="text-sm mt-1 text-red-600">{error}</p>}
        </div>
        {userRole === "admin" && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Plus size={16} /> Tambah Produk
          </button>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ backgroundColor: "white", border: "1px solid var(--border)" }}
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ backgroundColor: "white", border: "1px solid var(--border)", color: "var(--foreground)" }}
        >
          {categoryOptions.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Produk", value: products.length, color: "var(--primary)" },
          { label: "Stok Menipis", value: products.filter((p) => p.stock <= p.minStock).length, color: "#F59E0B" },
          { label: "Kategori", value: [...new Set(products.map((p) => p.category))].length, color: "#8B5CF6" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-3 flex items-center gap-3" style={{ border: "1px solid var(--border)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color + "15" }}>
              <Package size={15} style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {stat.value}
              </p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--muted)" }}>
                {["SKU", "Nama Produk", "Kategori", "Harga", "Stok", "Min. Stok", "Satuan", "Status", userRole === "admin" ? "Aksi" : ""]
                  .filter(Boolean)
                  .map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>{h}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const isLow = p.stock <= p.minStock;
                return (
                  <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>{p.sku}</td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: "var(--foreground)" }}>{p.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-xs" style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}>
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--primary)" }}>{fmt(p.price)}</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: isLow ? "#DC2626" : "var(--foreground)" }}>{p.stock}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>{p.minStock}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>{p.unit}</td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: isLow ? "#FEF2F2" : "#D1FAE5", color: isLow ? "#DC2626" : "#059669" }}
                      >
                        {isLow ? "Menipis" : "Normal"}
                      </span>
                    </td>
                    {userRole === "admin" && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg transition-colors hover:bg-blue-50" style={{ color: "#0EA5E9" }}>
                            <Edit2 size={14} />
                          </button>
                          {deleteConfirm === p.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(p.id)} className="px-2 py-0.5 rounded text-xs font-medium text-white" style={{ backgroundColor: "#DC2626" }}>
                                Hapus
                              </button>
                              <button onClick={() => setDeleteConfirm(null)} className="px-2 py-0.5 rounded text-xs" style={{ color: "var(--muted-foreground)" }}>
                                Batal
                              </button>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col" style={{ border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between p-5 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ color: "var(--muted-foreground)" }}>
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>Nama Produk</label>
                <input
                  type="text"
                  placeholder="Nama produk..."
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>Kode SKU</label>
                <input
                  type="text"
                  placeholder="SKU-000"
                  value={form.sku}
                  onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)" }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>Kategori</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setNumberField("categoryId", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.category_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>Satuan</label>
                  <select
                    value={form.unitId}
                    onChange={(e) => setNumberField("unitId", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>{u.unit_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>Harga Beli</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formatNumberInput(form.purchasePrice)}
                    onChange={(e) => setNumberField("purchasePrice", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)", fontVariantNumeric: "tabular-nums" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>Harga Jual</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formatNumberInput(form.price)}
                    onChange={(e) => setNumberField("price", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)", fontVariantNumeric: "tabular-nums" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>Stok Saat Ini</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formatNumberInput(form.stock)}
                    onChange={(e) => setNumberField("stock", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)", fontVariantNumeric: "tabular-nums" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>Stok Minimum</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="5"
                    value={formatNumberInput(form.minStock)}
                    onChange={(e) => setNumberField("minStock", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)", fontVariantNumeric: "tabular-nums" }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-5 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-70"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <Save size={15} /> {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
