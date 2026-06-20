"use server";

import db from '../../lib/db';
import { TeamMember, Milestone, JiraTicket } from '../../types';

export async function importFullData(data: {
  developers?: TeamMember[];
  milestones?: Milestone[];
  tickets?: JiraTicket[];
}): Promise<boolean> {
  try {
    const runTransaction = db.transaction(() => {
      // Clear tables
      db.prepare('DELETE FROM developers').run();
      db.prepare('DELETE FROM milestones').run();
      db.prepare('DELETE FROM jira_tickets').run();

      // Insert developers
      if (data.developers) {
        const insertDev = db.prepare('INSERT INTO developers (id, name, role, utilization, color, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
        data.developers.forEach((d, idx) => {
          insertDev.run(d.id, d.name, d.role, d.utilization, d.color, idx + 1);
        });
      }

      // Insert milestones
      if (data.milestones) {
        const insertMilestone = db.prepare('INSERT INTO milestones (id, title, subtitle, icon, status, statusBg, statusText, isHighlighted, hideStatus, assignees, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        data.milestones.forEach((m, idx) => {
          insertMilestone.run(
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

      // Insert tickets
      if (data.tickets) {
        const insertTicket = db.prepare('INSERT INTO jira_tickets (id, title, status, assignee_id, date, remark, timelog) VALUES (?, ?, ?, ?, ?, ?, ?)');
        data.tickets.forEach((t) => {
          insertTicket.run(
            t.id,
            t.title,
            t.status,
            t.assignee_id,
            t.date,
            t.remark,
            t.timelog
          );
        });
      }
    });

    runTransaction();
    return true;
  } catch (error) {
    console.error('Failed to import full data:', error);
    return false;
  }
}
