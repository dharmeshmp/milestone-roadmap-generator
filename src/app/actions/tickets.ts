"use server";

import db from '../../lib/db';
import { JiraTicket } from '../../types';

export async function getTickets(): Promise<JiraTicket[]> {
  try {
    const rows = db.prepare('SELECT * FROM jira_tickets').all() as any[];
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      status: r.status as 'To Do' | 'In Progress' | 'Reassigned' | 'Done',
      assignee_id: r.assignee_id,
      date: r.date,
      remark: r.remark || '',
      timelog: Number(r.timelog) || 0
    }));
  } catch (error) {
    console.error('Failed to get tickets:', error);
    return [];
  }
}

export async function addTicket(ticket: JiraTicket): Promise<boolean> {
  try {
    db.prepare(`
      INSERT INTO jira_tickets (id, title, status, assignee_id, date, remark, timelog)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      ticket.id,
      ticket.title,
      ticket.status,
      ticket.assignee_id,
      ticket.date,
      ticket.remark,
      ticket.timelog
    );
    return true;
  } catch (error) {
    console.error('Failed to add ticket:', error);
    return false;
  }
}

export async function updateTicket(ticket: JiraTicket): Promise<boolean> {
  try {
    db.prepare(`
      UPDATE jira_tickets 
      SET title = ?, status = ?, assignee_id = ?, date = ?, remark = ?, timelog = ?
      WHERE id = ?
    `).run(
      ticket.title,
      ticket.status,
      ticket.assignee_id,
      ticket.date,
      ticket.remark,
      ticket.timelog,
      ticket.id
    );
    return true;
  } catch (error) {
    console.error('Failed to update ticket:', error);
    return false;
  }
}

export async function deleteTicket(id: string): Promise<boolean> {
  try {
    db.prepare('DELETE FROM jira_tickets WHERE id = ?').run(id);
    return true;
  } catch (error) {
    console.error('Failed to delete ticket:', error);
    return false;
  }
}
