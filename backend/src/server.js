const express = require('express');
const cors = require('cors');

const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();
app.use(cors());
app.use(express.json());

const VALID_STATUSES = ['todo', 'in-progress', 'done'];

let nextProjectId = 4;
let nextTaskId = 7;

let projects = [
  { id: 1, name: 'Website Revamp', description: 'Redesign the marketing site and improve page load performance.' },
  { id: 2, name: 'Mobile App Launch', description: 'Prepare the mobile application for public release.' },
  { id: 3, name: 'Internal Tooling', description: 'Build internal dashboards for the ops team.' },
];

let tasks = [
  { id: 1, project_id: 1, title: 'Design new homepage layout', status: 'done' },
  { id: 2, project_id: 1, title: 'Optimize image assets', status: 'in-progress' },
  { id: 3, project_id: 2, title: 'Finalize app store listing', status: 'todo' },
  { id: 4, project_id: 2, title: 'Fix onboarding flow bug', status: 'in-progress' },
  { id: 5, project_id: 3, title: 'Set up deployment pipeline', status: 'done' },
  { id: 6, project_id: 3, title: 'Build usage analytics dashboard', status: 'todo' },
];

function withProjectName(task) {
  const project = projects.find((p) => p.id === task.project_id);
  return { ...task, project_name: project ? project.name : null };
}

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', database: 'connected' });
});

app.get('/api/projects', (req, res) => {
  res.json(projects);
});

app.get('/api/tasks', (req, res) => {
  res.json(tasks.map(withProjectName));
});

app.get('/api/stats', (req, res) => {
  res.json({
    totalProjects: projects.length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === 'done').length,
    inProgressTasks: tasks.filter((t) => t.status === 'in-progress').length,
  });
});

app.post('/api/tasks', (req, res) => {
  const { title, project_id, status } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const taskStatus = status && VALID_STATUSES.includes(status) ? status : 'todo';

  let projectId = null;
  if (project_id !== undefined && project_id !== null && project_id !== '') {
    const parsedId = parseInt(project_id, 10);
    if (Number.isNaN(parsedId) || !projects.some((p) => p.id === parsedId)) {
      return res.status(400).json({ error: 'project_id does not reference an existing project' });
    }
    projectId = parsedId;
  }

  const task = {
    id: nextTaskId++,
    project_id: projectId,
    title: title.trim(),
    status: taskStatus,
  };

  tasks.push(task);
  res.status(201).json(withProjectName(task));
});

app.patch('/api/tasks/:id', (req, res) => {
  const parsedId = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (Number.isNaN(parsedId)) {
    return res.status(400).json({ error: 'Task id must be a valid number' });
  }

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const task = tasks.find((t) => t.id === parsedId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  task.status = status;
  res.json(withProjectName(task));
});

app.post('/api/projects', (req, res) => {
  const { name, description } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const project = {
    id: nextProjectId++,
    name: name.trim(),
    description: typeof description === 'string' ? description.trim() : '',
  };

  projects.push(project);
  res.status(201).json(project);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, HOST, () => {
  console.log(`PulseBoard backend listening on http://${HOST}:${PORT}`);
});
