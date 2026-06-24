const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  multipleStatements: true
});

const sqlScript = fs.readFileSync(path.join(__dirname, '../database.sql'), 'utf8');

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }

  console.log('Connected to database, executing schema...');

  db.query(sqlScript, (error, results) => {
    if (error) {
      console.error('Error executing schema:', error.message);
      process.exit(1);
    }

    console.log('Database schema initialized successfully!');
    db.end();
    process.exit(0);
  });
});
