-- ============================================================
-- DATABASE MARTPOS - POS & INVENTORY MANAGEMENT
-- PostgreSQL Script
-- Compatible dengan Render PostgreSQL
-- ============================================================

-- ============================================================
-- 1. CREATE DATABASE
-- ============================================================
-- Note: Di Render, database sudah dibuat otomatis
-- Gunakan database yang sudah ada

-- ============================================================
-- 2. MASTER DATA TABLES
-- ============================================================

-- ============================================================
-- TABLE: stores (Warung/Tenant)
-- ============================================================
CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,
  uuid CHAR(36) UNIQUE NOT NULL,
  store_name VARCHAR(100) NOT NULL,
  owner_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif', 'suspended')),
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_store_name ON stores(store_name);
CREATE INDEX IF NOT EXISTS idx_store_status ON stores(status);

-- ============================================================
-- TABLE: users (Pengguna/Karyawan)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id) ON DELETE SET NULL,
  uuid CHAR(36) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'kasir' CHECK (role IN ('admin', 'kasir', 'gudang', 'owner')),
  status VARCHAR(20) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif', 'suspended')),
  last_login TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_store_id ON users(store_id);
CREATE INDEX IF NOT EXISTS idx_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_status ON users(status);

-- ============================================================
-- TABLE: categories (Kategori Produk)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  category_code VARCHAR(20) UNIQUE NOT NULL,
  category_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_category_name ON categories(category_name);
CREATE INDEX IF NOT EXISTS idx_category_code ON categories(category_code);
CREATE INDEX IF NOT EXISTS idx_status ON categories(status);

-- ============================================================
-- TABLE: units (Satuan Produk)
-- ============================================================
CREATE TABLE IF NOT EXISTS units (
  id SERIAL PRIMARY KEY,
  unit_code VARCHAR(10) UNIQUE NOT NULL,
  unit_name VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_unit_code ON units(unit_code);

-- ============================================================
-- TABLE: products (Produk/Barang)
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  uuid CHAR(36) UNIQUE NOT NULL,
  product_code VARCHAR(50) UNIQUE NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  description TEXT,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  purchase_price DECIMAL(10,2) NOT NULL CHECK (purchase_price > 0),
  selling_price DECIMAL(10,2) NOT NULL CHECK (selling_price > 0),
  reorder_level INTEGER DEFAULT 10,
  reorder_quantity INTEGER DEFAULT 50,
  status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif', 'discontinued')),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_product_name ON products(product_name);
CREATE INDEX IF NOT EXISTS idx_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_status ON products(status);

-- ============================================================
-- TABLE: customers (Pelanggan)
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  uuid CHAR(36) UNIQUE NOT NULL,
  customer_code VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  city VARCHAR(50),
  province VARCHAR(50),
  postal_code VARCHAR(10),
  is_loyalty_member BOOLEAN DEFAULT FALSE,
  loyalty_points INTEGER DEFAULT 0,
  total_purchase DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_name ON customers(customer_name);
CREATE INDEX IF NOT EXISTS idx_customer_code ON customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_is_loyalty_member ON customers(is_loyalty_member);

-- ============================================================
-- TABLE: suppliers (Pemasok)
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  uuid CHAR(36) UNIQUE NOT NULL,
  supplier_code VARCHAR(50) UNIQUE NOT NULL,
  supplier_name VARCHAR(150) NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  address TEXT,
  city VARCHAR(50),
  province VARCHAR(50),
  postal_code VARCHAR(10),
  bank_account VARCHAR(100),
  bank_name VARCHAR(50),
  payment_terms VARCHAR(50),
  status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif', 'suspend')),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_supplier_name ON suppliers(supplier_name);
CREATE INDEX IF NOT EXISTS idx_supplier_code ON suppliers(supplier_code);
CREATE INDEX IF NOT EXISTS idx_phone ON suppliers(phone);
CREATE INDEX IF NOT EXISTS idx_status ON suppliers(status);

-- ============================================================
-- TABLE: payment_methods (Metode Pembayaran)
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  payment_code VARCHAR(20) UNIQUE NOT NULL,
  payment_name VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. TRANSACTION TABLES
-- ============================================================

-- ============================================================
-- TABLE: sales (Header Penjualan)
-- ============================================================
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  uuid CHAR(36) UNIQUE NOT NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  payment_method_id INTEGER NOT NULL REFERENCES payment_methods(id) ON DELETE RESTRICT,
  sale_date DATE NOT NULL,
  sale_time TIME NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  amount_paid DECIMAL(12,2) NOT NULL,
  change_amount DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoice_number ON sales(invoice_number);
CREATE INDEX IF NOT EXISTS idx_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_status ON sales(status);

-- ============================================================
-- TABLE: sales_details (Detail Penjualan)
-- ============================================================
CREATE TABLE IF NOT EXISTS sales_details (
  id SERIAL PRIMARY KEY,
  sales_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  line_total DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sales_id ON sales_details(sales_id);
CREATE INDEX IF NOT EXISTS idx_product_id ON sales_details(product_id);

-- ============================================================
-- TABLE: purchases (Header Pembelian)
-- ============================================================
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  uuid CHAR(36) UNIQUE NOT NULL,
  purchase_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  payment_method_id INTEGER NOT NULL REFERENCES payment_methods(id) ON DELETE RESTRICT,
  purchase_date DATE NOT NULL,
  purchase_time TIME NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  amount_paid DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'ordered', 'received', 'cancelled')),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_purchase_number ON purchases(purchase_number);
