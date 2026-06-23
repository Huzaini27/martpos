const db = require('../config/db');

const getCategories = (req, res) => {
  db.query(
    'SELECT id, category_code, category_name, description, status FROM categories WHERE is_deleted = FALSE',
    (err, results) => {
      if (err) {
        res.status(500).json({
          message: 'Gagal mengambil data kategori',
          error: err.message
        });
        return;
      }

      res.json(results);
    }
  );
};

module.exports = {
  getCategories
};