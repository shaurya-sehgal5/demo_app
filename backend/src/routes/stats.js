const express = require('express');
const router = express.Router();
const { query } = require('../db');

router.get('/', async (req, res) => {
  try {
    // Total projects
    const projRes = await query('SELECT COUNT(*) FROM projects');
    const totalProjects = parseInt(projRes.rows[0].count);

    // Active tasks (status != 'done')
    const activeRes = await query("SELECT COUNT(*) FROM tasks WHERE status != 'done'");
    const activeTasks = parseInt(activeRes.rows[0].count);

    // Completed tasks (status = 'done')
    const doneRes = await query("SELECT COUNT(*) FROM tasks WHERE status = 'done'");
    const completedTasks = parseInt(doneRes.rows[0].count);

    // Team members: distinct assignees from tasks + owners from projects
    const membersRes = await query(`
      WITH all_members AS (
        SELECT assignee AS name FROM tasks WHERE assignee IS NOT NULL
        UNION
        SELECT owner AS name FROM projects WHERE owner IS NOT NULL
      )
      SELECT COUNT(DISTINCT name) FROM all_members
    `);
    const teamMembers = parseInt(membersRes.rows[0].count);

    res.json({
      totalProjects,
      activeTasks,
      completedTasks,
      teamMembers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;