CREATE INDEX IF NOT EXISTS idx_purchase_date ON purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_supplier_id ON purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_status ON purchases(status);

-- ============================================================
-- TABLE: purchases_details (Detail Pembelian)
-- ============================================================
CREATE TABLE IF NOT EXISTS purchases_details (
  id SERIAL PRIMARY KEY,
  purchases_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  line_total DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_purchases_id ON purchases_details(purchases_id);
CREATE INDEX IF NOT EXISTS idx_product_id ON purchases_details(product_id);

-- ============================================================
-- 4. INVENTORY TABLES
-- ============================================================

-- ============================================================
-- TABLE: inventory (Status Stok Real-time)
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  reserved_quantity INTEGER DEFAULT 0,
  available_quantity INTEGER GENERATED ALWAYS AS (stock_quantity - reserved_quantity) STORED,
  last_counted_date DATE,
  reorder_level INTEGER,
  reorder_quantity INTEGER,
  last_purchase_price DECIMAL(10,2),
  last_purchase_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_low_stock ON inventory(stock_quantity, reorder_level);

-- ============================================================
-- TABLE: inventory_logs (Riwayat Perubahan Stok)
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_logs (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'sales', 'adjustment', 'opname', 'return')),
  transaction_id INTEGER,
  quantity_change INTEGER NOT NULL,
  stock_before INTEGER NOT NULL,
  stock_after INTEGER NOT NULL,
  notes TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_id ON inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON inventory_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_type ON inventory_logs(transaction_type);

-- ============================================================
-- TABLE: stock_adjustments (Penyesuaian Stok)
-- ============================================================
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id SERIAL PRIMARY KEY,
  uuid CHAR(36) UNIQUE NOT NULL,
  adjustment_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  adjustment_date DATE NOT NULL,
  adjustment_reason VARCHAR(20) NOT NULL CHECK (adjustment_reason IN ('rusak', 'hilang', 'kadaluarsa', 'koreksi', 'lainnya')),
  description TEXT,
  total_items INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'posted')),
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_adjustment_number ON stock_adjustments(adjustment_number);
CREATE INDEX IF NOT EXISTS idx_adjustment_date ON stock_adjustments(adjustment_date);
CREATE INDEX IF NOT EXISTS idx_status ON stock_adjustments(status);

