const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const ADMIN_PASSWORD = 'OmniVet0995!';
const JWT_SECRET = process.env.JWT_SECRET || 'omnivet-secret-key-2024';

// Verify admin password (case-insensitive)
router.post('/verify', (req, res) => {
  const { password } = req.body;

  if (password && password.toLowerCase() === ADMIN_PASSWORD.toLowerCase()) {
    const token = jwt.sign({ type: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid admin password' });
  }
});

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Get all users (admin only)
router.get('/users', verifyAdmin, async (req, res) => {
  const pool = req.app.locals.pool;

  try {
    const result = await pool.query(`
      SELECT id, name, phone, password, avatar_data, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const pool = req.app.locals.pool;

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all schedules (admin only)
router.get('/schedules', verifyAdmin, async (req, res) => {
  const pool = req.app.locals.pool;

  try {
    const result = await pool.query(`
      SELECT
        s.id, s.date, s.start_time, s.end_time, s.description, s.user_id, s.created_at,
        u.name, u.avatar_data
      FROM schedules s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.date DESC, s.start_time
    `);

    res.json({ success: true, schedules: result.rows });
  } catch (error) {
    console.error('Get all schedules error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete schedule (admin only)
router.delete('/schedules/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const pool = req.app.locals.pool;

  try {
    const result = await pool.query('DELETE FROM schedules WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    res.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
