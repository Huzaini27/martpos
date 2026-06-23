const crypto = require('crypto');
const db = require('../config/db');

const paymentMethodCodes = {
  tunai: 'CASH',
  transfer: 'BANK'
};

function makeInvoiceNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const time = now.toTimeString().slice(0, 8).replace(/:/g, '');
  const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();

  return `INV-${date}-${time}-${suffix}`;
}

function normalizeItems(items = []) {
  const grouped = new Map();

  for (const item of items) {
    const productId = Number(item.product_id ?? item.id);
    const quantity = Number(item.quantity ?? item.qty);

    if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
      return null;
    }

    grouped.set(productId, (grouped.get(productId) || 0) + quantity);
  }

  return Array.from(grouped, ([product_id, quantity]) => ({ product_id, quantity }));
}

const createTransaction = async (req, res) => {
  const connection = db.promise();
  const items = normalizeItems(req.body.items);
  const paymentMethod = req.body.payment_method || 'tunai';
  const paymentCode = paymentMethodCodes[paymentMethod];
  const amountPaid = Number(req.body.amount_paid ?? 0);
  let userId = Number(req.body.user_id);
  const notes = req.body.notes || null;

  if (!items || items.length === 0) {
    res.status(400).json({ message: 'Item transaksi belum valid' });
    return;
  }

  if (!paymentCode) {
    res.status(400).json({ message: 'Metode pembayaran tidak valid' });
    return;
  }

  try {
    await connection.beginTransaction();

    const [paymentMethods] = await connection.query(
      'SELECT id FROM payment_methods WHERE payment_code = ? AND status = ? LIMIT 1',
      [paymentCode, 'aktif']
    );

    if (paymentMethods.length === 0) {
      await connection.rollback();
      res.status(400).json({ message: 'Metode pembayaran belum tersedia di database' });
      return;
    }

    let cashierId = Number.isInteger(userId) && userId > 0 ? userId : null;

    if (cashierId) {
      const [users] = await connection.query(
        'SELECT id FROM users WHERE id = ? AND status = ? AND is_deleted = FALSE LIMIT 1',
        [cashierId, 'aktif']
      );

      cashierId = users.length ? users[0].id : null;
    }

    if (!cashierId) {
      const [users] = await connection.query(
        `
        SELECT id
        FROM users
        WHERE role IN ('kasir', 'admin')
            AND status = ?
            AND is_deleted = FALSE
        ORDER BY role = 'kasir' DESC, id ASC
        LIMIT 1
        `,
        ['aktif']
      );

      cashierId = users.length ? users[0].id : null;
    }

    if (!cashierId) {
      await connection.rollback();
      res.status(400).json({ message: 'User kasir aktif belum tersedia di database' });
      return;
    }

    const productIds = items.map((item) => item.product_id);
    const [products] = await connection.query(
      `
        SELECT
          products.id,
          products.product_name,
          products.selling_price,
          COALESCE(inventory.stock_quantity, 0) AS stock_quantity
        FROM products
        LEFT JOIN inventory ON products.id = inventory.product_id
        WHERE products.id IN (?) AND products.is_deleted = FALSE AND products.status = 'aktif'
        FOR UPDATE
      `,
      [productIds]
    );

    if (products.length !== productIds.length) {
      await connection.rollback();
      res.status(400).json({ message: 'Ada produk yang tidak ditemukan atau tidak aktif' });
      return;
    }

    const productsById = new Map(products.map((product) => [Number(product.id), product]));
    const details = items.map((item) => {
      const product = productsById.get(item.product_id);
      const stock = Number(product.stock_quantity);
      const unitPrice = Number(product.selling_price);
      const lineTotal = unitPrice * item.quantity;

      return {
        ...item,
        product_name: product.product_name,
        stock,
        unit_price: unitPrice,
        line_total: lineTotal
      };
    });

    const insufficientStock = details.find((item) => item.quantity > item.stock);
    if (insufficientStock) {
      await connection.rollback();
      res.status(400).json({
        message: `Stok ${insufficientStock.product_name} tidak cukup. Tersedia ${insufficientStock.stock}.`
      });
      return;
    }

    const subtotal = details.reduce((sum, item) => sum + item.line_total, 0);
    const paid = paymentMethod === 'tunai' ? amountPaid : subtotal;

    if (paymentMethod === 'tunai' && paid < subtotal) {
      await connection.rollback();
      res.status(400).json({ message: 'Uang tunai kurang dari total transaksi' });
      return;
    }

    const invoiceNumber = makeInvoiceNumber();
    const now = new Date();
    const saleDate = now.toISOString().slice(0, 10);
    const saleTime = now.toTimeString().slice(0, 8);

    const [saleResult] = await connection.query(
      `
        INSERT INTO sales (
          uuid,
          invoice_number,
          user_id,
          payment_method_id,
          sale_date,
          sale_time,
          subtotal,
          total_amount,
          amount_paid,
          change_amount,
          notes,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        crypto.randomUUID(),
        invoiceNumber,
        cashierId,
        paymentMethods[0].id,
        saleDate,
        saleTime,
        subtotal,
        subtotal,
        paid,
        paid - subtotal,
        notes,
        'completed'
      ]
    );

    for (const item of details) {
      await connection.query(
        `
          INSERT INTO sales_details (
            sales_id,
            product_id,
            quantity,
            unit_price,
            line_total
          ) VALUES (?, ?, ?, ?, ?)
        `,
        [saleResult.insertId, item.product_id, item.quantity, item.unit_price, item.line_total]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: 'Transaksi berhasil disimpan',
      transaction: {
        id: saleResult.insertId,
        invoice_number: invoiceNumber,
        total_amount: subtotal,
        amount_paid: paid,
        change_amount: paid - subtotal
      }
    });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({
      message: 'Gagal menyimpan transaksi',
      error: err.message
    });
  }
};

const getTransactionSummary = async (req, res) => {
  const connection = db.promise();

  try {
    const [[todayStats]] = await connection.query(`
      SELECT
        COALESCE(SUM(total_amount), 0) AS today_revenue,
        COUNT(id) AS today_transactions
      FROM sales
      WHERE sale_date = CURDATE()
        AND status = 'completed'
        AND is_deleted = FALSE
    `);

    const [[productStats]] = await connection.query(`
      SELECT
        COUNT(products.id) AS total_products,
        COALESCE(SUM(CASE WHEN COALESCE(inventory.stock_quantity, 0) <= COALESCE(inventory.reorder_level, 0) THEN 1 ELSE 0 END), 0) AS low_stock_count
      FROM products
      LEFT JOIN inventory ON products.id = inventory.product_id
      WHERE products.is_deleted = FALSE
        AND products.status = 'aktif'
    `);

    const [[reportStats]] = await connection.query(`
      SELECT
        COALESCE(SUM(sales.total_amount), 0) AS total_revenue,
        COUNT(DISTINCT sales.id) AS total_transactions,
        COALESCE(AVG(sales.total_amount), 0) AS average_transaction,
        COALESCE(SUM(sales_details.quantity), 0) AS products_sold
      FROM sales
      LEFT JOIN sales_details ON sales.id = sales_details.sales_id
      WHERE MONTH(sales.sale_date) = MONTH(CURDATE())
        AND YEAR(sales.sale_date) = YEAR(CURDATE())
        AND sales.status = 'completed'
        AND sales.is_deleted = FALSE
    `);

    const [weeklyRows] = await connection.query(`
      SELECT
        DATE_FORMAT(sale_date, '%Y-%m-%d') AS sale_date,
        COALESCE(SUM(total_amount), 0) AS total
      FROM sales
      WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        AND status = 'completed'
        AND is_deleted = FALSE
      GROUP BY sale_date
      ORDER BY sale_date ASC
    `);

    const [monthlyRows] = await connection.query(`
      SELECT
        MONTH(sale_date) AS month_number,
        DATE_FORMAT(sale_date, '%b') AS month,
        COALESCE(SUM(total_amount), 0) AS pendapatan,
        COUNT(id) AS transaksi
      FROM sales
      WHERE YEAR(sale_date) = YEAR(CURDATE())
        AND status = 'completed'
        AND is_deleted = FALSE
      GROUP BY MONTH(sale_date), DATE_FORMAT(sale_date, '%b')
      ORDER BY MONTH(sale_date)
    `);

    const [recentTransactions] = await connection.query(`
      SELECT
        sales.invoice_number AS id,
        TIME_FORMAT(sales.sale_time, '%H:%i') AS time,
        COALESCE(users.full_name, '-') AS kasir,
        COALESCE(SUM(sales_details.quantity), 0) AS items,
        sales.total_amount AS total
      FROM sales
      LEFT JOIN users ON sales.user_id = users.id
      LEFT JOIN sales_details ON sales.id = sales_details.sales_id
      WHERE sales.is_deleted = FALSE
      GROUP BY sales.id, sales.invoice_number, sales.sale_time, users.full_name, sales.total_amount
      ORDER BY sales.id DESC
      LIMIT 5
    `);

    const [lowStockItems] = await connection.query(`
      SELECT
        products.product_name AS name,
        COALESCE(inventory.stock_quantity, 0) AS stock,
        COALESCE(inventory.reorder_level, 0) AS min
      FROM products
      LEFT JOIN inventory ON products.id = inventory.product_id
      WHERE products.is_deleted = FALSE
        AND products.status = 'aktif'
        AND COALESCE(inventory.stock_quantity, 0) <= COALESCE(inventory.reorder_level, 0)
      ORDER BY COALESCE(inventory.stock_quantity, 0) ASC
      LIMIT 5
    `);

    const [topProducts] = await connection.query(`
      SELECT
        products.product_name AS name,
        COALESCE(SUM(sales_details.quantity), 0) AS qty,
        COALESCE(SUM(sales_details.line_total), 0) AS revenue
      FROM sales_details
      INNER JOIN sales ON sales_details.sales_id = sales.id
      INNER JOIN products ON sales_details.product_id = products.id
      WHERE sales.status = 'completed'
        AND sales.is_deleted = FALSE
      GROUP BY products.id, products.product_name
      ORDER BY qty DESC
      LIMIT 5
    `);

    const [categoryRows] = await connection.query(`
      SELECT
        COALESCE(categories.category_name, 'Lainnya') AS name,
        COALESCE(SUM(sales_details.line_total), 0) AS total
      FROM sales_details
      INNER JOIN sales ON sales_details.sales_id = sales.id
      INNER JOIN products ON sales_details.product_id = products.id
      LEFT JOIN categories ON products.category_id = categories.id
      WHERE sales.status = 'completed'
        AND sales.is_deleted = FALSE
      GROUP BY categories.id, categories.category_name
      ORDER BY total DESC
      LIMIT 5
    `);

    const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const weeklyByDate = new Map(weeklyRows.map((item) => [item.sale_date, Number(item.total)]));
    const weeklySales = [];

    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const key = date.toISOString().slice(0, 10);

      weeklySales.push({
        day: dayLabels[date.getDay()],
        total: weeklyByDate.get(key) || 0
      });
    }

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthlyByNumber = new Map(monthlyRows.map((item) => [Number(item.month_number), item]));
    const monthlySales = monthLabels.map((month, index) => {
      const row = monthlyByNumber.get(index + 1);

      return {
        month,
        pendapatan: Number(row?.pendapatan || 0),
        transaksi: Number(row?.transaksi || 0)
      };
    });

    const categoryTotal = categoryRows.reduce((sum, item) => sum + Number(item.total), 0);
    const categoryColors = ['#059669', '#0EA5E9', '#8B5CF6', '#F59E0B', '#EF4444'];
    const categorySales = categoryRows.map((item, index) => ({
      name: item.name,
      value: categoryTotal > 0 ? Number(((Number(item.total) / categoryTotal) * 100).toFixed(2)) : 0,
      color: categoryColors[index % categoryColors.length]
    }));

    res.json({
      today_revenue: Number(todayStats.today_revenue),
      today_transactions: Number(todayStats.today_transactions),
      total_products: Number(productStats.total_products),
      low_stock_count: Number(productStats.low_stock_count),
      report_stats: {
        total_revenue: Number(reportStats.total_revenue),
        total_transactions: Number(reportStats.total_transactions),
        average_transaction: Number(reportStats.average_transaction),
        products_sold: Number(reportStats.products_sold)
      },
      weekly_sales: weeklySales,
      monthly_sales: monthlySales,
      recent_transactions: recentTransactions.map((item) => ({
        id: item.id,
        time: item.time,
        kasir: item.kasir,
        items: Number(item.items),
        total: Number(item.total)
      })),
      low_stock_items: lowStockItems.map((item) => ({
        name: item.name,
        stock: Number(item.stock),
        min: Number(item.min)
      })),
      top_products: topProducts.map((item) => ({
        name: item.name,
        qty: Number(item.qty),
        revenue: Number(item.revenue)
      })),
      category_sales: categorySales
    });
  } catch (err) {
    res.status(500).json({
      message: 'Gagal mengambil ringkasan transaksi',
      error: err.message
    });
  }
};

const getTransactions = (req, res) => {
  const query = `
    SELECT
      sales.id,
      sales.invoice_number,
      sales.sale_date,
      sales.sale_time,
      users.full_name AS cashier_name,
      payment_methods.payment_name,
      COALESCE(SUM(sales_details.quantity), 0) AS total_items,
      sales.total_amount,
      sales.amount_paid,
      sales.change_amount,
      sales.status
    FROM sales
    LEFT JOIN users ON sales.user_id = users.id
    LEFT JOIN payment_methods ON sales.payment_method_id = payment_methods.id
    LEFT JOIN sales_details ON sales.id = sales_details.sales_id
    WHERE sales.is_deleted = FALSE
    GROUP BY
      sales.id,
      sales.invoice_number,
      sales.sale_date,
      sales.sale_time,
      users.full_name,
      payment_methods.payment_name,
      sales.total_amount,
      sales.amount_paid,
      sales.change_amount,
      sales.status
    ORDER BY sales.id DESC
    LIMIT 100
  `;

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({
        message: 'Gagal mengambil data transaksi',
        error: err.message
      });
      return;
    }

    res.json(results);
  });
};

module.exports = {
  createTransaction,
  getTransactionSummary,
  getTransactions
};
