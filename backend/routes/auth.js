const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const protect = require('../middleware/auth');

const router = express.Router();
const sign = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const [exists] = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (exists.length) return res.status(409).json({ message: 'An account with this email already exists' });

    const hash = await bcrypt.hash(password, 10);
    const [r] = await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [
      name.trim(), email.toLowerCase(), hash,
    ]);
    res.status(201).json({ token: sign(r.insertId), user: { id: r.insertId, name: name.trim(), email: email.toLowerCase() } });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Incorrect email or password' });
    res.json({ token: sign(user.id), user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) { next(e); }
});

router.get('/me', protect, async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT id, name, email FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.json({ user: rows[0] });
  } catch (e) { next(e); }
});

module.exports = router;
