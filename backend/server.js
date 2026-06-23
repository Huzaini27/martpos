const express = require('express');
const cors = require('cors');

const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const unitRoutes = require('./routes/unitRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend berjalan' });
});

app.get('/api/db-test', (req, res) => {
  const db = require('./config/db');

  db.query('SELECT DATABASE() AS database_name', (err, results) => {
    if (err) {
      res.status(500).json({
        message: 'Database gagal dites',
        error: err.message
      });
      return;
    }

    res.json({
      message: 'Database berhasil terhubung',
      database: results[0].database_name
    });
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/transactions', transactionRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
