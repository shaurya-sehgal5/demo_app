const { query } = require('./db');

async function createTables() {
    await query(`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      owner VARCHAR(100),
      status VARCHAR(50) DEFAULT 'active',
      progress INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
    await query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'todo',
      priority VARCHAR(50) DEFAULT 'medium',
      assignee VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
    await query(`
    CREATE TABLE IF NOT EXISTS activity (
      id SERIAL PRIMARY KEY,
      message TEXT NOT NULL,
      type VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function seedData() {
    // Check if projects table is empty
    const res = await query('SELECT COUNT(*) FROM projects');
    if (parseInt(res.rows[0].count) > 0) return;

    // Insert projects
    const projects = [
        ['Website Redesign', 'Complete overhaul of corporate website', 'Alex Morgan', 'active', 82],
        ['Mobile App Launch', 'Native mobile app for iOS and Android', 'Sarah Chen', 'active', 64],
        ['Analytics Platform', 'Real-time analytics dashboard', 'Mike Johnson', 'active', 45],
        ['Internal Tools', 'Developer productivity suite', 'John Doe', 'active', 91],
        ['Customer Portal', 'Self-service support portal', 'Emma Wilson', 'active', 30],
        ['Marketing Automation', 'Email and campaign automation', 'Alex Morgan', 'active', 55],
    ];
    for (const [name, desc, owner, status, progress] of projects) {
        await query(
            'INSERT INTO projects (name, description, owner, status, progress) VALUES ($1, $2, $3, $4, $5)',
            [name, desc, owner, status, progress]
        );
    }

    // Get project ids
    const projRes = await query('SELECT id, name FROM projects');
    const projectMap = {};
    projRes.rows.forEach(row => { projectMap[row.name] = row.id; });

    // Insert tasks
    const tasks = [
        [projectMap['Website Redesign'], 'Redesign landing page', 'Create new hero section and CTA', 'done', 'high', 'Alex Morgan'],
        [projectMap['Website Redesign'], 'Optimize image assets', 'Compress and lazy-load images', 'in_progress', 'medium', 'Sarah Chen'],
        [projectMap['Mobile App Launch'], 'Implement API integration', 'Connect to backend endpoints', 'in_progress', 'high', 'Mike Johnson'],
        [projectMap['Analytics Platform'], 'Create analytics dashboard', 'Build charts and metrics', 'todo', 'medium', 'Emma Wilson'],
        [projectMap['Internal Tools'], 'Fix onboarding flow', 'Resolve user signup issues', 'done', 'low', 'John Doe'],
        [projectMap['Customer Portal'], 'Prepare production release', 'Finalize deployment checklist', 'todo', 'high', 'Mike Johnson'],
        [projectMap['Website Redesign'], 'Write deployment documentation', 'Document release process', 'done', 'low', 'Emma Wilson'],
        [projectMap['Mobile App Launch'], 'Improve database queries', 'Optimize slow endpoints', 'in_progress', 'medium', 'Alex Morgan'],
        [projectMap['Analytics Platform'], 'Design data visualization', 'Choose charting library', 'todo', 'medium', 'Sarah Chen'],
        [projectMap['Internal Tools'], 'Add user permissions', 'Implement role-based access', 'todo', 'high', 'John Doe'],
        [projectMap['Marketing Automation'], 'Build email template engine', 'Dynamic templates for campaigns', 'in_progress', 'high', 'Emma Wilson'],
        [projectMap['Marketing Automation'], 'Integrate with CRM', 'Sync contacts and segments', 'todo', 'medium', 'Mike Johnson'],
    ];
    for (const [projId, title, desc, status, priority, assignee] of tasks) {
        await query(
            'INSERT INTO tasks (project_id, title, description, status, priority, assignee) VALUES ($1, $2, $3, $4, $5, $6)',
            [projId, title, desc, status, priority, assignee]
        );
    }

    // Insert activity
    const activities = [
        ['Alex Morgan created project Website Redesign', 'project_created'],
        ['Sarah Chen completed task Optimize image assets', 'task_completed'],
        ['Mike Johnson moved task API integration to In Progress', 'task_status_changed'],
        ['John Doe created project Internal Tools', 'project_created'],
        ['Emma Wilson completed task deployment documentation', 'task_completed'],
        ['Alex Morgan created project Marketing Automation', 'project_created'],
        ['Sarah Chen updated project Website Redesign progress to 82%', 'project_updated'],
        ['Mike Johnson created task Implement API integration', 'task_created'],
        ['Emma Wilson moved task Prepare production release to In Progress', 'task_status_changed'],
        ['John Doe completed task Fix onboarding flow', 'task_completed'],
    ];
    for (const [message, type] of activities) {
        await query(
            'INSERT INTO activity (message, type) VALUES ($1, $2)',
            [message, type]
        );
    }
}

module.exports = { createTables, seedData };