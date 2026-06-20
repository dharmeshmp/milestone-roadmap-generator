import Database from 'better-sqlite3';
import path from 'path';

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

  CREATE TABLE IF NOT EXISTS jira_tickets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    assignee_id TEXT,
    FOREIGN KEY(assignee_id) REFERENCES developers(id) ON DELETE SET NULL
  );
`);

// Seed initial developers if empty
const count = db.prepare('SELECT COUNT(*) as count FROM developers').get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare('INSERT INTO developers (id, name, role, utilization, sort_order) VALUES (?, ?, ?, ?, ?)');
  insert.run('tm-1', 'Ronak', 'Specialist', 90, 1);
  insert.run('tm-2', 'Shivam', 'Associate', 85, 2);
  insert.run('tm-3', 'Saurav', 'Associate', 85, 3);
  insert.run('tm-4', 'Shashvat', 'Associate', 75, 4);
}

export default db;