-- ============================================================
-- TABLE: stock_adjustment_details (Detail Penyesuaian Stok)
-- ============================================================
CREATE TABLE IF NOT EXISTS stock_adjustment_details (
  id SERIAL PRIMARY KEY,
  stock_adjustment_id INTEGER NOT NULL REFERENCES stock_adjustments(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity_adjusted INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stock_adjustment_id ON stock_adjustment_details(stock_adjustment_id);
CREATE INDEX IF NOT EXISTS idx_product_id ON stock_adjustment_details(product_id);

-- ============================================================
-- TABLE: stock_opname (Stock Opname)
-- ============================================================
CREATE TABLE IF NOT EXISTS stock_opname (
  id SERIAL PRIMARY KEY,
  uuid CHAR(36) UNIQUE NOT NULL,
  opname_number VARCHAR(50) UNIQUE NOT NULL,
  opname_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  total_items INTEGER DEFAULT 0,
  total_variance INTEGER DEFAULT 0,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_opname_number ON stock_opname(opname_number);
CREATE INDEX IF NOT EXISTS idx_opname_date ON stock_opname(opname_date);
CREATE INDEX IF NOT EXISTS idx_status ON stock_opname(status);

-- ============================================================
-- 5. SUPPORTING TABLES
-- ============================================================

-- ============================================================
-- TABLE: discounts (Daftar Diskon)
-- ============================================================
CREATE TABLE IF NOT EXISTS discounts (
  id SERIAL PRIMARY KEY,
  uuid CHAR(36) UNIQUE NOT NULL,
  discount_code VARCHAR(50) UNIQUE NOT NULL,
  discount_name VARCHAR(100),
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  min_quantity INTEGER DEFAULT 1,
  max_quantity INTEGER,
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif', 'expired')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_discount_code ON discounts(discount_code);
CREATE INDEX IF NOT EXISTS idx_status ON discounts(status);

-- ============================================================
-- TABLE: expense_categories (Kategori Pengeluaran)
-- ============================================================
CREATE TABLE IF NOT EXISTS expense_categories (
  id SERIAL PRIMARY KEY,
  category_code VARCHAR(20) UNIQUE NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: expenses (Pengeluaran Operasional)
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  uuid CHAR(36) UNIQUE NOT NULL,
  expense_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  category_id INTEGER NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
  expense_date DATE NOT NULL,
  expense_time TIME,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  payment_method_id INTEGER REFERENCES payment_methods(id) ON DELETE SET NULL,
  notes TEXT,
  attachment VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expense_number ON expenses(expense_number);
CREATE INDEX IF NOT EXISTS idx_expense_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_status ON expenses(status);

-- ============================================================
-- TABLE: audit_logs (Log Aktivitas Sistem)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  username VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  module VARCHAR(50),
  table_name VARCHAR(50),
  record_id INTEGER,
  old_value TEXT,
  new_value TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_table_name ON audit_logs(table_name);

-- ============================================================
-- 6. INSERT SAMPLE DATA
-- ============================================================

-- Payment Methods
INSERT INTO payment_methods (payment_code, payment_name, description, status) VALUES
('CASH', 'Tunai', 'Pembayaran tunai', 'aktif'),
('BANK', 'Transfer Bank', 'Pembayaran via transfer bank', 'aktif'),
('CARD', 'Kartu Kredit', 'Pembayaran menggunakan kartu kredit', 'aktif'),
('CHECK', 'Cek', 'Pembayaran menggunakan cek', 'aktif'),
('PENDING', 'Belum Dibayar', 'Belum ada pembayaran', 'aktif')
ON CONFLICT (payment_code) DO NOTHING;

-- Categories
INSERT INTO categories (category_code, category_name, description, status) VALUES
('GR', 'Groceries', 'Bahan makanan umum', 'aktif'),
('BV', 'Beverages', 'Minuman', 'aktif'),
('SNK', 'Snacks', 'Camilan', 'aktif'),
('HK', 'Household', 'Barang rumah tangga', 'aktif'),
('HSC', 'Health & Sanitary', 'Kesehatan dan kebersihan', 'aktif'),
('ELE', 'Electrical', 'Barang elektronik', 'aktif')
ON CONFLICT (category_code) DO NOTHING;

-- Units
INSERT INTO units (unit_code, unit_name, description, status) VALUES
('PCS', 'Piece', 'Per Buah', 'aktif'),
('KG', 'Kilogram', 'Per Kilogram', 'aktif'),
('G', 'Gram', 'Per Gram', 'aktif'),
('L', 'Liter', 'Per Liter', 'aktif'),
('ML', 'Milliliter', 'Per Milliliter', 'aktif'),
('BOX', 'Box', 'Per Kotak', 'aktif'),
('DZN', 'Dozen', 'Per Lusin', 'aktif'),
('PKG', 'Package', 'Per Paket', 'aktif')
ON CONFLICT (unit_code) DO NOTHING;

-- Stores (Warung/Tenant)
INSERT INTO stores (uuid, store_name, owner_name, phone, address, status) VALUES
('550e8400-e29b-41d4-a716-446655430001', 'Warung Kelontong Demo', 'Pemilik Warung', '081234567893', 'Jl. Contoh No. 1', 'aktif')
ON CONFLICT (uuid) DO NOTHING;

-- Users (Admin & Staff)
INSERT INTO users (store_id, uuid, username, email, password, full_name, phone, role, status) VALUES
(1, '550e8400-e29b-41d4-a716-446655440001', 'admin', 'admin@warung.com', '$2y$10$YLWP6FvXW1V8RpU9c0TqfOvg0cB5nJNvTh9VzI.h3Q3RGqZwH2Yxi', 'Administrator', '081234567890', 'admin', 'aktif'),
(1, '550e8400-e29b-41d4-a716-446655440002', 'kasir01', 'kasir01@warung.com', '$2y$10$YLWP6FvXW1V8RpU9c0TqfOvg0cB5nJNvTh9VzI.h3Q3RGqZwH2Yxi', 'Kasir Utama', '081234567891', 'kasir', 'aktif'),
(1, '550e8400-e29b-41d4-a716-446655440003', 'gudang01', 'gudang01@warung.com', '$2y$10$YLWP6FvXW1V8RpU9c0TqfOvg0cB5nJNvTh9VzI.h3Q3RGqZwH2Yxi', 'Petugas Gudang', '081234567892', 'gudang', 'aktif'),
(1, '550e8400-e29b-41d4-a716-446655440004', 'owner', 'owner@warung.com', '$2y$10$YLWP6FvXW1V8RpU9c0TqfOvg0cB5nJNvTh9VzI.h3Q3RGqZwH2Yxi', 'Pemilik Warung', '081234567893', 'owner', 'aktif')
ON CONFLICT (uuid) DO NOTHING;

-- Suppliers
INSERT INTO suppliers (uuid, supplier_code, supplier_name, contact_person, phone, email, city, status) VALUES
('550e8400-e29b-41d4-a716-446655450001', 'SUP001', 'PT. Indofood Sukses Makmur', 'Budi Santoso', '021-1234567', 'sales@indofood.com', 'Jakarta', 'aktif'),
('550e8400-e29b-41d4-a716-446655450002', 'SUP002', 'Distributor Minuman Jaya', 'Ani Wijaya', '022-8765432', 'info@minumanjaya.com', 'Bandung', 'aktif'),
('550e8400-e29b-41d4-a716-446655450003', 'SUP003', 'CV. Snack Nusantara', 'Ahmad Purnama', '021-5555555', 'cs@snacknusantara.com', 'Tangerang', 'aktif')
ON CONFLICT (uuid) DO NOTHING;

-- Customers
INSERT INTO customers (uuid, customer_code, customer_name, phone, address, city, is_loyalty_member, status) VALUES
('550e8400-e29b-41d4-a716-446655460001', 'CUST001', 'Toko Serba Ada Jaya', '081234567800', 'Jl. Merdeka No. 10', 'Jakarta', TRUE, 'aktif'),
('550e8400-e29b-41d4-a716-446655460002', 'CUST002', 'Minimarket Sentosa', '081234567801', 'Jl. Sudirman No. 25', 'Bandung', FALSE, 'aktif'),
('550e8400-e29b-41d4-a716-446655460003', 'CUST003', 'Warung Mak Siti', '081234567802', 'Jl. Gatot Subroto No. 5', 'Tangerang', TRUE, 'aktif')
ON CONFLICT (uuid) DO NOTHING;

-- Expense Categories
INSERT INTO expense_categories (category_code, category_name, description, status) VALUES
('GAJI', 'Gaji Karyawan', 'Biaya gaji karyawan', 'aktif'),
('LISTRIK', 'Listrik & Air', 'Biaya listrik dan air', 'aktif'),
('SEWA', 'Sewa Tempat', 'Biaya sewa lokasi usaha', 'aktif'),
('TRANSPORT', 'Transportasi', 'Biaya transportasi dan bahan bakar', 'aktif'),
('MAINTENANCE', 'Pemeliharaan', 'Biaya perawatan dan perbaikan', 'aktif'),
('LAINNYA', 'Lainnya', 'Pengeluaran lainnya', 'aktif')
ON CONFLICT (category_code) DO NOTHING;

-- ============================================================
-- 7. VIEWS (OPTIONAL BUT USEFUL)
-- ============================================================

-- View: Low Stock Products
CREATE OR REPLACE VIEW v_low_stock_products AS
SELECT 
  p.id,
  p.product_code,
  p.product_name,
  c.category_name,
  u.unit_name,
  inv.stock_quantity,
  inv.reorder_level,
  (inv.reorder_level - inv.stock_quantity) as shortage_qty,
  inv.reorder_quantity,
  p.purchase_price
FROM products p
INNER JOIN inventory inv ON p.id = inv.product_id
INNER JOIN categories c ON p.category_id = c.id
INNER JOIN units u ON p.unit_id = u.id
WHERE inv.stock_quantity <= inv.reorder_level
  AND p.status = 'aktif'
ORDER BY shortage_qty DESC;

-- View: Sales Summary
CREATE OR REPLACE VIEW v_sales_summary AS
SELECT 
  DATE(s.sale_date) as sale_date,
  COUNT(s.id) as total_transactions,
  COUNT(DISTINCT s.customer_id) as unique_customers,
  SUM(s.subtotal) as total_subtotal,
  SUM(s.discount_amount) as total_discount,
  SUM(s.tax_amount) as total_tax,
  SUM(s.total_amount) as total_sales,
  AVG(s.total_amount) as avg_transaction_value
FROM sales s
WHERE s.status = 'completed'
  AND s.is_deleted = FALSE
GROUP BY DATE(s.sale_date)
ORDER BY sale_date DESC;

-- View: Product Performance
CREATE OR REPLACE VIEW v_product_performance AS
SELECT 
  p.id,
  p.product_code,
  p.product_name,
  c.category_name,
  COUNT(sd.id) as total_sold,
  SUM(sd.quantity) as total_quantity_sold,
  SUM(sd.line_total) as total_revenue,
  AVG(sd.unit_price) as avg_selling_price,
  MAX(s.sale_date) as last_sale_date
FROM products p
LEFT JOIN sales_details sd ON p.id = sd.product_id
LEFT JOIN sales s ON sd.sales_id = s.id
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.status = 'aktif'
  AND (s.is_deleted = FALSE OR s.id IS NULL)
GROUP BY p.id, p.product_code, p.product_name, c.category_name
ORDER BY total_revenue DESC;

-- ============================================================
-- 8. FUNCTIONS FOR UPDATED_AT
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at on all tables
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_details_updated_at BEFORE UPDATE ON sales_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_details_updated_at BEFORE UPDATE ON purchases_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_adjustments_updated_at BEFORE UPDATE ON stock_adjustments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_adjustment_details_updated_at BEFORE UPDATE ON stock_adjustment_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_opname_updated_at BEFORE UPDATE ON stock_opname
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discounts_updated_at BEFORE UPDATE ON discounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_categories_updated_at BEFORE UPDATE ON expense_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 9. TRIGGERS FOR INVENTORY
-- ============================================================

-- Trigger: Update Inventory setelah penjualan
CREATE OR REPLACE FUNCTION after_sales_detail_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inventory
  SET 
    stock_quantity = stock_quantity - NEW.quantity,
    updated_at = CURRENT_TIMESTAMP
  WHERE product_id = NEW.product_id;
  
  INSERT INTO inventory_logs 
  (product_id, transaction_type, quantity_change, stock_before, stock_after, created_by, created_at)
  SELECT 
    NEW.product_id,
    'sales',
    -NEW.quantity,
    (SELECT stock_quantity + NEW.quantity FROM inventory WHERE product_id = NEW.product_id),
    (SELECT stock_quantity FROM inventory WHERE product_id = NEW.product_id),
    (SELECT user_id FROM sales WHERE id = NEW.sales_id),
    CURRENT_TIMESTAMP;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_after_sales_detail_insert 
AFTER INSERT ON sales_details
FOR EACH ROW EXECUTE FUNCTION after_sales_detail_insert();

-- Trigger: Update Inventory setelah pembelian
CREATE OR REPLACE FUNCTION after_purchases_detail_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inventory
  SET 
    stock_quantity = stock_quantity + NEW.quantity,
    last_purchase_price = NEW.unit_price,
    last_purchase_date = CURRENT_DATE,
    updated_at = CURRENT_TIMESTAMP
  WHERE product_id = NEW.product_id;
  
  INSERT INTO inventory_logs
  (product_id, transaction_type, quantity_change, stock_before, stock_after, created_by, created_at)
  SELECT
    NEW.product_id,
    'purchase',
    NEW.quantity,
    (SELECT stock_quantity - NEW.quantity FROM inventory WHERE product_id = NEW.product_id),
    (SELECT stock_quantity FROM inventory WHERE product_id = NEW.product_id),
    (SELECT user_id FROM purchases WHERE id = NEW.purchases_id),
    CURRENT_TIMESTAMP;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_after_purchases_detail_insert
AFTER INSERT ON purchases_details
FOR EACH ROW EXECUTE FUNCTION after_purchases_detail_insert();

-- Trigger: Create Inventory record when product is created
CREATE OR REPLACE FUNCTION after_product_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO inventory 
  (product_id, stock_quantity, reorder_level, reorder_quantity)
  VALUES 
  (NEW.id, 0, NEW.reorder_level, NEW.reorder_quantity);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_after_product_insert
AFTER INSERT ON products
FOR EACH ROW EXECUTE FUNCTION after_product_insert();

-- ============================================================
-- SELESAI - Database siap digunakan!
-- ============================================================
