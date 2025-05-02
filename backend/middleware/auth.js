// authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  // Grab the full header
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  // Bearer token parsing (or accept raw token too)
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)               // remove "Bearer "
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.token);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error('JWT error:', err.message);
    res.status(401).json({ error: 'Token is invalid. Please log in.' });
  }
};

module.exports = authMiddleware;
