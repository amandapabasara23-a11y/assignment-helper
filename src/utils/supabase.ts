import type { Assignment } from '../types';

/**
 * PRIVACY GUARANTEE:
 * Student privacy is 100% enforced. No student data, assignment text, or personal inputs
 * are sent to any remote database. Everything remains strictly local in the user's browser.
 */

export const isSupabaseConfigured = false;
export const supabase = null;

export async function syncAssignmentToSupabase(_assignment: Assignment): Promise<boolean> {
  // Disabled: Privacy first, zero database saving
  return false;
}

export async function fetchAssignmentsFromSupabase(): Promise<Assignment[] | null> {
  // Disabled: Privacy first, zero database saving
  return null;
}

export async function deleteAssignmentFromSupabase(_id: string): Promise<boolean> {
  // Disabled: Privacy first, zero database saving
  return false;
}
