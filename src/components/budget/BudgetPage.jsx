import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createExpense,
  deleteExpense,
  listCategories,
  listWeddingExpenses,
  updateExpense,
  updateWeddingBudget,
} from '../../services/expensesService'
import { listWeddingTasks } from '../../services/tasksService'
import { formatTnd, mutationErrorMessage } from '../../utils/format'
import { BudgetEditModal } from './BudgetEditModal'
import { ExpenseModal } from './ExpenseModal'
import { Flourish } from '../ui/Flourish'

const palette = ['#bd9278', '#dfc1a8', '#ead9ce', '#baaea3', '#d7b08c', '#715340', '#a97b63', '#8c7c70', '#c8a58d', '#9b7864']
const SUCCESS_TIMEOUT_MS = 4000

function CategoryIcon({ name }) {
  const paths = {
    building: <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-6h6v6" />,
    dress: <path d="M9 3h6l1 5 4 4-3 2-2-2 2 9H7l2-9-2 2-3-2 4-4 1-5Z" />,
    flower: <path d="M12 21c-1.6-4.1-1.5-7.5 0-10.2C13.6 8.1 16.3 7.5 18 9c1.8 1.6.7 4.5-2.1 5.5M12 21C10.4 16.9 10.5 13.5 12 10.8 10.4 8.1 7.7 7.5 6 9c-1.8 1.6-.7 4.5 2.1 5.5" />,
    cloche: <path d="M4 17h16M6 17a6 6 0 0 1 12 0M3 20h18M12 7V5" />,
    cake: <path d="M4 12h16v8H4zM7 12V9h10v3M9 9V6h6v3" />,
    camera: <><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></>,
    music: <path d="M9 18V5l10-2v13M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3Z" />,
    car: <path d="M3 13h18l-2-6H5l-2 6Zm2 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm14 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,
  }
  return (
    <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] || paths.building}
    </svg>
  )
}

function fetchBudgetData(weddingId) {
  return Promise.all([
    listWeddingExpenses(weddingId),
    listCategories(),
    listWeddingTasks(weddingId),
  ])
}

