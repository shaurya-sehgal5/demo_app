const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET all activity (chronological)
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM activity ORDER BY created_at DESC LIMIT 50');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;