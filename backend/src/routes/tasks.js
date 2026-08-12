const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET all tasks with project name
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT t.*, p.name AS project_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create task (optional, not used in UI)
router.post('/', async (req, res) => {
  const { project_id, title, description, status, priority, assignee } = req.body;
  try {
    const result = await query(
      `INSERT INTO tasks (project_id, title, description, status, priority, assignee)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [project_id, title, description, status, priority, assignee]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update task status
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, assignee } = req.body;
  try {
    // Fetch current task to get project name for activity
    const taskRes = await query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (taskRes.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const task = taskRes.rows[0];
    const oldStatus = task.status;
    const updates = [];
    const values = [];
    let idx = 1;

    if (status !== undefined) {
      updates.push(`status = $${idx++}`);
      values.push(status);
    }
    if (assignee !== undefined) {
      updates.push(`assignee = $${idx++}`);
      values.push(assignee);
    }
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const queryStr = `
      UPDATE tasks
      SET ${updates.join(', ')}
      WHERE id = $${values.length}
      RETURNING *
    `;
    const result = await query(queryStr, values);
    const updatedTask = result.rows[0];

    // Add activity if status changed
    if (status && status !== oldStatus) {
      const projectRes = await query('SELECT name FROM projects WHERE id = $1', [task.project_id]);
      const projectName = projectRes.rows[0]?.name || 'Unknown project';
      const message = `${updatedTask.assignee || 'User'} moved task "${task.title}" from ${oldStatus} to ${status} in ${projectName}`;
      await query(
        'INSERT INTO activity (message, type) VALUES ($1, $2)',
        [message, 'task_status_changed']
      );
    }

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;