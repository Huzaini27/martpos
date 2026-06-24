const mysql = require('mysql2');
const { Pool } = require('pg');

// Determine database type from environment
const dbType = process.env.DB_TYPE || 'mysql';

let db;

if (dbType === 'postgres') {
  // PostgreSQL configuration for Render
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'martpos',
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  // PostgreSQL connection test
  pool.connect((err) => {
    if (err) {
      console.log('PostgreSQL gagal terhubung:', err.message);
      return;
    }
    console.log('PostgreSQL berhasil terhubung');
  });

  // Wrap PostgreSQL pool to be compatible with MySQL-style queries
  db = {
    query: (sql, params, callback) => {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      
      // Convert MySQL-style placeholders (?) to PostgreSQL style ($1, $2, etc.)
      let paramIndex = 0;
      const pgSql = sql.replace(/\?/g, () => `$${++paramIndex}`);
      
      pool.query(pgSql, params)
        .then(result => callback(null, result.rows))
        .catch(err => callback(err, null));
    },
    connect: (callback) => pool.connect(callback),
    end: (callback) => pool.end(callback)
  };
} else {
  // MySQL configuration (default)
  db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'martpos',
    port: process.env.DB_PORT || 3306
  });

  db.connect((err) => {
    if (err) {
      console.log('MySQL gagal terhubung:', err.message);
      return;
    }
    console.log('MySQL berhasil terhubung');
  });
}

module.exports = db;