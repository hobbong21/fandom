const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const User = require('../models/user');
const { sign } = require('../utils/jwt');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const SALT_ROUNDS = 10;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

router.post('/register', authLimiter, async (req, res) => {
  const { username, password } = req.body;
  const trimmedUsername = typeof username === 'string' ? username.trim() : '';

  if (!trimmedUsername || trimmedUsername.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  if (User.findByUsername(trimmedUsername)) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  User.create(trimmedUsername, hashedPassword);

  return res.status(201).json({ message: 'User registered successfully' });
});

router.post('/login', authLimiter, async (req, res) => {
  const { username, password } = req.body;
  const trimmedUsername = typeof username === 'string' ? username.trim() : '';

  if (!trimmedUsername || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = User.findByUsername(trimmedUsername);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = sign({ username: user.username });
  return res.json({ token });
});

router.get('/me', apiLimiter, authenticate, (req, res) => {
  return res.json({ username: req.user.username });
});

module.exports = router;
