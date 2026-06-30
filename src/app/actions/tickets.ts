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

    // Audit log
    db.prepare(`
      INSERT INTO jira_ticket_history (ticket_id, field, old_value, new_value)
      VALUES (?, 'created', NULL, ?)
    `).run(ticket.id, ticket.title);

    return true;
  } catch (error) {
    console.error('Failed to add ticket:', error);
    return false;
  }
}

export async function updateTicket(ticket: JiraTicket): Promise<boolean> {
  try {
    // 1. Get old ticket to compare
    const oldRow = db.prepare('SELECT * FROM jira_tickets WHERE id = ?').get(ticket.id) as any;
    if (oldRow) {
      const oldTicket: JiraTicket = {
        id: oldRow.id,
        title: oldRow.title,
        status: oldRow.status,
        assignee_id: oldRow.assignee_id,
        date: oldRow.date,
        remark: oldRow.remark || '',
        timelog: Number(oldRow.timelog) || 0
      };

      const fieldsToCompare: (keyof JiraTicket)[] = ['title', 'status', 'assignee_id', 'date', 'remark', 'timelog'];
      for (const field of fieldsToCompare) {
        if (oldTicket[field] !== ticket[field]) {
          db.prepare(`
            INSERT INTO jira_ticket_history (ticket_id, field, old_value, new_value)
            VALUES (?, ?, ?, ?)
          `).run(
            ticket.id,
            field,
            oldTicket[field] === null ? 'Unassigned' : String(oldTicket[field]),
            ticket[field] === null ? 'Unassigned' : String(ticket[field])
          );
        }
      }
    }

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
    const oldRow = db.prepare('SELECT title FROM jira_tickets WHERE id = ?').get(id) as any;
    const title = oldRow ? oldRow.title : 'Unknown';

    db.prepare('DELETE FROM jira_tickets WHERE id = ?').run(id);

    // Audit log
    db.prepare(`
      INSERT INTO jira_ticket_history (ticket_id, field, old_value, new_value)
      VALUES (?, 'deleted', ?, NULL)
    `).run(id, title);

    return true;
  } catch (error) {
    console.error('Failed to delete ticket:', error);
    return false;
  }
}

export interface TicketHistoryEntry {
  id: number;
  ticket_id: string;
  field: string;
  old_value: string | null;
  new_value: string | null;
  timestamp: string;
  old_assignee?: string;
  new_assignee?: string;
}

export async function getTicketHistory(): Promise<TicketHistoryEntry[]> {
  try {
    const rows = db.prepare(`
      SELECT 
        h.*, 
        d_old.name AS old_assignee, 
        d_new.name AS new_assignee 
      FROM jira_ticket_history h 
      LEFT JOIN developers d_old ON h.field = 'assignee_id' AND h.old_value = d_old.id 
      LEFT JOIN developers d_new ON h.field = 'assignee_id' AND h.new_value = d_new.id
      ORDER BY h.timestamp DESC
    `).all() as any[];
    
    return rows.map(r => ({
      id: r.id,
      ticket_id: r.ticket_id,
      field: r.field,
      old_value: r.old_value,
      new_value: r.new_value,
      timestamp: r.timestamp,
      old_assignee: r.old_assignee || undefined,
      new_assignee: r.new_assignee || undefined
    }));
  } catch (error) {
    console.error('Failed to get ticket history:', error);
    return [];
  }
}
