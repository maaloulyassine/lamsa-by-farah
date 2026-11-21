import { supabase } from './supabaseClient'

export async function listWeddingTasks(weddingId) {
  return supabase
    .from('tasks')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('task_date', { ascending: true })
    .order('task_time', { ascending: true, nullsFirst: false })
}

export async function setWeddingPlan(weddingId) {
  return supabase.rpc('set_wedding_plan', { p_wedding_id: weddingId })
}

export async function createTask(task) {
  return supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()
}

export async function updateTask(taskId, weddingId, updates) {
  return supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .eq('wedding_id', weddingId)
    .select()
    .single()
}

export async function deleteTask(taskId, weddingId) {
  return supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('wedding_id', weddingId)
}
