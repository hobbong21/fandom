const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable must be set in production');
}

const EFFECTIVE_SECRET = JWT_SECRET || 'fandom-secret-key';
const JWT_EXPIRES_IN = '1h';

function sign(payload) {
  return jwt.sign(payload, EFFECTIVE_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verify(token) {
  return jwt.verify(token, EFFECTIVE_SECRET);
}

module.exports = { sign, verify };
