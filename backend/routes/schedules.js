const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');

// Get schedules for a month
router.get('/', authRoutes.verifyToken, async (req, res) => {
  const { month, year } = req.query;
  const pool = req.app.locals.pool;

  if (!month || !year) {
    return res.status(400).json({ success: false, message: 'Month and year are required' });
  }

  try {
    const result = await pool.query(`
      SELECT
        s.id, s.date, s.start_time, s.end_time, s.description, s.user_id,
        u.name, u.avatar_data
      FROM schedules s
      JOIN users u ON s.user_id = u.id
      WHERE EXTRACT(MONTH FROM s.date) = $1 AND EXTRACT(YEAR FROM s.date) = $2
      ORDER BY s.date, s.start_time
    `, [month, year]);

    res.json({ success: true, schedules: result.rows });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get schedules for a specific date
router.get('/date/:date', authRoutes.verifyToken, async (req, res) => {
  const { date } = req.params;
  const pool = req.app.locals.pool;

  try {
    const result = await pool.query(`
      SELECT
        s.id, s.date, s.start_time, s.end_time, s.description, s.user_id,
        u.name, u.avatar_data
      FROM schedules s
      JOIN users u ON s.user_id = u.id
      WHERE s.date = $1
      ORDER BY s.start_time
    `, [date]);

    res.json({ success: true, schedules: result.rows });
  } catch (error) {
    console.error('Get schedules for date error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new schedule
router.post('/', authRoutes.verifyToken, async (req, res) => {
  const { date, start_time, end_time, description } = req.body;
  const userId = req.user.userId;
  const pool = req.app.locals.pool;

  if (!date || !start_time || !end_time) {
    return res.status(400).json({ success: false, message: 'Date, start time, and end time are required' });
  }

  // Validate end time is after start time
  if (start_time >= end_time) {
    return res.status(400).json({ success: false, message: 'End time must be after start time' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO schedules (user_id, date, start_time, end_time, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [userId, date, start_time, end_time, description || '']);

    // Get the schedule with user info
    const scheduleWithUser = await pool.query(`
      SELECT
        s.id, s.date, s.start_time, s.end_time, s.description, s.user_id,
        u.name, u.avatar_data
      FROM schedules s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `, [result.rows[0].id]);

    res.json({ success: true, schedule: scheduleWithUser.rows[0] });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update schedule
router.put('/:id', authRoutes.verifyToken, async (req, res) => {
  const { id } = req.params;
  const { date, start_time, end_time, description } = req.body;
  const userId = req.user.userId;
  const pool = req.app.locals.pool;

  try {
    // Check if schedule belongs to user
    const existing = await pool.query('SELECT user_id FROM schedules WHERE id = $1', [id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    if (existing.rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this schedule' });
    }

    // Validate end time is after start time
    if (start_time && end_time && start_time >= end_time) {
      return res.status(400).json({ success: false, message: 'End time must be after start time' });
    }

    const result = await pool.query(`
      UPDATE schedules
      SET date = COALESCE($1, date),
          start_time = COALESCE($2, start_time),
          end_time = COALESCE($3, end_time),
          description = COALESCE($4, description)
      WHERE id = $5
      RETURNING *
    `, [date, start_time, end_time, description, id]);

    // Get the schedule with user info
    const scheduleWithUser = await pool.query(`
      SELECT
        s.id, s.date, s.start_time, s.end_time, s.description, s.user_id,
        u.name, u.avatar_data
      FROM schedules s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `, [id]);

    res.json({ success: true, schedule: scheduleWithUser.rows[0] });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete schedule
router.delete('/:id', authRoutes.verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const pool = req.app.locals.pool;

  try {
    // Check if schedule belongs to user
    const existing = await pool.query('SELECT user_id FROM schedules WHERE id = $1', [id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    if (existing.rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this schedule' });
    }

    await pool.query('DELETE FROM schedules WHERE id = $1', [id]);

    res.json({ success: true, message: 'Schedule deleted' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
