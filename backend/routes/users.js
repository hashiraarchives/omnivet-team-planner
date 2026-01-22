const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');

// Get user profile
router.get('/:id', authRoutes.verifyToken, async (req, res) => {
  const { id } = req.params;
  const pool = req.app.locals.pool;

  try {
    const result = await pool.query(
      'SELECT id, name, phone, avatar_data, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user avatar
router.put('/:id/avatar', authRoutes.verifyToken, async (req, res) => {
  const { id } = req.params;
  const { avatar_data } = req.body;
  const pool = req.app.locals.pool;

  // Verify user is updating their own avatar
  if (req.user.userId !== parseInt(id)) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this avatar' });
  }

  if (!avatar_data) {
    return res.status(400).json({ success: false, message: 'Avatar data is required' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET avatar_data = $1 WHERE id = $2 RETURNING id, name, phone, avatar_data',
      [JSON.stringify(avatar_data), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user profile
router.put('/:id', authRoutes.verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const pool = req.app.locals.pool;

  // Verify user is updating their own profile
  if (req.user.userId !== parseInt(id)) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, phone, avatar_data',
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
