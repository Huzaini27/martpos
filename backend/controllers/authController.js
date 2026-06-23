const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'martpos-dev-secret';

const query = (sql, values = []) => new Promise((resolve, reject) => {
  db.query(sql, values, (err, results) => {
    if (err) {
      reject(err);
      return;
    }

    resolve(results);
  });
});

const beginTransaction = () => new Promise((resolve, reject) => {
  db.beginTransaction((err) => {
    if (err) {
      reject(err);
      return;
    }

    resolve();
  });
});

const commitTransaction = () => new Promise((resolve, reject) => {
  db.commit((err) => {
    if (err) {
      reject(err);
      return;
    }

    resolve();
  });
});

const rollbackTransaction = () => new Promise((resolve) => {
  db.rollback(() => resolve());
});

const ensureAuthSchema = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS stores (
      id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      uuid CHAR(36) UNIQUE NOT NULL,
      store_name VARCHAR(100) NOT NULL,
      owner_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      address TEXT,
      status ENUM('aktif', 'nonaktif', 'suspended') NOT NULL DEFAULT 'aktif',
      is_deleted BOOLEAN DEFAULT FALSE,
      deleted_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_store_name (store_name),
      INDEX idx_store_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const columns = await query(`
    SELECT COUNT(*) AS total
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'store_id'
  `);

  if (Number(columns[0].total) === 0) {
    await query('ALTER TABLE users ADD COLUMN store_id INT(11) UNSIGNED NULL AFTER id');
    await query('ALTER TABLE users ADD INDEX idx_store_id (store_id)');
  }
};

const toPublicUser = (user) => ({
  id: user.id,
  uuid: user.uuid,
  store_id: user.store_id,
  username: user.username,
  email: user.email,
  full_name: user.full_name,
  role: user.role
});

const register = async (req, res) => {
  try {
    await ensureAuthSchema();

    const storeName = String(req.body.store_name || '').trim();
    const storePhone = String(req.body.store_phone || '').trim();
    const storeAddress = String(req.body.store_address || '').trim();
    const fullName = String(req.body.full_name || req.body.name || '').trim();
    const username = String(req.body.username || '').trim().toLowerCase();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!storeName || !fullName || !username || !email || !password) {
      res.status(400).json({
        message: 'Nama warung, nama pemilik, username, email, dan password wajib diisi'
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        message: 'Password minimal 6 karakter'
      });
      return;
    }

    const existingUsers = await query(
      'SELECT username, email FROM users WHERE (username = ? OR email = ?) AND is_deleted = FALSE LIMIT 1',
      [username, email]
    );

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      const message = existingUser.username === username
        ? 'Username sudah dipakai. Gunakan username lain.'
        : 'Email sudah terdaftar. Gunakan email lain atau login.';

      res.status(409).json({
        message
      });
      return;
    }

    await beginTransaction();

    const hashedPassword = await bcrypt.hash(password, 10);
    const storeUuid = crypto.randomUUID();
    const userUuid = crypto.randomUUID();

    const storeResult = await query(
      `
        INSERT INTO stores (uuid, store_name, owner_name, phone, address, status)
        VALUES (?, ?, ?, ?, ?, 'aktif')
      `,
      [storeUuid, storeName, fullName, storePhone || null, storeAddress || null]
    );

    const userResult = await query(
      `
        INSERT INTO users (store_id, uuid, username, email, password, full_name, phone, role, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'admin', 'aktif')
      `,
      [storeResult.insertId, userUuid, username, email, hashedPassword, fullName, storePhone || null]
    );

    await commitTransaction();

    res.status(201).json({
      message: 'Warung berhasil didaftarkan. Silakan login sebagai admin warung.',
      store: {
        id: storeResult.insertId,
        uuid: storeUuid,
        store_name: storeName
      },
      user: {
        id: userResult.insertId,
        uuid: userUuid,
        store_id: storeResult.insertId,
        username,
        email,
        full_name: fullName,
        role: 'admin'
      }
    });
  } catch (err) {
    await rollbackTransaction();

    res.status(500).json({
      message: 'Gagal mendaftarkan warung',
      error: err.message
    });
  }
};

const login = async (req, res) => {
  try {
    await ensureAuthSchema();

    const identifier = String(req.body.identifier || req.body.username || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!identifier || !password) {
      res.status(400).json({
        message: 'Username/email dan password wajib diisi'
      });
      return;
    }

    const users = await query(
      `
        SELECT
          users.id,
          users.uuid,
          users.store_id,
          users.username,
          users.email,
          users.password,
          users.full_name,
          users.role,
          users.status,
          stores.store_name,
          stores.status AS store_status
        FROM users
        LEFT JOIN stores ON users.store_id = stores.id
        WHERE (users.username = ? OR users.email = ?) AND users.is_deleted = FALSE
        LIMIT 1
      `,
      [identifier, identifier]
    );

    if (users.length === 0) {
      res.status(404).json({
        message: 'Akun belum terdaftar, silakan registrasi dulu'
      });
      return;
    }

    const user = users[0];

    if (user.status !== 'aktif') {
      res.status(403).json({
        message: 'Akun belum aktif atau sedang dinonaktifkan'
      });
      return;
    }

    if (user.store_id && user.store_status !== 'aktif') {
      res.status(403).json({
        message: 'Warung belum aktif atau sedang dinonaktifkan'
      });
      return;
    }

    const storedPassword = String(user.password || '').replace(/^\$2y\$/, '$2a$');
    const passwordMatches = await bcrypt.compare(password, storedPassword);

    if (!passwordMatches) {
      res.status(401).json({
        message: 'Password salah'
      });
      return;
    }

    await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const publicUser = toPublicUser(user);
    const token = jwt.sign(
      {
        userId: user.id,
        storeId: user.store_id,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: publicUser,
      store: {
        id: user.store_id,
        name: user.store_name || 'Warung Kelontong'
      }
    });
  } catch (err) {
    res.status(500).json({
      message: 'Gagal login',
      error: err.message
    });
  }
};

module.exports = {
  register,
  login
};
