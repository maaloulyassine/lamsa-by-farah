import { supabase } from './supabaseClient'

export async function listWeddingExpenses(weddingId) {
  return supabase
    .from('expenses')
    .select('*, categories(id, name, slug, icon, sort_order)')
    .eq('wedding_id', weddingId)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false })
}

export async function listCategories() {
  return supabase
    .from('categories')
    .select('id, name, slug, icon, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
}

export async function createExpense(expense) {
  return supabase
    .from('expenses')
    .insert(expense)
    .select('*, categories(id, name, slug, icon, sort_order)')
    .single()
}

export async function updateExpense(expenseId, weddingId, updates) {
  return supabase
    .from('expenses')
    .update(updates)
    .eq('id', expenseId)
    .eq('wedding_id', weddingId)
    .select('*, categories(id, name, slug, icon, sort_order)')
    .single()
}

export async function deleteExpense(expenseId, weddingId) {
  return supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)
    .eq('wedding_id', weddingId)
}

export async function updateWeddingBudget(weddingId, totalBudget) {
  return supabase
    .from('weddings')
    .update({ total_budget: totalBudget })
    .eq('id', weddingId)
    .select()
    .single()
}
