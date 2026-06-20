import Database from 'better-sqlite3';
import path from 'path';
import { INITIAL_MILESTONES } from '../initialData';

const dbPath = path.resolve(process.cwd(), 'project.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS developers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    utilization INTEGER DEFAULT 0,
    color TEXT DEFAULT '#2580eb',
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    icon TEXT NOT NULL,
    status TEXT NOT NULL,
    statusBg TEXT NOT NULL,
    statusText TEXT NOT NULL,
    isHighlighted INTEGER DEFAULT 0,
    hideStatus INTEGER DEFAULT 0,
    assignees TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS jira_tickets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    assignee_id TEXT,
    date TEXT NOT NULL,
    remark TEXT DEFAULT '',
    timelog REAL DEFAULT 0.0,
    FOREIGN KEY(assignee_id) REFERENCES developers(id) ON DELETE SET NULL
  );
`);

// Seed initial developers if empty
const countDevs = db.prepare('SELECT COUNT(*) as count FROM developers').get() as { count: number };
if (countDevs.count === 0) {
  const insert = db.prepare('INSERT INTO developers (id, name, role, utilization, color, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
  insert.run('tm-1', 'Ronak', 'Specialist', 90, '#2580eb', 1);
  insert.run('tm-2', 'Shivam', 'Associate', 85, '#e28a2a', 2);
  insert.run('tm-3', 'Saurav', 'Associate', 85, '#db3e3e', 3);
  insert.run('tm-4', 'Shashvat', 'Associate', 75, '#4f46e5', 4);
}

// Seed initial milestones if empty
const countMilestones = db.prepare('SELECT COUNT(*) as count FROM milestones').get() as { count: number };
if (countMilestones.count === 0) {
  const insert = db.prepare('INSERT INTO milestones (id, title, subtitle, icon, status, statusBg, statusText, isHighlighted, hideStatus, assignees, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  INITIAL_MILESTONES.forEach((m, idx) => {
    insert.run(
      m.id,
      m.title,
      m.subtitle,
      m.icon,
      m.status,
      m.statusBg,
      m.statusText,
      m.isHighlighted ? 1 : 0,
      m.hideStatus ? 1 : 0,
      JSON.stringify(m.assignees),
      idx + 1
    );
  });
}

// Seed initial tickets if empty
const countTickets = db.prepare('SELECT COUNT(*) as count FROM jira_tickets').get() as { count: number };
if (countTickets.count === 0) {
  const insert = db.prepare('INSERT INTO jira_tickets (id, title, status, assignee_id, date, remark, timelog) VALUES (?, ?, ?, ?, ?, ?, ?)');
  // Get current date string YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  insert.run('JIRA-101', 'Implement new login flows', 'In Progress', 'tm-1', today, 'Auth tokens are integrated', 4.5);
  insert.run('JIRA-102', 'Profile page redesign', 'To Do', 'tm-2', today, 'Awaiting UI asset designs', 0);
  insert.run('JIRA-103', 'Database backup cron setup', 'Done', 'tm-3', today, 'Completed backup testing successfully', 3.0);
  insert.run('JIRA-104', 'Fix memory leaks in render pipeline', 'In Progress', 'tm-4', today, 'Profiling memory footprint', 6.0);
}

export default db;
