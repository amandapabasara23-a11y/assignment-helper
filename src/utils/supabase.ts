import { createClient } from '@supabase/supabase-js';
import type { Assignment } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Sync an assignment to Supabase DB if environment keys are provided
 */
export async function syncAssignmentToSupabase(assignment: Assignment): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('assignments')
      .upsert({
        id: assignment.id,
        title: assignment.title,
        course_name: assignment.courseName,
        assignment_type: assignment.assignmentType,
        referencing_style: assignment.referencingStyle,
        data: assignment,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.warn('Supabase sync warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase sync failed:', err);
    return false;
  }
}

/**
 * Fetch all assignments from Supabase DB
 */
export async function fetchAssignmentsFromSupabase(): Promise<Assignment[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select('data')
      .order('updated_at', { ascending: false });

    if (error || !data) return null;
    return data.map(item => item.data as Assignment);
  } catch (err) {
    console.warn('Supabase fetch failed:', err);
    return null;
  }
}

/**
 * Delete assignment from Supabase DB
 */
export async function deleteAssignmentFromSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id);

    return !error;
  } catch (err) {
    console.warn('Supabase delete failed:', err);
    return false;
  }
}
