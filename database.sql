-- ============================================================
-- DATABASE MARTPOS - POS & INVENTORY MANAGEMENT
-- MySQL/MariaDB Script
-- Compatible dengan XAMPP
-- ============================================================

-- ============================================================
-- 1. CREATE DATABASE
-- ============================================================
DROP DATABASE IF EXISTS `martpos`;
CREATE DATABASE `martpos`;
USE `martpos`;

-- Set charset ke utf8mb4 untuk support semua karakter
ALTER DATABASE `martpos` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================
-- 2. MASTER DATA TABLES
-- ============================================================

-- ============================================================
-- TABLE: stores (Warung/Tenant)
-- ============================================================
CREATE TABLE `stores` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) UNIQUE NOT NULL,
  `store_name` VARCHAR(100) NOT NULL,
  `owner_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20),
  `address` TEXT,
  `status` ENUM('aktif', 'nonaktif', 'suspended') NOT NULL DEFAULT 'aktif',
  `is_deleted` BOOLEAN DEFAULT FALSE,
  `deleted_at` DATETIME,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_store_name` (`store_name`),
  INDEX `idx_store_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: users (Pengguna/Karyawan)
-- ============================================================
CREATE TABLE `users` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `store_id` INT(11) UNSIGNED,
  `uuid` CHAR(36) UNIQUE NOT NULL,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `email` VARCHAR(100) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20),
  `role` ENUM('admin', 'kasir', 'gudang', 'owner') NOT NULL DEFAULT 'kasir',
  `status` ENUM('aktif', 'nonaktif', 'suspended') NOT NULL DEFAULT 'aktif',
  `last_login` DATETIME,
  `is_deleted` BOOLEAN DEFAULT FALSE,
  `deleted_at` DATETIME,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE SET NULL,
  INDEX `idx_store_id` (`store_id`),
  INDEX `idx_username` (`username`),
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: categories (Kategori Produk)
-- ============================================================
CREATE TABLE `categories` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `category_code` VARCHAR(20) UNIQUE NOT NULL,
  `category_name` VARCHAR(100) UNIQUE NOT NULL,
  `description` TEXT,
  `status` ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
  `is_deleted` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category_name` (`category_name`),
  INDEX `idx_category_code` (`category_code`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: units (Satuan Produk)
-- ============================================================
CREATE TABLE `units` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `unit_code` VARCHAR(10) UNIQUE NOT NULL,
  `unit_name` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `status` ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_unit_code` (`unit_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: products (Produk/Barang)
-- ============================================================
CREATE TABLE `products` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) UNIQUE NOT NULL,
  `product_code` VARCHAR(50) UNIQUE NOT NULL,
  `product_name` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `category_id` INT(11) UNSIGNED NOT NULL,
  `unit_id` INT(11) UNSIGNED NOT NULL,
  `purchase_price` DECIMAL(10,2) NOT NULL CHECK (`purchase_price` > 0),
  `selling_price` DECIMAL(10,2) NOT NULL CHECK (`selling_price` > 0),
  `reorder_level` INT(11) DEFAULT 10,
  `reorder_quantity` INT(11) DEFAULT 50,
  `status` ENUM('aktif', 'nonaktif', 'discontinued') DEFAULT 'aktif',
  `is_deleted` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON DELETE RESTRICT,
  INDEX `idx_product_code` (`product_code`),
  INDEX `idx_product_name` (`product_name`),
  INDEX `idx_category_id` (`category_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: customers (Pelanggan)
-- ============================================================
CREATE TABLE `customers` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) UNIQUE NOT NULL,
  `customer_code` VARCHAR(50) UNIQUE NOT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20),
  `email` VARCHAR(100),
  `address` TEXT,
  `city` VARCHAR(50),
  `province` VARCHAR(50),
  `postal_code` VARCHAR(10),
  `is_loyalty_member` BOOLEAN DEFAULT FALSE,
  `loyalty_points` INT(11) DEFAULT 0,
  `total_purchase` DECIMAL(12,2) DEFAULT 0,
  `status` ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
  `is_deleted` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_customer_name` (`customer_name`),
  INDEX `idx_customer_code` (`customer_code`),
  INDEX `idx_phone` (`phone`),
  INDEX `idx_is_loyalty_member` (`is_loyalty_member`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: suppliers (Pemasok)
-- ============================================================
CREATE TABLE `suppliers` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) UNIQUE NOT NULL,
  `supplier_code` VARCHAR(50) UNIQUE NOT NULL,
  `supplier_name` VARCHAR(150) NOT NULL,
  `contact_person` VARCHAR(100),
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100),
  `address` TEXT,
  `city` VARCHAR(50),
  `province` VARCHAR(50),
  `postal_code` VARCHAR(10),
  `bank_account` VARCHAR(100),
  `bank_name` VARCHAR(50),
  `payment_terms` VARCHAR(50),
  `status` ENUM('aktif', 'nonaktif', 'suspend') DEFAULT 'aktif',
  `is_deleted` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_supplier_name` (`supplier_name`),
  INDEX `idx_supplier_code` (`supplier_code`),
  INDEX `idx_phone` (`phone`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: payment_methods (Metode Pembayaran)
-- ============================================================
CREATE TABLE `payment_methods` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `payment_code` VARCHAR(20) UNIQUE NOT NULL,
  `payment_name` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `status` ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. TRANSACTION TABLES
-- ============================================================

-- ============================================================
-- TABLE: sales (Header Penjualan)
-- ============================================================
CREATE TABLE `sales` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) UNIQUE NOT NULL,
  `invoice_number` VARCHAR(50) UNIQUE NOT NULL,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `customer_id` INT(11) UNSIGNED,
  `payment_method_id` INT(11) UNSIGNED NOT NULL,
  `sale_date` DATE NOT NULL,
  `sale_time` TIME NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `discount_amount` DECIMAL(10,2) DEFAULT 0,
  `tax_amount` DECIMAL(10,2) DEFAULT 0,
  `total_amount` DECIMAL(12,2) NOT NULL,
  `amount_paid` DECIMAL(12,2) NOT NULL,
  `change_amount` DECIMAL(12,2) DEFAULT 0,
  `notes` TEXT,
  `status` ENUM('completed', 'pending', 'cancelled') DEFAULT 'completed',
  `is_deleted` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON DELETE RESTRICT,
  INDEX `idx_invoice_number` (`invoice_number`),
  INDEX `idx_sale_date` (`sale_date`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: sales_details (Detail Penjualan)
-- ============================================================
CREATE TABLE `sales_details` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `sales_id` INT(11) UNSIGNED NOT NULL,
  `product_id` INT(11) UNSIGNED NOT NULL,
  `quantity` INT(11) NOT NULL CHECK (`quantity` > 0),
  `unit_price` DECIMAL(10,2) NOT NULL,
  `discount_percentage` DECIMAL(5,2) DEFAULT 0,
  `discount_amount` DECIMAL(10,2) DEFAULT 0,
  `line_total` DECIMAL(12,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`sales_id`) REFERENCES `sales`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT,
  INDEX `idx_sales_id` (`sales_id`),
  INDEX `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: purchases (Header Pembelian)
