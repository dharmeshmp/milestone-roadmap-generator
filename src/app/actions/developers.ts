"use server";

import db from '../../lib/db';
import { TeamMember } from '../../types';

export async function getDevelopers(): Promise<TeamMember[]> {
  try {
    const rows = db.prepare('SELECT id, name, role, utilization FROM developers ORDER BY sort_order ASC').all() as TeamMember[];
    return rows;
  } catch (error) {
    console.error('Failed to get developers:', error);
    return [];
  }
}

export async function addDeveloper(member: TeamMember): Promise<boolean> {
  try {
    const maxSort = db.prepare('SELECT COALESCE(MAX(sort_order), 0) as maxSort FROM developers').get() as { maxSort: number };
    const nextSort = maxSort.maxSort + 1;
    
    db.prepare('INSERT INTO developers (id, name, role, utilization, sort_order) VALUES (?, ?, ?, ?, ?)')
      .run(member.id, member.name, member.role, member.utilization, nextSort);
    return true;
  } catch (error) {
    console.error('Failed to add developer:', error);
    return false;
  }
}

export async function updateDeveloper(member: TeamMember): Promise<boolean> {
  try {
    db.prepare('UPDATE developers SET name = ?, role = ?, utilization = ? WHERE id = ?')
      .run(member.name, member.role, member.utilization, member.id);
    return true;
  } catch (error) {
    console.error('Failed to update developer:', error);
    return false;
  }
}

export async function deleteDeveloper(id: string): Promise<boolean> {
  try {
    db.prepare('DELETE FROM developers WHERE id = ?').run(id);
    return true;
  } catch (error) {
    console.error('Failed to delete developer:', error);
    return false;
  }
}

export async function reorderDevelopers(orderedIds: string[]): Promise<boolean> {
  try {
    const updateStmt = db.prepare('UPDATE developers SET sort_order = ? WHERE id = ?');
    const transaction = db.transaction((ids: string[]) => {
      ids.forEach((id, index) => {
        updateStmt.run(index + 1, id);
      });
    });
    transaction(orderedIds);
    return true;
  } catch (error) {
    console.error('Failed to reorder developers:', error);
    return false;
  }
}

export async function resetDevelopers(initialMembers: TeamMember[]): Promise<boolean> {
  try {
    const deleteStmt = db.prepare('DELETE FROM developers');
    const insertStmt = db.prepare('INSERT INTO developers (id, name, role, utilization, sort_order) VALUES (?, ?, ?, ?, ?)');
    
    const transaction = db.transaction((members: TeamMember[]) => {
      deleteStmt.run();
      members.forEach((m, index) => {
        insertStmt.run(m.id, m.name, m.role, m.utilization, index + 1);
      });
    });
    
    transaction(initialMembers);
    return true;
  } catch (error) {
    console.error('Failed to reset developers:', error);
    return false;
  }
}

