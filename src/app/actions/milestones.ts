"use server";

import db from '../../lib/db';
import { Milestone } from '../../types';

export async function getMilestones(): Promise<Milestone[]> {
  try {
    const rows = db.prepare('SELECT * FROM milestones ORDER BY sort_order ASC').all() as any[];
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      subtitle: r.subtitle,
      icon: r.icon,
      status: r.status,
      statusBg: r.statusBg,
      statusText: r.statusText,
      isHighlighted: r.isHighlighted === 1,
      hideStatus: r.hideStatus === 1,
      assignees: JSON.parse(r.assignees)
    }));
  } catch (error) {
    console.error('Failed to get milestones:', error);
    return [];
  }
}

export async function addMilestone(milestone: Milestone): Promise<boolean> {
  try {
    const maxSort = db.prepare('SELECT COALESCE(MAX(sort_order), 0) as maxSort FROM milestones').get() as { maxSort: number };
    const nextSort = maxSort.maxSort + 1;
    
    db.prepare(`
      INSERT INTO milestones (id, title, subtitle, icon, status, statusBg, statusText, isHighlighted, hideStatus, assignees, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      milestone.id,
      milestone.title,
      milestone.subtitle,
      milestone.icon,
      milestone.status,
      milestone.statusBg,
      milestone.statusText,
      milestone.isHighlighted ? 1 : 0,
      milestone.hideStatus ? 1 : 0,
      JSON.stringify(milestone.assignees),
      nextSort
    );
    return true;
  } catch (error) {
    console.error('Failed to add milestone:', error);
    return false;
  }
}

export async function updateMilestone(milestone: Milestone): Promise<boolean> {
  try {
    db.prepare(`
      UPDATE milestones 
      SET title = ?, subtitle = ?, icon = ?, status = ?, statusBg = ?, statusText = ?, isHighlighted = ?, hideStatus = ?, assignees = ?
      WHERE id = ?
    `).run(
      milestone.title,
      milestone.subtitle,
      milestone.icon,
      milestone.status,
      milestone.statusBg,
      milestone.statusText,
      milestone.isHighlighted ? 1 : 0,
      milestone.hideStatus ? 1 : 0,
      JSON.stringify(milestone.assignees),
      milestone.id
    );
    return true;
  } catch (error) {
    console.error('Failed to update milestone:', error);
    return false;
  }
}

export async function deleteMilestone(id: string): Promise<boolean> {
  try {
    db.prepare('DELETE FROM milestones WHERE id = ?').run(id);
    return true;
  } catch (error) {
    console.error('Failed to delete milestone:', error);
    return false;
  }
}

export async function reorderMilestones(orderedIds: string[]): Promise<boolean> {
  try {
    const updateStmt = db.prepare('UPDATE milestones SET sort_order = ? WHERE id = ?');
    const transaction = db.transaction((ids: string[]) => {
      ids.forEach((id, index) => {
        updateStmt.run(index + 1, id);
      });
    });
    transaction(orderedIds);
    return true;
  } catch (error) {
    console.error('Failed to reorder milestones:', error);
    return false;
  }
}

export async function resetMilestones(initialMilestones: Milestone[]): Promise<boolean> {
  try {
    const deleteStmt = db.prepare('DELETE FROM milestones');
    const insertStmt = db.prepare(`
      INSERT INTO milestones (id, title, subtitle, icon, status, statusBg, statusText, isHighlighted, hideStatus, assignees, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const transaction = db.transaction((milestonesList: Milestone[]) => {
      deleteStmt.run();
      milestonesList.forEach((m, index) => {
        insertStmt.run(
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
          index + 1
        );
      });
    });
    
    transaction(initialMilestones);
    return true;
  } catch (error) {
    console.error('Failed to reset milestones:', error);
    return false;
  }
}