export function BudgetPage({ wedding, refreshWedding }) {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [summaryError, setSummaryError] = useState('')
  const [listError, setListError] = useState('')
  const [mutationError, setMutationError] = useState('')
  const [success, setSuccess] = useState('')
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const applyResults = useCallback(([expRes, catRes, taskRes]) => {
    const firstError = expRes.error || catRes.error || taskRes.error
    setSummaryError(firstError ? firstError.message : '')
    setListError(expRes.error ? expRes.error.message : '')
    setExpenses(expRes.error ? [] : expRes.data ?? [])
    if (!catRes.error) setCategories(catRes.data ?? [])
    if (!taskRes.error) setTasks(taskRes.data ?? [])
    setLoading(false)
  }, [])

  // Single loader: the effect and every reload share fetchBudgetData + applyResults.
  const reload = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true)
    applyResults(await fetchBudgetData(wedding.id))
  }, [wedding.id, applyResults])

  useEffect(() => {
    let active = true
    fetchBudgetData(wedding.id).then((results) => { if (active) applyResults(results) })
    return () => { active = false }
  }, [wedding.id, applyResults])

  // Auto-dismiss the 4a success toast even when no CSS animation fires.
  useEffect(() => {
    if (!success) return undefined
    const id = setTimeout(() => setSuccess(''), SUCCESS_TIMEOUT_MS)
    return () => clearTimeout(id)
  }, [success])

  const totalBudget = Number(wedding?.total_budget || 0)
  const hasDefinedBudget = totalBudget > 0
  const totalSpent = useMemo(() => expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0), [expenses])
  const planningEstimate = useMemo(() => tasks.reduce((sum, task) => sum + (Number(task.estimated_cost) || 0), 0), [tasks])
  const remaining = totalBudget - totalSpent
  // Budget = 0 with any expense is a legitimate overspend (remaining < 0).
  const isOverBudget = remaining < 0
  const percent = hasDefinedBudget ? Math.round((totalSpent / totalBudget) * 100) : null
  // Ring animates from its previous value (0 on mount) to the target: the registered --percent
  // property transitions in CSS; the value is applied one frame after mount so the change is visible.
  const ringTarget = Math.min(percent || 0, 100)
  const [ringPercent, setRingPercent] = useState(0)
  useEffect(() => {
    let inner = 0
    const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => setRingPercent(ringTarget)) })
    return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner) }
  }, [ringTarget])

  const categoryBreakdown = useMemo(() => {
    const enriched = categories.map((category, index) => {
      const catSpent = expenses
        .filter((expense) => expense.category_id === category.id)
        .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
      return {
        ...category,
        catSpent,
        percentOfSpent: totalSpent > 0 ? Math.round((catSpent / totalSpent) * 100) : 0,
        color: palette[index % palette.length],
      }
    })
    const spent = enriched.filter((category) => category.catSpent > 0).sort((a, b) => b.catSpent - a.catSpent || a.sort_order - b.sort_order)
    const empty = enriched.filter((category) => category.catSpent === 0).sort((a, b) => a.sort_order - b.sort_order)
    return [...spent, ...empty]
  }, [categories, expenses, totalSpent])

  const openNewExpense = () => { setEditingExpense(null); setExpenseModalOpen(true) }

  const saveExpense = async (values) => {
    if (editingExpense?.id) {
      const { error } = await updateExpense(editingExpense.id, wedding.id, values)
      if (error) throw error
      setSuccess('La dépense a été modifiée.')
    } else {
      const { error } = await createExpense({ ...values, wedding_id: wedding.id })
      if (error) throw error
      setSuccess('La dépense a été ajoutée.')
    }
    setMutationError('')
    await reload({ quiet: true })
  }

  const removeExpense = async (expense) => {
    // Native confirm, consistent with 4a task deletion (see Known issues).
    if (!window.confirm('Supprimer cette dépense ? Cette action est définitive.')) return
    setDeletingId(expense.id)
    setMutationError('')
    const { error } = await deleteExpense(expense.id, wedding.id)
    setDeletingId(null)
    if (error) {
      setMutationError(`La dépense n’a pas pu être supprimée. ${mutationErrorMessage(error, '')}`.trim())
      return
    }
    setSuccess('La dépense a été supprimée.')
    await reload({ quiet: true })
  }

  const saveBudget = async (nextBudget) => {
    const { error } = await updateWeddingBudget(wedding.id, nextBudget)
    if (error) throw error
    if (typeof refreshWedding === 'function') await refreshWedding()
    setSuccess('Le budget total a été mis à jour.')
  }

  let ringCenter
  if (isOverBudget) {
    ringCenter = <><strong>{hasDefinedBudget ? `${percent}% du\u00a0budget` : '—'}</strong><span className="overbudget-tag">Dépassement</span></>
  } else if (!hasDefinedBudget) {
    ringCenter = <><strong>—</strong><span>Non défini</span></>
  } else {
    ringCenter = <><strong>{percent}%</strong><span>utilisé</span></>
  }

  return (
    <section className="budget-page-container" aria-labelledby="budget-page-title">
      <div className="page-title">
        <div>
          <p className="eyebrow">Gestion financière</p>
          <h1 id="budget-page-title">Mon budget</h1>
          <Flourish className="title-flourish" />
        </div>
        <div className="budget-actions">
          <button className="secondary-button" onClick={() => setBudgetModalOpen(true)}>
            {hasDefinedBudget ? 'Modifier le budget' : 'Définir le budget'}
          </button>
          <button className="primary-button compact-button" onClick={openNewExpense}>+ Ajouter une dépense</button>
        </div>
      </div>

      {success && <p className="success-banner" role="status">{success}</p>}

      {!loading && !summaryError && isOverBudget && (
        <div className="budget-alert" role="alert">
          <div>
            <strong className="urgent-label">Budget dépassé de {formatTnd(Math.abs(remaining))}</strong>
            <p>Vos dépenses réelles dépassent le budget total prévu.</p>
          </div>
        </div>
      )}

      {!loading && !summaryError && !hasDefinedBudget && !isOverBudget && (
        <div className="budget-alert info" role="status">
          <div>
            <strong>Budget total : Non défini</strong>
            <p>Définissez votre budget global pour suivre vos dépenses.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="budget-skeleton" aria-busy="true" aria-label="Chargement du budget"><span /><span /><span /></div>
      ) : summaryError ? (
        <div className="error-banner" role="alert"><span>{summaryError}</span><button onClick={() => reload()}>Réessayer</button></div>
      ) : (
        <>
          <div className="budget-overview">
            <section className="content-card budget-ring-card" aria-label="Synthèse du budget">
              <div className={`ring ${isOverBudget ? 'ring-overbudget' : ''}`} style={{ '--percent': `${ringPercent}%` }} data-percent-target={ringTarget}>
                <div data-testid="budget-ring">{ringCenter}</div>
              </div>
              <div className="budget-totals">
                <div>
                  <span>Budget total prévu</span>
                  <strong data-testid="budget-total">{hasDefinedBudget || isOverBudget ? formatTnd(totalBudget) : 'Non défini'}</strong>
                </div>
                <div>
                  <span>Dépenses réelles payées</span>
                  <strong data-testid="budget-spent">{formatTnd(totalSpent)}</strong>
                </div>
                <div>
                  <span>Restant</span>
                  {isOverBudget
                    ? <strong className="alert-text" data-testid="budget-remaining">{formatTnd(Math.abs(remaining))} de dépassement</strong>
                    : <strong className="success-text" data-testid="budget-remaining">{formatTnd(remaining)} restant</strong>}
                </div>
              </div>
            </section>
            <section className="content-card budget-breakdown">
              <div className="card-heading"><div><p className="eyebrow">Ventilation</p><h2>Répartition par catégorie</h2></div></div>
              <div className="category-breakdown-list">
                {categoryBreakdown.map((category) => (
                  <div className="budget-line" key={category.id} data-category-slug={category.slug}>
                    <div>
                      <span className="dot" style={{ backgroundColor: category.color }} />
                      <span>{category.name}</span>
                      <b>
                        {formatTnd(category.catSpent)}
                        {category.catSpent > 0 ? ` · ${category.percentOfSpent}%` : ''}
                      </b>
                    </div>
                    <div className="progress-bar-track"><span className="progress-bar-fill" style={{ width: `${category.percentOfSpent}%`, backgroundColor: category.color }} /></div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <section className="content-card planner-estimate-card">
            <span>Estimations planning (indicatif)</span>
            <strong data-testid="planning-estimate">{formatTnd(planningEstimate)}</strong>
            <p>Coûts prévisionnels saisis dans le planning, non décomptés du budget restant.</p>
          </section>
        </>
      )}

      <section className="content-card expenses-card">
        <div className="card-heading"><div><p className="eyebrow">Historique des paiements</p><h2>Dépenses réelles</h2></div></div>
        {mutationError && (
          <div className="error-banner" role="alert"><span>{mutationError}</span><button onClick={() => setMutationError('')}>Fermer</button></div>
        )}
        {loading ? (
          <div className="loading-state">Chargement des dépenses...</div>
        ) : listError ? (
          <div className="error-banner" role="alert"><span>{listError}</span><button onClick={() => reload()}>Réessayer</button></div>
        ) : expenses.length === 0 ? (
          <div className="empty-day">
            <p>Aucune dépense enregistrée pour le moment.</p>
            <button className="text-button" onClick={openNewExpense}>Ajouter une première dépense</button>
          </div>
        ) : (
          <div className="expenses-list">
            {expenses.map((expense) => (
              <article className="expense-row" key={expense.id}>
                <span className="expense-icon"><CategoryIcon name={expense.categories?.icon} /></span>
                <div className="expense-info">
                  <strong>{expense.title}</strong>
                  <small>{expense.categories?.name} · {new Date(`${expense.expense_date}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</small>
                  {expense.notes && <p className="expense-notes">{expense.notes}</p>}
                </div>
                <b className="expense-amount">{formatTnd(expense.amount)}</b>
                <div className="expense-actions">
                  <button className="task-edit" onClick={() => { setEditingExpense(expense); setExpenseModalOpen(true) }}>Modifier</button>
                  <button className="task-delete" onClick={() => removeExpense(expense)} disabled={deletingId === expense.id}>
                    {deletingId === expense.id ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {expenseModalOpen && (
        <ExpenseModal
          key={editingExpense?.id || 'new-expense'}
          expense={editingExpense}
          categories={categories}
          onClose={() => setExpenseModalOpen(false)}
          onSave={saveExpense}
        />
      )}
      {budgetModalOpen && (
        <BudgetEditModal
          currentBudget={totalBudget}
          onClose={() => setBudgetModalOpen(false)}
          onSave={saveBudget}
        />
      )}
    </section>
  )
}
