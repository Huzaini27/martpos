const db = require('../config/db');
const crypto = require('crypto');

const getProducts = (req, res) => {
  const query = `
    SELECT
      products.id,
      products.uuid,
      products.product_code,
      products.product_name,
      products.description,
      products.category_id,
      categories.category_name,
      products.unit_id,
      units.unit_name,
      products.purchase_price,
      products.selling_price,
      COALESCE(inventory.stock_quantity, 0) AS stock_quantity,
      products.reorder_level,
      products.reorder_quantity,
      products.status,
      products.is_deleted,
      products.created_at,
      products.updated_at
    FROM products
    LEFT JOIN categories ON products.category_id = categories.id
    LEFT JOIN units ON products.unit_id = units.id
    LEFT JOIN inventory ON products.id = inventory.product_id
    WHERE products.is_deleted = FALSE
    ORDER BY products.id DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({
        message: 'Gagal mengambil data produk',
        error: err.message
      });
      return;
    }

    res.json(results);
  });
};

const createProduct = (req, res) => {
  const {
    product_code,
    product_name,
    description,
    category_id,
    unit_id,
    purchase_price,
    selling_price,
    reorder_level,
    reorder_quantity,
    stock_quantity
  } = req.body;

  const safeProductCode = String(product_code || '').trim();
  const safeProductName = String(product_name || '').trim();
  const safeCategoryId = Number(category_id);
  const safeUnitId = Number(unit_id);
  const safeSellingPrice = Number(selling_price);
  const safePurchasePrice = Number(purchase_price || selling_price);
  const safeReorderLevel = Number(reorder_level ?? 10);
  const safeReorderQuantity = Number(reorder_quantity ?? Math.max(safeReorderLevel, 1));
  const safeStockQuantity = Number(stock_quantity ?? 0);

  if (
    !safeProductCode ||
    !safeProductName ||
    !safeCategoryId ||
    !safeUnitId ||
    safeSellingPrice <= 0 ||
    safePurchasePrice <= 0 ||
    safeStockQuantity < 0
  ) {
    res.status(400).json({
      message: 'Data produk belum lengkap atau tidak valid'
    });
    return;
  }

  const uuid = crypto.randomUUID();

  const query = `
    INSERT INTO products (
      uuid,
      product_code,
      product_name,
      description,
      category_id,
      unit_id,
      purchase_price,
      selling_price,
      reorder_level,
      reorder_quantity
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    uuid,
    safeProductCode,
    safeProductName,
    description || null,
    safeCategoryId,
    safeUnitId,
    safePurchasePrice,
    safeSellingPrice,
    safeReorderLevel,
    safeReorderQuantity
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      res.status(500).json({
        message: 'Gagal menambahkan produk',
        error: err.message
      });
      return;
    }

    db.query(
      `
        INSERT INTO inventory (product_id, stock_quantity, reorder_level, reorder_quantity)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          stock_quantity = VALUES(stock_quantity),
          reorder_level = VALUES(reorder_level),
          reorder_quantity = VALUES(reorder_quantity)
      `,
      [result.insertId, safeStockQuantity, safeReorderLevel, safeReorderQuantity],
      (inventoryErr) => {
        if (inventoryErr) {
          res.status(500).json({
            message: 'Produk dibuat, tetapi stok awal gagal disimpan',
            error: inventoryErr.message
          });
          return;
        }

        res.status(201).json({
          message: 'Produk berhasil ditambahkan',
          productId: result.insertId
        });
      }
    );
  });
};

const updateProduct = (req, res) => {
  const { id } = req.params;

  const {
    product_code,
    product_name,
    description,
    category_id,
    unit_id,
    purchase_price,
    selling_price,
    reorder_level,
    reorder_quantity,
    stock_quantity,
    status
  } = req.body;

  const safeProductCode = String(product_code || '').trim();
  const safeProductName = String(product_name || '').trim();
  const safeCategoryId = Number(category_id);
  const safeUnitId = Number(unit_id);
  const safeSellingPrice = Number(selling_price);
  const safePurchasePrice = Number(purchase_price || selling_price);
  const safeReorderLevel = Number(reorder_level ?? 10);
  const safeReorderQuantity = Number(reorder_quantity ?? Math.max(safeReorderLevel, 1));
  const safeStockQuantity = Number(stock_quantity ?? 0);
  const safeStatus = status || 'aktif';

  if (
    !safeProductCode ||
    !safeProductName ||
    !safeCategoryId ||
    !safeUnitId ||
    safeSellingPrice <= 0 ||
    safePurchasePrice <= 0 ||
    safeStockQuantity < 0
  ) {
    res.status(400).json({
      message: 'Data produk belum lengkap atau tidak valid'
    });
    return;
  }

  const query = `
    UPDATE products SET
      product_code = ?,
      product_name = ?,
      description = ?,
      category_id = ?,
      unit_id = ?,
      purchase_price = ?,
      selling_price = ?,
      reorder_level = ?,
      reorder_quantity = ?,
      status = ?
    WHERE id = ?
  `;

  const values = [
    safeProductCode,
    safeProductName,
    description || null,
    safeCategoryId,
    safeUnitId,
    safePurchasePrice,
    safeSellingPrice,
    safeReorderLevel,
    safeReorderQuantity,
    safeStatus,
    id
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      res.status(500).json({
        message: 'Gagal mengubah produk',
        error: err.message
      });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).json({
        message: 'Produk tidak ditemukan'
      });
      return;
    }

    db.query(
      `
        INSERT INTO inventory (product_id, stock_quantity, reorder_level, reorder_quantity)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          stock_quantity = VALUES(stock_quantity),
          reorder_level = VALUES(reorder_level),
          reorder_quantity = VALUES(reorder_quantity)
      `,
      [id, safeStockQuantity, safeReorderLevel, safeReorderQuantity],
      (inventoryErr) => {
        if (inventoryErr) {
          res.status(500).json({
            message: 'Produk diubah, tetapi stok gagal disimpan',
            error: inventoryErr.message
          });
          return;
        }

        res.json({
          message: 'Produk berhasil diubah'
        });
      }
    );
  });
};

const deleteProduct = (req, res) => {
  const { id } = req.params;

  db.query(
    'UPDATE products SET is_deleted = TRUE WHERE id = ?',
    [id],
    (err, result) => {
      if (err) {
        res.status(500).json({
          message: 'Gagal menghapus produk',
          error: err.message
        });
        return;
      }

      if (result.affectedRows === 0) {
        res.status(404).json({
          message: 'Produk tidak ditemukan'
        });
        return;
      }

      res.json({
        message: 'Produk berhasil dihapus'
      });
    }
  );
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
