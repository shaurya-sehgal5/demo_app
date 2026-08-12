const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET all projects
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*, 
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) AS task_count
      FROM projects p
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single project with tasks and recent activity
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const projectRes = await query('SELECT * FROM projects WHERE id = $1', [id]);
    if (projectRes.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const project = projectRes.rows[0];

    const tasksRes = await query('SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC', [id]);
    const activityRes = await query(
      'SELECT * FROM activity WHERE message ILIKE $1 ORDER BY created_at DESC LIMIT 5',
      [`%${project.name}%`]
    );

    res.json({
      ...project,
      tasks: tasksRes.rows,
      recent_activity: activityRes.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create project
router.post('/', async (req, res) => {
  const { name, description, owner, status, progress } = req.body;
  try {
    const result = await query(
      `INSERT INTO projects (name, description, owner, status, progress)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description || '', owner || 'Unassigned', status || 'active', progress || 0]
    );
    const project = result.rows[0];
    // Add activity entry
    await query(
      'INSERT INTO activity (message, type) VALUES ($1, $2)',
      [`${owner || 'User'} created project ${name}`, 'project_created']
    );
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;