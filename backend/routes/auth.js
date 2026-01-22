const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const MASTER_PASSWORD = 'OmniVet0995';
const JWT_SECRET = process.env.JWT_SECRET || 'omnivet-secret-key-2024';

// Verify master password (case-insensitive)
router.post('/verify-master', (req, res) => {
  const { password } = req.body;

  if (password && password.toLowerCase() === MASTER_PASSWORD.toLowerCase()) {
    const token = jwt.sign({ type: 'master' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid master password' });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  const { name, phone, password } = req.body;
  const pool = req.app.locals.pool;

  if (!name || !phone || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    // Check if phone already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with default avatar
    const defaultAvatar = {
      faceShape: 'round',
      skinTone: '#F5D0C5',
      hairStyle: 'short',
      hairColor: '#3D2314',
      eyes: 'round',
      eyebrows: 'thick',
      mouth: 'smile',
      accessory: 'none'
    };

    const result = await pool.query(
      'INSERT INTO users (name, phone, password, plain_password, avatar_data) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, phone, avatar_data',
      [name, phone, hashedPassword, password, JSON.stringify(defaultAvatar)]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        avatar_data: user.avatar_data
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  const pool = req.app.locals.pool;

  if (!phone || !password) {
    return res.status(400).json({ success: false, message: 'Phone and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        avatar_data: user.avatar_data
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// Verify token middleware (export for use in other routes)
router.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = router;