-- ============================================================
CREATE TABLE `purchases` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) UNIQUE NOT NULL,
  `purchase_number` VARCHAR(50) UNIQUE NOT NULL,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `supplier_id` INT(11) UNSIGNED NOT NULL,
  `payment_method_id` INT(11) UNSIGNED NOT NULL,
  `purchase_date` DATE NOT NULL,
  `purchase_time` TIME NOT NULL,
  `expected_delivery_date` DATE,
  `actual_delivery_date` DATE,
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `discount_amount` DECIMAL(10,2) DEFAULT 0,
  `tax_amount` DECIMAL(10,2) DEFAULT 0,
  `total_amount` DECIMAL(12,2) NOT NULL,
  `amount_paid` DECIMAL(12,2) DEFAULT 0,
  `notes` TEXT,
  `status` ENUM('draft', 'ordered', 'received', 'cancelled') DEFAULT 'draft',
  `is_deleted` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON DELETE RESTRICT,
  INDEX `idx_purchase_number` (`purchase_number`),
  INDEX `idx_purchase_date` (`purchase_date`),
  INDEX `idx_supplier_id` (`supplier_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: purchases_details (Detail Pembelian)
-- ============================================================
CREATE TABLE `purchases_details` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `purchases_id` INT(11) UNSIGNED NOT NULL,
  `product_id` INT(11) UNSIGNED NOT NULL,
  `quantity` INT(11) NOT NULL CHECK (`quantity` > 0),
  `unit_price` DECIMAL(10,2) NOT NULL,
  `discount_percentage` DECIMAL(5,2) DEFAULT 0,
  `discount_amount` DECIMAL(10,2) DEFAULT 0,
  `line_total` DECIMAL(12,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`purchases_id`) REFERENCES `purchases`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT,
  INDEX `idx_purchases_id` (`purchases_id`),
  INDEX `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. INVENTORY TABLES
-- ============================================================

-- ============================================================
-- TABLE: inventory (Status Stok Real-time)
-- ============================================================
CREATE TABLE `inventory` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT(11) UNSIGNED UNIQUE NOT NULL,
  `stock_quantity` INT(11) NOT NULL DEFAULT 0 CHECK (`stock_quantity` >= 0),
  `reserved_quantity` INT(11) DEFAULT 0,
  `available_quantity` INT(11) GENERATED ALWAYS AS (`stock_quantity` - `reserved_quantity`) STORED,
  `last_counted_date` DATE,
  `reorder_level` INT(11),
  `reorder_quantity` INT(11),
  `last_purchase_price` DECIMAL(10,2),
  `last_purchase_date` DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_low_stock` (`stock_quantity`, `reorder_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: inventory_logs (Riwayat Perubahan Stok)
-- ============================================================
CREATE TABLE `inventory_logs` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT(11) UNSIGNED NOT NULL,
  `transaction_type` ENUM('purchase', 'sales', 'adjustment', 'opname', 'return') NOT NULL,
  `transaction_id` INT(11) UNSIGNED,
  `quantity_change` INT(11) NOT NULL,
  `stock_before` INT(11) NOT NULL,
  `stock_after` INT(11) NOT NULL,
  `notes` TEXT,
  `created_by` INT(11) UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_transaction_type` (`transaction_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: stock_adjustments (Penyesuaian Stok)
-- ============================================================
CREATE TABLE `stock_adjustments` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) UNIQUE NOT NULL,
  `adjustment_number` VARCHAR(50) UNIQUE NOT NULL,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `adjustment_date` DATE NOT NULL,
  `adjustment_reason` ENUM('rusak', 'hilang', 'kadaluarsa', 'koreksi', 'lainnya') NOT NULL,
  `description` TEXT,
  `total_items` INT(11) DEFAULT 0,
  `status` ENUM('draft', 'approved', 'posted') DEFAULT 'draft',
  `approved_by` INT(11) UNSIGNED,
  `approved_at` DATETIME,
  `is_deleted` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_adjustment_number` (`adjustment_number`),
  INDEX `idx_adjustment_date` (`adjustment_date`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: stock_adjustment_details (Detail Penyesuaian Stok)
-- ============================================================
CREATE TABLE `stock_adjustment_details` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `stock_adjustment_id` INT(11) UNSIGNED NOT NULL,
  `product_id` INT(11) UNSIGNED NOT NULL,
  `quantity_adjusted` INT(11) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`stock_adjustment_id`) REFERENCES `stock_adjustments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT,
  INDEX `idx_stock_adjustment_id` (`stock_adjustment_id`),
  INDEX `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: stock_opname (Stock Opname)
-- ============================================================
CREATE TABLE `stock_opname` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) UNIQUE NOT NULL,
  `opname_number` VARCHAR(50) UNIQUE NOT NULL,
  `opname_date` DATE NOT NULL,
  `start_time` TIME,
  `end_time` TIME,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `total_items` INT(11) DEFAULT 0,
  `total_variance` INT(11) DEFAULT 0,
  `notes` TEXT,
  `status` ENUM('in_progress', 'completed', 'cancelled') DEFAULT 'in_progress',
  `is_deleted` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  INDEX `idx_opname_number` (`opname_number`),
  INDEX `idx_opname_date` (`opname_date`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. SUPPORTING TABLES
-- ============================================================

-- ============================================================
-- TABLE: discounts (Daftar Diskon)
-- ============================================================
CREATE TABLE `discounts` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) UNIQUE NOT NULL,
  `discount_code` VARCHAR(50) UNIQUE NOT NULL,
  `discount_name` VARCHAR(100),
  `discount_type` ENUM('percentage', 'fixed') NOT NULL,
  `discount_value` DECIMAL(10,2) NOT NULL,
  `product_id` INT(11) UNSIGNED,
  `category_id` INT(11) UNSIGNED,
  `min_quantity` INT(11) DEFAULT 1,
  `max_quantity` INT(11),
  `start_date` DATE NOT NULL,
  `end_date` DATE,
  `status` ENUM('aktif', 'nonaktif', 'expired') DEFAULT 'aktif',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  INDEX `idx_discount_code` (`discount_code`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: expense_categories (Kategori Pengeluaran)
-- ============================================================
CREATE TABLE `expense_categories` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `category_code` VARCHAR(20) UNIQUE NOT NULL,
  `category_name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `status` ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: expenses (Pengeluaran Operasional)
