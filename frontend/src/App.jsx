import React, { useEffect, useState, useCallback } from 'react';

const STATUS_LABELS = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
};

const STATUS_ORDER = ['todo', 'in-progress', 'done'];

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export default function App() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskProject, setNewTaskProject] = useState('');
  const [creating, setCreating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [statsRes, projectsRes, tasksRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/projects'),
        fetch('/api/tasks'),
      ]);

      if (!statsRes.ok || !projectsRes.ok || !tasksRes.ok) {
        throw new Error('One or more requests failed');
      }

      const [statsData, projectsData, tasksData] = await Promise.all([
        statsRes.json(),
        projectsRes.json(),
        tasksRes.json(),
      ]);

      setStats(statsData);
      setProjects(projectsData);
      setTasks(tasksData);
    } catch (err) {
      console.error(err);
      setError('Could not load data from the backend. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCreateTask(e) {
    e.preventDefault();

    if (!newTaskTitle.trim()) return;

    setCreating(true);
    setError('');

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          project_id: newTaskProject || null,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create task');
      }

      setNewTaskTitle('');
      setNewTaskProject('');
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Could not create the task. Please try again.');
    } finally {
      setCreating(false);
    }
  }

  async function handleStatusChange(taskId, newStatus) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update task');
      }

      await loadData();
    } catch (err) {
      console.error(err);
      setError('Could not update the task status. Please try again.');
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>PulseBoard</h1>
        <p className="subtitle">Project &amp; task tracking dashboard</p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">Loading dashboard...</div>
      ) : (
        <>
          <section className="stats-grid">
            <StatCard label="Total Projects" value={stats?.totalProjects ?? 0} />
            <StatCard label="Total Tasks" value={stats?.totalTasks ?? 0} />
            <StatCard label="Completed" value={stats?.completedTasks ?? 0} />
            <StatCard label="In Progress" value={stats?.inProgressTasks ?? 0} />
          </section>

          <section className="content-grid">
            <div className="panel">
              <h2>Projects</h2>
              <ul className="project-list">
                {projects.map((project) => (
                  <li key={project.id} className="project-item">
                    <div className="project-name">{project.name}</div>
                    {project.description && (
                      <div className="project-description">{project.description}</div>
                    )}
                  </li>
                ))}
                {projects.length === 0 && (
                  <li className="empty-state">No projects yet.</li>
                )}
              </ul>
            </div>

            <div className="panel">
              <h2>Tasks</h2>

              <form className="new-task-form" onSubmit={handleCreateTask}>
                <input
                  type="text"
                  placeholder="New task title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  disabled={creating}
                />
                <select
                  value={newTaskProject}
                  onChange={(e) => setNewTaskProject(e.target.value)}
                  disabled={creating}
                >
                  <option value="">No project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <button type="submit" disabled={creating || !newTaskTitle.trim()}>
                  {creating ? 'Adding...' : 'Add Task'}
                </button>
              </form>

              <ul className="task-list">
                {tasks.map((task) => (
                  <li key={task.id} className="task-item">
                    <div className="task-main">
                      <span className="task-title">{task.title}</span>
                      {task.project_name && (
                        <span className="task-project">{task.project_name}</span>
                      )}
                    </div>
                    <div className="task-actions">
                      <StatusBadge status={task.status} />
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      >
                        {STATUS_ORDER.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </li>
                ))}
                {tasks.length === 0 && (
                  <li className="empty-state">No tasks yet.</li>
                )}
              </ul>
            </div>
          </section>
        </>
      )}

      <footer className="app-footer">
        <span>PulseBoard demo application &mdash; deployed with VeloCore</span>
      </footer>
    </div>
  );
}
