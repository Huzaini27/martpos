const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'martpos'
});

db.connect((err) => {
  if (err) {
    console.log('Database gagal terhubung:', err.message);
    return;
  }

  console.log('Database berhasil terhubung');
});

module.exports = db;