-- ============================================================
CREATE TABLE `expenses` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) UNIQUE NOT NULL,
  `expense_number` VARCHAR(50) UNIQUE NOT NULL,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `category_id` INT(11) UNSIGNED NOT NULL,
  `expense_date` DATE NOT NULL,
  `expense_time` TIME,
  `description` TEXT,
  `amount` DECIMAL(10,2) NOT NULL CHECK (`amount` > 0),
  `payment_method_id` INT(11) UNSIGNED,
  `notes` TEXT,
  `attachment` VARCHAR(255),
  `status` ENUM('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending',
  `approved_by` INT(11) UNSIGNED,
  `approved_at` DATETIME,
  `is_deleted` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`category_id`) REFERENCES `expense_categories`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON DELETE SET NULL,
  INDEX `idx_expense_number` (`expense_number`),
  INDEX `idx_expense_date` (`expense_date`),
  INDEX `idx_category_id` (`category_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: audit_logs (Log Aktivitas Sistem)
-- ============================================================
CREATE TABLE `audit_logs` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT(11) UNSIGNED,
  `username` VARCHAR(50),
  `action` VARCHAR(100) NOT NULL,
  `module` VARCHAR(50),
  `table_name` VARCHAR(50),
  `record_id` INT(11) UNSIGNED,
  `old_value` LONGTEXT,
  `new_value` LONGTEXT,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_action` (`action`),
  INDEX `idx_table_name` (`table_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. INSERT SAMPLE DATA
-- ============================================================

-- Payment Methods
INSERT INTO `payment_methods` (`payment_code`, `payment_name`, `description`, `status`) VALUES
('CASH', 'Tunai', 'Pembayaran tunai', 'aktif'),
('BANK', 'Transfer Bank', 'Pembayaran via transfer bank', 'aktif'),
('CARD', 'Kartu Kredit', 'Pembayaran menggunakan kartu kredit', 'aktif'),
('CHECK', 'Cek', 'Pembayaran menggunakan cek', 'aktif'),
('PENDING', 'Belum Dibayar', 'Belum ada pembayaran', 'aktif');

-- Categories
INSERT INTO `categories` (`category_code`, `category_name`, `description`, `status`) VALUES
('GR', 'Groceries', 'Bahan makanan umum', 'aktif'),
('BV', 'Beverages', 'Minuman', 'aktif'),
('SNK', 'Snacks', 'Camilan', 'aktif'),
('HK', 'Household', 'Barang rumah tangga', 'aktif'),
('HSC', 'Health & Sanitary', 'Kesehatan dan kebersihan', 'aktif'),
('ELE', 'Electrical', 'Barang elektronik', 'aktif');

-- Units
INSERT INTO `units` (`unit_code`, `unit_name`, `description`, `status`) VALUES
('PCS', 'Piece', 'Per Buah', 'aktif'),
('KG', 'Kilogram', 'Per Kilogram', 'aktif'),
('G', 'Gram', 'Per Gram', 'aktif'),
('L', 'Liter', 'Per Liter', 'aktif'),
('ML', 'Milliliter', 'Per Milliliter', 'aktif'),
('BOX', 'Box', 'Per Kotak', 'aktif'),
('DZN', 'Dozen', 'Per Lusin', 'aktif'),
('PKG', 'Package', 'Per Paket', 'aktif');

-- Stores (Warung/Tenant)
INSERT INTO `stores` (`uuid`, `store_name`, `owner_name`, `phone`, `address`, `status`) VALUES
('550e8400-e29b-41d4-a716-446655430001', 'Warung Kelontong Demo', 'Pemilik Warung', '081234567893', 'Jl. Contoh No. 1', 'aktif');

-- Users (Admin & Staff)
INSERT INTO `users` (`store_id`, `uuid`, `username`, `email`, `password`, `full_name`, `phone`, `role`, `status`) VALUES
(1, '550e8400-e29b-41d4-a716-446655440001', 'admin', 'admin@warung.com', '$2y$10$YLWP6FvXW1V8RpU9c0TqfOvg0cB5nJNvTh9VzI.h3Q3RGqZwH2Yxi', 'Administrator', '081234567890', 'admin', 'aktif'),
(1, '550e8400-e29b-41d4-a716-446655440002', 'kasir01', 'kasir01@warung.com', '$2y$10$YLWP6FvXW1V8RpU9c0TqfOvg0cB5nJNvTh9VzI.h3Q3RGqZwH2Yxi', 'Kasir Utama', '081234567891', 'kasir', 'aktif'),
(1, '550e8400-e29b-41d4-a716-446655440003', 'gudang01', 'gudang01@warung.com', '$2y$10$YLWP6FvXW1V8RpU9c0TqfOvg0cB5nJNvTh9VzI.h3Q3RGqZwH2Yxi', 'Petugas Gudang', '081234567892', 'gudang', 'aktif'),
(1, '550e8400-e29b-41d4-a716-446655440004', 'owner', 'owner@warung.com', '$2y$10$YLWP6FvXW1V8RpU9c0TqfOvg0cB5nJNvTh9VzI.h3Q3RGqZwH2Yxi', 'Pemilik Warung', '081234567893', 'owner', 'aktif');

-- Suppliers
INSERT INTO `suppliers` (`uuid`, `supplier_code`, `supplier_name`, `contact_person`, `phone`, `email`, `city`, `status`) VALUES
('550e8400-e29b-41d4-a716-446655450001', 'SUP001', 'PT. Indofood Sukses Makmur', 'Budi Santoso', '021-1234567', 'sales@indofood.com', 'Jakarta', 'aktif'),
('550e8400-e29b-41d4-a716-446655450002', 'SUP002', 'Distributor Minuman Jaya', 'Ani Wijaya', '022-8765432', 'info@minumanjaya.com', 'Bandung', 'aktif'),
('550e8400-e29b-41d4-a716-446655450003', 'SUP003', 'CV. Snack Nusantara', 'Ahmad Purnama', '021-5555555', 'cs@snacknusantara.com', 'Tangerang', 'aktif');

-- Customers
INSERT INTO `customers` (`uuid`, `customer_code`, `customer_name`, `phone`, `address`, `city`, `is_loyalty_member`, `status`) VALUES
('550e8400-e29b-41d4-a716-446655460001', 'CUST001', 'Toko Serba Ada Jaya', '081234567800', 'Jl. Merdeka No. 10', 'Jakarta', TRUE, 'aktif'),
('550e8400-e29b-41d4-a716-446655460002', 'CUST002', 'Minimarket Sentosa', '081234567801', 'Jl. Sudirman No. 25', 'Bandung', FALSE, 'aktif'),
('550e8400-e29b-41d4-a716-446655460003', 'CUST003', 'Warung Mak Siti', '081234567802', 'Jl. Gatot Subroto No. 5', 'Tangerang', TRUE, 'aktif');

-- Expense Categories
INSERT INTO `expense_categories` (`category_code`, `category_name`, `description`, `status`) VALUES
('GAJI', 'Gaji Karyawan', 'Biaya gaji karyawan', 'aktif'),
('LISTRIK', 'Listrik & Air', 'Biaya listrik dan air', 'aktif'),
('SEWA', 'Sewa Tempat', 'Biaya sewa lokasi usaha', 'aktif'),
('TRANSPORT', 'Transportasi', 'Biaya transportasi dan bahan bakar', 'aktif'),
('MAINTENANCE', 'Pemeliharaan', 'Biaya perawatan dan perbaikan', 'aktif'),
('LAINNYA', 'Lainnya', 'Pengeluaran lainnya', 'aktif');

-- ============================================================
-- 7. VIEWS (OPTIONAL BUT USEFUL)
-- ============================================================

-- View: Low Stock Products
CREATE VIEW `v_low_stock_products` AS
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
CREATE VIEW `v_sales_summary` AS
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
CREATE VIEW `v_product_performance` AS
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
GROUP BY p.id
ORDER BY total_revenue DESC;

-- ============================================================
-- 8. TRIGGERS
-- ============================================================

-- Trigger: Update Inventory setelah penjualan
DELIMITER $$

CREATE TRIGGER `tr_after_sales_detail_insert` 
AFTER INSERT ON `sales_details`
FOR EACH ROW
BEGIN
  UPDATE `inventory`
  SET 
    stock_quantity = stock_quantity - NEW.quantity,
    updated_at = CURRENT_TIMESTAMP
  WHERE product_id = NEW.product_id;
  
  INSERT INTO `inventory_logs` 
  (product_id, transaction_type, quantity_change, stock_before, stock_after, created_by, created_at)
  SELECT 
    NEW.product_id,
    'sales',
    -NEW.quantity,
    (SELECT stock_quantity + NEW.quantity FROM inventory WHERE product_id = NEW.product_id),
    (SELECT stock_quantity FROM inventory WHERE product_id = NEW.product_id),
    (SELECT user_id FROM sales WHERE id = NEW.sales_id),
    CURRENT_TIMESTAMP;
END$$

-- Trigger: Update Inventory setelah pembelian
CREATE TRIGGER `tr_after_purchases_detail_insert`
AFTER INSERT ON `purchases_details`
FOR EACH ROW
BEGIN
  UPDATE `inventory`
  SET 
    stock_quantity = stock_quantity + NEW.quantity,
    last_purchase_price = NEW.unit_price,
    last_purchase_date = CURDATE(),
    updated_at = CURRENT_TIMESTAMP
  WHERE product_id = NEW.product_id;
  
  INSERT INTO `inventory_logs`
  (product_id, transaction_type, quantity_change, stock_before, stock_after, created_by, created_at)
  SELECT
    NEW.product_id,
    'purchase',
    NEW.quantity,
    (SELECT stock_quantity - NEW.quantity FROM inventory WHERE product_id = NEW.product_id),
    (SELECT stock_quantity FROM inventory WHERE product_id = NEW.product_id),
    (SELECT user_id FROM purchases WHERE id = NEW.purchases_id),
    CURRENT_TIMESTAMP;
END$$

-- Trigger: Create Inventory record when product is created
CREATE TRIGGER `tr_after_product_insert`
AFTER INSERT ON `products`
FOR EACH ROW
BEGIN
  INSERT INTO `inventory` 
  (product_id, stock_quantity, reorder_level, reorder_quantity)
  VALUES 
  (NEW.id, 0, NEW.reorder_level, NEW.reorder_quantity);
END$$

DELIMITER ;

-- ============================================================
-- 9. SET FOREIGN KEY CHECKS
-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- SELESAI - Database siap digunakan!
-- ============================================================

-- Test query untuk memastikan semuanya berjalan:
-- SELECT COUNT(*) as total_users FROM users;
-- SELECT COUNT(*) as total_products FROM products;
-- SELECT * FROM v_low_stock_products;
-- SELECT * FROM v_sales_summary;
