const db = require('../config/db');

const getUnits = (req, res) => {
  db.query(
    'SELECT id, unit_code, unit_name, description, status FROM units WHERE status = "aktif"',
    (err, results) => {
      if (err) {
        res.status(500).json({
          message: 'Gagal mengambil data satuan',
          error: err.message
        });
        return;
      }

      res.json(results);
    }
  );
};

module.exports = {
  getUnits
};