const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend berjalan! 🚀' });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});