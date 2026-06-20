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
    FOREIGN KEY(assignee_id) REFERENCES developers(id) ON DELETE SET NULL
  );
`);

// Seed initial developers if empty
const countDevs = db.prepare('SELECT COUNT(*) as count FROM developers').get() as { count: number };
if (countDevs.count === 0) {
  const insert = db.prepare('INSERT INTO developers (id, name, role, utilization, sort_order) VALUES (?, ?, ?, ?, ?)');
  insert.run('tm-1', 'Ronak', 'Specialist', 90, 1);
  insert.run('tm-2', 'Shivam', 'Associate', 85, 2);
  insert.run('tm-3', 'Saurav', 'Associate', 85, 3);
  insert.run('tm-4', 'Shashvat', 'Associate', 75, 4);
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

export default db;
