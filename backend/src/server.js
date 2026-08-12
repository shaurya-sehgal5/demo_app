require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const PORT = 8080;
const HOST = '0.0.0.0';

if (!process.env.DATABASE_URL) {
  console.error('FATAL ERROR: DATABASE_URL environment variable is not set.');
  console.error('PulseBoard backend requires a PostgreSQL connection string via DATABASE_URL.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const app = express();

app.use(cors());
app.use(express.json());

const VALID_STATUSES = ['todo', 'in-progress', 'done'];

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'todo',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM projects;');

  if (rows[0].count === 0) {
    console.log('No existing data found. Seeding database with sample records...');

    const projectInsert = await pool.query(
      `INSERT INTO projects (name, description) VALUES
        ($1, $2),
        ($3, $4),
        ($5, $6)
       RETURNING id;`,
      [
        'Website Revamp', 'Redesign the marketing site and improve page load performance.',
        'Mobile App Launch', 'Prepare the mobile application for public release.',
        'Internal Tooling', 'Build internal dashboards for the ops team.',
      ]
    );

    const [projectOneId, projectTwoId, projectThreeId] = projectInsert.rows.map((r) => r.id);

    await pool.query(
      `INSERT INTO tasks (project_id, title, status) VALUES
        ($1, $2, $3),
        ($4, $5, $6),
        ($7, $8, $9),
        ($10, $11, $12),
        ($13, $14, $15),
        ($16, $17, $18)`,
      [
        projectOneId, 'Design new homepage layout', 'done',
        projectOneId, 'Optimize image assets', 'in-progress',
        projectTwoId, 'Finalize app store listing', 'todo',
        projectTwoId, 'Fix onboarding flow bug', 'in-progress',
        projectThreeId, 'Set up deployment pipeline', 'done',
        projectThreeId, 'Build usage analytics dashboard', 'todo',
      ]
    );

    console.log('Seed data inserted successfully.');
  }
}

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'healthy', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, description, created_at FROM projects ORDER BY id ASC;'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT tasks.id, tasks.title, tasks.status, tasks.project_id,
              tasks.created_at, projects.name AS project_name
       FROM tasks
       LEFT JOIN projects ON tasks.project_id = projects.id
       ORDER BY tasks.id ASC;`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const { rows: projectRows } = await pool.query('SELECT COUNT(*)::int AS count FROM projects;');
    const { rows: taskRows } = await pool.query('SELECT COUNT(*)::int AS count FROM tasks;');
    const { rows: doneRows } = await pool.query(
      "SELECT COUNT(*)::int AS count FROM tasks WHERE status = 'done';"
    );
    const { rows: inProgressRows } = await pool.query(
      "SELECT COUNT(*)::int AS count FROM tasks WHERE status = 'in-progress';"
    );

    res.json({
      totalProjects: projectRows[0].count,
      totalTasks: taskRows[0].count,
      completedTasks: doneRows[0].count,
      inProgressTasks: inProgressRows[0].count,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { title, project_id, status } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const taskStatus = status && VALID_STATUSES.includes(status) ? status : 'todo';

  try {
    let projectId = null;

    if (project_id !== undefined && project_id !== null && project_id !== '') {
      const parsedId = parseInt(project_id, 10);
      if (Number.isNaN(parsedId)) {
        return res.status(400).json({ error: 'project_id must be a valid number' });
      }

      const { rows: projectCheck } = await pool.query(
        'SELECT id FROM projects WHERE id = $1;',
        [parsedId]
      );

      if (projectCheck.length === 0) {
        return res.status(400).json({ error: 'project_id does not reference an existing project' });
      }

      projectId = parsedId;
    }

    const { rows } = await pool.query(
      `INSERT INTO tasks (project_id, title, status)
       VALUES ($1, $2, $3)
       RETURNING id, project_id, title, status, created_at;`,
      [projectId, title.trim(), taskStatus]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.patch('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const parsedId = parseInt(id, 10);
  if (Number.isNaN(parsedId)) {
    return res.status(400).json({ error: 'Task id must be a valid number' });
  }

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `status must be one of: ${VALID_STATUSES.join(', ')}`,
    });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE tasks SET status = $1 WHERE id = $2
       RETURNING id, project_id, title, status, created_at;`,
      [status, parsedId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

async function start() {
  try {
    await initDatabase();
    app.listen(PORT, HOST, () => {
      console.log(`PulseBoard backend listening on http://${HOST}:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
