const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'martpos-dev-secret';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({
      message: 'Token login tidak ditemukan'
    });
    return;
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({
      message: 'Token login tidak valid atau sudah kedaluwarsa'
    });
  }
};

module.exports = authMiddleware;
